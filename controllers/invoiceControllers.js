const {
    Invoice, InvoiceDetail, InvoiceDetailPortion, InvoicePayment, Client, MobileStand, MobileStandPortion,
    MenuProduct, MenuProductPortion, Portion, User
} = require('../models/associations');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { normalizeClient } = require('./clientControllers');

const INVOICE_INCLUDE = [
    { model: MobileStand, as: 'mobileStand', attributes: ['id', 'name'] },
    { model: Client, as: 'client' },
    { model: User, as: 'user', attributes: ['id', 'name', 'lastName'] },
    {
        model: InvoiceDetail, as: 'details',
        include: [
            { model: MenuProduct, as: 'menuProduct', attributes: ['id', 'name', 'image'] },
            {
                model: InvoiceDetailPortion, as: 'portionItems',
                include: [{ model: Portion, as: 'portion', attributes: ['id', 'name', 'unitType'] }]
            }
        ]
    },
    { model: InvoicePayment, as: 'payments' }
];

const { USD_METHODS, BS_METHODS } = InvoicePayment;

// Diferencia máxima aceptada (en $) entre lo pagado y el total, por redondeo de la conversión
const PAYMENT_TOLERANCE_USD = 0.01;

const round2 = (n) => Math.round(n * 100) / 100;

const createInvoice = async (req, res) => {
    const { mobileStandId, clientId, client, observations, details, payments } = req.body;
    const exchangeRate = Number(req.body.exchangeRate);

    if (!(exchangeRate > 0)) {
        return res.status(400).json({ msg: 'Debe indicar la tasa de cambio (Bs por dólar) mayor a cero' });
    }

    if (!details || !details.length) {
        return res.status(400).json({ msg: 'La factura debe contener al menos un producto' });
    }

    if (!payments || !payments.length) {
        return res.status(400).json({ msg: 'La factura debe tener al menos un pago' });
    }

    for (const payment of payments) {
        if (!USD_METHODS.includes(payment.method) && !BS_METHODS.includes(payment.method)) {
            return res.status(400).json({ msg: `Método de pago no válido: ${payment.method}` });
        }
        if (!(Number(payment.amount) > 0)) {
            return res.status(400).json({ msg: 'Cada pago debe tener un monto mayor a cero' });
        }
    }

    // Validar líneas. Cada línea puede traer "portions" (por unidad) para personalizar la receta.
    const lines = [];
    const customPortionIds = new Set();
    for (const item of details) {
        const quantity = Number(item.quantity);
        if (!item.menuProductId || !Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({ msg: 'Cada línea de la factura debe tener un producto y una cantidad entera mayor a cero' });
        }

        let custom = null;
        if (Array.isArray(item.portions)) {
            custom = new Map();
            for (const p of item.portions) {
                const qty = Number(p.quantity);
                if (!p.portionId || !(qty >= 0)) {
                    return res.status(400).json({ msg: 'Las porciones personalizadas deben tener una porción y una cantidad válida' });
                }
                custom.set(Number(p.portionId), round2((custom.get(Number(p.portionId)) || 0) + qty));
                customPortionIds.add(Number(p.portionId));
            }
        }

        lines.push({ menuProductId: Number(item.menuProductId), quantity, custom });
    }

    let clientData = null;
    if (!clientId) {
        const { data, error } = normalizeClient(client || {});
        if (error) {
            return res.status(400).json({ msg: error });
        }
        clientData = data;
    }

    const transaction = await sequelize.transaction();

    try {
        const mobileStand = await MobileStand.findByPk(mobileStandId, { transaction });
        if (!mobileStand || !mobileStand.state) {
            await transaction.rollback();
            return res.status(400).json({ msg: `No existe un stand móvil activo con el id ${mobileStandId}` });
        }

        // Resolver el cliente: por id o buscando/creando por documento
        let invoiceClient;
        if (clientId) {
            invoiceClient = await Client.findByPk(clientId, { transaction });
            if (!invoiceClient) {
                await transaction.rollback();
                return res.status(400).json({ msg: `No existe un cliente con el id ${clientId}` });
            }
        } else {
            invoiceClient = await Client.findOne({
                where: { nationality: clientData.nationality, document: clientData.document },
                transaction
            });
            if (invoiceClient) {
                await invoiceClient.update({ name: clientData.name, phone: clientData.phone || invoiceClient.phone }, { transaction });
            } else {
                invoiceClient = await Client.create(clientData, { transaction });
            }
        }

        if (customPortionIds.size) {
            const found = await Portion.findAll({ where: { id: [...customPortionIds] }, attributes: ['id'], transaction });
            const missing = [...customPortionIds].find(id => !found.some(p => p.id === id));
            if (missing) {
                await transaction.rollback();
                return res.status(400).json({ msg: `No existe una porción con el id ${missing}` });
            }
        }

        // Cargar productos con su receta
        const menuProducts = await MenuProduct.findAll({
            where: { id: [...new Set(lines.map(l => l.menuProductId))] },
            include: [{ model: MenuProductPortion, as: 'recipeItems' }],
            transaction
        });

        const invoiceLines = [];
        const requiredPortions = new Map();

        for (const line of lines) {
            const menuProduct = menuProducts.find(p => p.id === line.menuProductId);
            if (!menuProduct || !menuProduct.state) {
                await transaction.rollback();
                return res.status(400).json({ msg: `No existe un producto del menú activo con el id ${line.menuProductId}` });
            }

            // Receta por unidad vs. lo que realmente se descuenta por unidad
            const recipe = new Map((menuProduct.recipeItems || []).map(r => [r.portionId, Number(r.quantity)]));
            const used = line.custom || recipe;

            const portionItems = [];
            for (const portionId of new Set([...recipe.keys(), ...used.keys()])) {
                const quantity = round2((used.get(portionId) || 0) * line.quantity);
                const recipeQuantity = round2((recipe.get(portionId) || 0) * line.quantity);
                if (!quantity && !recipeQuantity) continue;
                portionItems.push({ portionId, quantity, recipeQuantity });
                if (quantity > 0) {
                    requiredPortions.set(portionId, round2((requiredPortions.get(portionId) || 0) + quantity));
                }
            }

            const unitPrice = Number(menuProduct.price) || 0;
            invoiceLines.push({
                menuProductId: line.menuProductId,
                quantity: line.quantity,
                unitPrice,
                subtotal: round2(unitPrice * line.quantity),
                portionItems
            });
        }

        // Validar stock de porciones en el stand antes de escribir
        for (const [portionId, required] of requiredPortions) {
            const stock = await MobileStandPortion.findOne({
                where: { portionId, mobileStandId },
                include: [{ model: Portion, as: 'portion', attributes: ['name', 'unitType'] }],
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            const available = stock ? Number(stock.stock) : 0;
            if (available < required) {
                const portion = stock?.portion || await Portion.findByPk(portionId, { transaction });
                await transaction.rollback();
                return res.status(400).json({
                    msg: `Stock insuficiente de "${portion?.name || portionId}" en el stand. Disponible: ${available}, requerido: ${required}`
                });
            }
        }

        const totalUsd = round2(invoiceLines.reduce((sum, l) => sum + l.subtotal, 0));
        const totalBs = round2(totalUsd * exchangeRate);

        // Cada pago se guarda en la moneda de su método
        const paymentRows = payments.map(p => {
            const amount = round2(Number(p.amount));
            const isUsd = USD_METHODS.includes(p.method);
            return {
                method: p.method,
                amountUsd: isUsd ? amount : 0,
                amountBs: isUsd ? 0 : amount,
                reference: p.reference ? String(p.reference).trim() : null
            };
        });

        const paidUsd = paymentRows.reduce((sum, p) => sum + p.amountUsd + p.amountBs / exchangeRate, 0);
        if (Math.abs(paidUsd - totalUsd) > PAYMENT_TOLERANCE_USD) {
            await transaction.rollback();
            const diffBs = round2((totalUsd - paidUsd) * exchangeRate);
            return res.status(400).json({
                msg: diffBs > 0
                    ? `Los pagos no cubren el total. Faltan Bs ${diffBs.toFixed(2)} ($${(totalUsd - paidUsd).toFixed(2)})`
                    : `Los pagos superan el total por Bs ${Math.abs(diffBs).toFixed(2)} ($${(paidUsd - totalUsd).toFixed(2)})`
            });
        }

        const newInvoice = await Invoice.create({
            mobileStandId,
            clientId: invoiceClient.id,
            userId: req.usuario?.id || null,
            date: new Date(),
            totalUsd,
            totalBs,
            exchangeRate,
            observations
        }, { transaction });

        for (const { portionItems, ...line } of invoiceLines) {
            const detail = await InvoiceDetail.create({ invoiceId: newInvoice.id, ...line }, { transaction });
            if (portionItems.length) {
                await InvoiceDetailPortion.bulkCreate(
                    portionItems.map(p => ({ invoiceDetailId: detail.id, ...p })),
                    { transaction }
                );
            }
        }

        await InvoicePayment.bulkCreate(
            paymentRows.map(p => ({ invoiceId: newInvoice.id, ...p })),
            { transaction }
        );

        for (const [portionId, required] of requiredPortions) {
            await MobileStandPortion.decrement('stock', {
                by: required,
                where: { portionId, mobileStandId },
                transaction
            });
        }

        await transaction.commit();

        const invoice = await Invoice.findByPk(newInvoice.id, { include: INVOICE_INCLUDE });

        res.status(201).json({
            msg: "Factura registrada con éxito",
            invoice
        });
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        console.error(error);
        res.status(500).json({ msg: "Error al procesar la factura" });
    }
};

const getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.findAll({
            include: INVOICE_INCLUDE,
            order: [['date', 'DESC']]
        });

        res.json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener las facturas" });
    }
};

const getInvoiceById = async (req, res) => {
    const { id } = req.params;

    try {
        const invoice = await Invoice.findByPk(id, { include: INVOICE_INCLUDE });
        if (!invoice) {
            return res.status(404).json({ msg: `No existe una factura con el id ${id}` });
        }

        res.json(invoice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener la factura" });
    }
};

// Opcional: ?date=YYYY-MM-DD para filtrar por día
const getInvoicesByStand = async (req, res) => {
    const { mobileStandId } = req.params;
    const { date } = req.query;

    try {
        const mobileStandExists = await MobileStand.findByPk(mobileStandId);
        if (!mobileStandExists) {
            return res.status(404).json({ msg: `No existe un stand móvil con el id ${mobileStandId}` });
        }

        const where = { mobileStandId };
        if (date) {
            where.date = {
                [Op.gte]: new Date(`${date}T00:00:00`),
                [Op.lt]: new Date(new Date(`${date}T00:00:00`).getTime() + 24 * 60 * 60 * 1000)
            };
        }

        const invoices = await Invoice.findAll({
            where,
            include: INVOICE_INCLUDE,
            order: [['date', 'DESC']]
        });

        res.json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener las facturas del stand" });
    }
};

// Anula la factura y devuelve al stand las porciones descontadas
const cancelInvoice = async (req, res) => {
    const { id } = req.params;

    const transaction = await sequelize.transaction();

    try {
        const invoice = await Invoice.findByPk(id, {
            include: [{
                model: InvoiceDetail, as: 'details',
                include: [{ model: InvoiceDetailPortion, as: 'portionItems' }]
            }],
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!invoice) {
            await transaction.rollback();
            return res.status(404).json({ msg: `No existe una factura con el id ${id}` });
        }
        if (!invoice.state) {
            await transaction.rollback();
            return res.status(400).json({ msg: 'La factura ya se encuentra anulada' });
        }

        for (const detail of invoice.details) {
            for (const p of detail.portionItems) {
                if (!(Number(p.quantity) > 0)) continue;
                const [stock] = await MobileStandPortion.findOrCreate({
                    where: { portionId: p.portionId, mobileStandId: invoice.mobileStandId },
                    defaults: { stock: 0, stockMin: 0, stockOrder: 0 },
                    transaction
                });
                await stock.increment('stock', { by: Number(p.quantity), transaction });
            }
        }

        await invoice.update({ state: false }, { transaction });

        await transaction.commit();

        const invoiceChanged = await Invoice.findByPk(id, { include: INVOICE_INCLUDE });

        res.json({ ok: true, msg: 'Factura anulada con éxito', invoice: invoiceChanged });
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al anular la factura' });
    }
};

module.exports = {
    createInvoice,
    getInvoices,
    getInvoiceById,
    getInvoicesByStand,
    cancelInvoice
};
