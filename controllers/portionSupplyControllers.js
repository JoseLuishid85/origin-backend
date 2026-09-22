const { PortionSupply, PortionSupplyDetail, MobileStand, MobileStandPortion, Portion } = require('../models/associations');
const sequelize = require('../config/database');

const DETAIL_INCLUDE = {
    model: PortionSupplyDetail, as: 'details',
    include: [
        { model: Portion, as: 'portion', attributes: ['id', 'name', 'unitType'] }
    ]
};

const createPortionSupply = async (req, res) => {
    const { mobileStandId, date, observations, details } = req.body;

    if (!details || !details.length) {
        return res.status(400).json({ msg: 'El abastecimiento debe contener al menos una porción' });
    }

    for (const item of details) {
        if (!item.portionId || !item.quantity || item.quantity <= 0) {
            return res.status(400).json({ msg: 'Cada línea del abastecimiento debe tener una porción y una cantidad mayor a cero' });
        }
    }

    const transaction = await sequelize.transaction();

    try {
        const mobileStand = await MobileStand.findByPk(mobileStandId);
        if (!mobileStand) {
            await transaction.rollback();
            return res.status(400).json({ msg: `No existe un stand móvil con el id ${mobileStandId}` });
        }

        for (const item of details) {
            const portion = await Portion.findByPk(item.portionId);
            if (!portion) {
                await transaction.rollback();
                return res.status(400).json({ msg: `No existe una porción con el id ${item.portionId}` });
            }
        }

        const newPortionSupply = await PortionSupply.create({
            mobileStandId, date, observations
        }, { transaction });

        for (const item of details) {
            await PortionSupplyDetail.create({
                portionSupplyId: newPortionSupply.id,
                portionId: item.portionId,
                quantity: item.quantity
            }, { transaction });

            const stock = await MobileStandPortion.findOne({
                where: { portionId: item.portionId, mobileStandId },
                transaction
            });

            if (stock) {
                await MobileStandPortion.increment('stock', {
                    by: item.quantity,
                    where: { portionId: item.portionId, mobileStandId },
                    transaction
                });
            } else {
                await MobileStandPortion.create({
                    portionId: item.portionId,
                    mobileStandId,
                    stock: item.quantity,
                    stockMin: 0,
                    stockOrder: 0
                }, { transaction });
            }
        }

        await transaction.commit();

        const portionSupply = await PortionSupply.findByPk(newPortionSupply.id, {
            include: [
                { model: MobileStand, as: 'mobileStand', attributes: ['id', 'name'] },
                DETAIL_INCLUDE
            ]
        });

        res.status(201).json({
            msg: "Abastecimiento registrado con éxito",
            portionSupply
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ msg: "Error al procesar el abastecimiento" });
    }
};

const getPortionSupplies = async (req, res) => {
    try {
        const portionSupplies = await PortionSupply.findAll({
            where: { state: true },
            include: [
                { model: MobileStand, as: 'mobileStand', attributes: ['id', 'name'] },
                DETAIL_INCLUDE
            ],
            order: [['date', 'DESC']]
        });

        res.json(portionSupplies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener los abastecimientos" });
    }
};

const getPortionSupplyById = async (req, res) => {
    const { id } = req.params;

    try {
        const portionSupply = await PortionSupply.findByPk(id, {
            include: [
                { model: MobileStand, as: 'mobileStand', attributes: ['id', 'name'] },
                DETAIL_INCLUDE
            ]
        });

        if (!portionSupply) {
            return res.status(404).json({ msg: `No existe un abastecimiento con el id ${id}` });
        }

        res.json(portionSupply);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener el abastecimiento" });
    }
};

const getPortionSuppliesByStand = async (req, res) => {
    const { mobileStandId } = req.params;

    try {
        const mobileStandExists = await MobileStand.findByPk(mobileStandId);
        if (!mobileStandExists) {
            return res.status(404).json({ msg: `No existe un stand móvil con el id ${mobileStandId}` });
        }

        const portionSupplies = await PortionSupply.findAll({
            where: { mobileStandId, state: true },
            include: [
                { model: MobileStand, as: 'mobileStand', attributes: ['id', 'name'] },
                DETAIL_INCLUDE
            ],
            order: [['date', 'DESC']]
        });

        res.json(portionSupplies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener los abastecimientos del stand" });
    }
};

const changeStatePortionSupply = async (req, res) => {
    const { id } = req.params;

    try {
        const portionSupply = await PortionSupply.findByPk(id);
        if (!portionSupply) {
            return res.status(404).json({ msg: `No existe un abastecimiento con el id ${id}` });
        }

        await PortionSupply.update({ state: !portionSupply.state }, { where: { id } });

        const portionSupplyChanged = await PortionSupply.findByPk(id);

        res.json({ ok: true, portionSupply: portionSupplyChanged });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al cambiar el estado del abastecimiento' });
    }
};

const deletePortionSupply = async (req, res) => {
    const { id } = req.params;

    try {
        const portionSupply = await PortionSupply.findByPk(id);
        if (!portionSupply) {
            return res.status(404).json({ msg: `No existe un abastecimiento con el id ${id}` });
        }

        await PortionSupplyDetail.destroy({ where: { portionSupplyId: id } });
        await portionSupply.destroy();

        res.json({ ok: true, msg: 'Abastecimiento eliminado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar el abastecimiento' });
    }
};

module.exports = {
    createPortionSupply,
    getPortionSupplies,
    getPortionSupplyById,
    getPortionSuppliesByStand,
    changeStatePortionSupply,
    deletePortionSupply
};
