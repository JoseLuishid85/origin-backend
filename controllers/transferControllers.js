const { Transfer, TransferDetail, Branch, Deposit, Inventory, Product } = require('../models/associations');
const sequelize = require('../config/database');

const createTransfer = async (req, res) => {
    const { branchIdOrigin, branchIdDest, date, observations, details } = req.body;

    if (!details || !details.length) {
        return res.status(400).json({ msg: 'El traslado debe contener al menos un producto' });
    }

    if (branchIdOrigin === branchIdDest) {
        return res.status(400).json({ msg: 'La sucursal origen y destino no pueden ser la misma' });
    }

    const transaction = await sequelize.transaction();

    try {
        const originBranch = await Branch.findByPk(branchIdOrigin);
        if (!originBranch) {
            await transaction.rollback();
            return res.status(400).json({ msg: `No existe una sucursal origen con el id ${branchIdOrigin}` });
        }

        const destBranch = await Branch.findByPk(branchIdDest);
        if (!destBranch) {
            await transaction.rollback();
            return res.status(400).json({ msg: `No existe una sucursal destino con el id ${branchIdDest}` });
        }

        const originDeposit = await Deposit.findOne({ where: { branchId: branchIdOrigin, main: true } });
        if (!originDeposit) {
            await transaction.rollback();
            return res.status(400).json({ msg: 'La sucursal origen no tiene un depósito principal asignado' });
        }

        const destDeposit = await Deposit.findOne({ where: { branchId: branchIdDest, main: true } });
        if (!destDeposit) {
            await transaction.rollback();
            return res.status(400).json({ msg: 'La sucursal destino no tiene un depósito principal asignado' });
        }

        for (const item of details) {
            const product = await Product.findByPk(item.productId);
            if (!product) {
                await transaction.rollback();
                return res.status(400).json({ msg: `No existe un producto con el id ${item.productId}` });
            }

            const originInventory = await Inventory.findOne({
                where: { productId: item.productId, depositId: originDeposit.id }
            });

            if (!originInventory) {
                await transaction.rollback();
                return res.status(400).json({
                    msg: `El producto "${product.name}" no tiene inventario en el depósito principal de la sucursal origen`
                });
            }

            if (originInventory.stock < item.quantity) {
                await transaction.rollback();
                return res.status(400).json({
                    msg: `Stock insuficiente para "${product.name}". Disponible: ${originInventory.stock}, solicitado: ${item.quantity}`
                });
            }
        }

        const newTransfer = await Transfer.create({
            branchIdOrigin, branchIdDest, date, observations
        }, { transaction });

        for (const item of details) {
            await TransferDetail.create({
                transferId: newTransfer.id,
                productId: item.productId,
                quantity: item.quantity
            }, { transaction });

            await Inventory.decrement('stock', {
                by: item.quantity,
                where: { productId: item.productId, depositId: originDeposit.id },
                transaction
            });

            const destInventory = await Inventory.findOne({
                where: { productId: item.productId, depositId: destDeposit.id }
            });

            if (destInventory) {
                await Inventory.increment('stock', {
                    by: item.quantity,
                    where: { productId: item.productId, depositId: destDeposit.id },
                    transaction
                });
            } else {
                await Inventory.create({
                    productId: item.productId,
                    branchId: branchIdDest,
                    depositId: destDeposit.id,
                    stock: item.quantity,
                    stockMin: 0,
                    stockOrder: 0
                }, { transaction });
            }
        }

        await transaction.commit();

        const transfer = await Transfer.findByPk(newTransfer.id, {
            include: [
                { model: Branch, as: 'branchOrigin', attributes: ['id', 'name'] },
                { model: Branch, as: 'branchDest', attributes: ['id', 'name'] },
                {
                    model: TransferDetail, as: 'details',
                    include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }]
                }
            ]
        });

        res.status(201).json({
            msg: "Traslado realizado con éxito",
            transfer
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ msg: "Error al procesar el traslado" });
    }
};

const getTransfers = async (req, res) => {
    try {
        const transfers = await Transfer.findAll({
            where: { state: true },
            include: [
                { model: Branch, as: 'branchOrigin', attributes: ['id', 'name'] },
                { model: Branch, as: 'branchDest', attributes: ['id', 'name'] },
                {
                    model: TransferDetail, as: 'details',
                    include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }]
                }
            ],
            order: [['date', 'DESC']]
        });

        res.json(transfers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener los traslados" });
    }
};

const getTransferById = async (req, res) => {
    const { id } = req.params;

    try {
        const transfer = await Transfer.findByPk(id, {
            include: [
                { model: Branch, as: 'branchOrigin', attributes: ['id', 'name'] },
                { model: Branch, as: 'branchDest', attributes: ['id', 'name'] },
                {
                    model: TransferDetail, as: 'details',
                    include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }]
                }
            ]
        });

        if (!transfer) {
            return res.status(404).json({ msg: `No existe un traslado con el id ${id}` });
        }

        res.json(transfer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener el traslado" });
    }
};

const getTransfersByBranch = async (req, res) => {
    const { branchId } = req.params;

    try {
        const branchExists = await Branch.findByPk(branchId);
        if (!branchExists) {
            return res.status(404).json({ msg: `No existe una sucursal con el id ${branchId}` });
        }

        const { Op } = require('sequelize');
        const transfers = await Transfer.findAll({
            where: {
                state: true,
                [Op.or]: [
                    { branchIdOrigin: branchId },
                    { branchIdDest: branchId }
                ]
            },
            include: [
                { model: Branch, as: 'branchOrigin', attributes: ['id', 'name'] },
                { model: Branch, as: 'branchDest', attributes: ['id', 'name'] },
                {
                    model: TransferDetail, as: 'details',
                    include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }]
                }
            ],
            order: [['date', 'DESC']]
        });

        res.json(transfers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener los traslados de la sucursal" });
    }
};

const changeStateTransfer = async (req, res) => {
    const { id } = req.params;

    try {
        const transfer = await Transfer.findByPk(id);
        if (!transfer) {
            return res.status(404).json({ msg: `No existe un traslado con el id ${id}` });
        }

        await Transfer.update({ state: !transfer.state }, { where: { id } });

        const transferChanged = await Transfer.findByPk(id);

        res.json({ ok: true, transfer: transferChanged });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al cambiar el estado del traslado' });
    }
};

const deleteTransfer = async (req, res) => {
    const { id } = req.params;

    try {
        const transfer = await Transfer.findByPk(id);
        if (!transfer) {
            return res.status(404).json({ msg: `No existe un traslado con el id ${id}` });
        }

        await TransferDetail.destroy({ where: { transferId: id } });
        await transfer.destroy();

        res.json({ ok: true, msg: 'Traslado eliminado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar el traslado' });
    }
};

module.exports = {
    createTransfer,
    getTransfers,
    getTransferById,
    getTransfersByBranch,
    changeStateTransfer,
    deleteTransfer
};
