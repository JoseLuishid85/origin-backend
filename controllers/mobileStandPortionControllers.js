const { MobileStandPortion, Portion, MobileStand } = require('../models/associations');
const { Op, col } = require('sequelize');

const createMobileStandPortion = async (req, res) => {
    const { portionId, mobileStandId, stock, stockMin, stockOrder } = req.body;

    try {
        const portion = await Portion.findByPk(portionId);
        if (!portion) {
            return res.status(400).json({ msg: `No existe una porción con el id ${portionId}` });
        }

        const mobileStand = await MobileStand.findByPk(mobileStandId);
        if (!mobileStand) {
            return res.status(400).json({ msg: `No existe un stand móvil con el id ${mobileStandId}` });
        }

        const exists = await MobileStandPortion.findOne({ where: { portionId, mobileStandId } });
        if (exists) {
            return res.status(400).json({ msg: 'Esta porción ya está registrada en el inventario del stand' });
        }

        const newMobileStandPortion = await MobileStandPortion.create({
            portionId, mobileStandId, stock: stock || 0, stockMin: stockMin || 0, stockOrder: stockOrder || 0
        });

        const created = await MobileStandPortion.findByPk(newMobileStandPortion.id, {
            include: [{ model: Portion, as: 'portion' }]
        });

        res.status(201).json({
            msg: "Porción agregada al inventario del stand con éxito",
            mobileStandPortion: created
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al procesar datos" });
    }
};

const getPortionStockByStand = async (req, res) => {
    const { mobileStandId } = req.params;

    try {
        const mobileStandExists = await MobileStand.findByPk(mobileStandId);
        if (!mobileStandExists) {
            return res.status(404).json({ msg: `No existe un stand móvil con el id ${mobileStandId}` });
        }

        const portionStocks = await MobileStandPortion.findAll({
            where: { mobileStandId, state: true },
            include: [{ model: Portion, as: 'portion' }]
        });

        res.json(portionStocks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener el inventario de porciones del stand" });
    }
};

const getLowStockByStand = async (req, res) => {
    const { mobileStandId } = req.params;

    try {
        const mobileStandExists = await MobileStand.findByPk(mobileStandId);
        if (!mobileStandExists) {
            return res.status(404).json({ msg: `No existe un stand móvil con el id ${mobileStandId}` });
        }

        const portionStocks = await MobileStandPortion.findAll({
            where: {
                mobileStandId,
                state: true,
                stock: { [Op.lte]: col('stockMin') }
            },
            include: [{ model: Portion, as: 'portion' }]
        });

        res.json(portionStocks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener las porciones en estado crítico del stand" });
    }
};

const updateMobileStandPortion = async (req, res) => {
    const { id } = req.params;
    const { stock, stockMin, stockOrder } = req.body;

    try {
        const mobileStandPortion = await MobileStandPortion.findByPk(id);
        if (!mobileStandPortion) {
            return res.status(404).json({ msg: `No existe un registro de porción con el id ${id}` });
        }

        await MobileStandPortion.update({ stock, stockMin, stockOrder }, { where: { id } });

        const updated = await MobileStandPortion.findByPk(id, {
            include: [{ model: Portion, as: 'portion' }]
        });

        res.json({ ok: true, mobileStandPortion: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar datos' });
    }
};

const deleteMobileStandPortion = async (req, res) => {
    const { id } = req.params;

    try {
        const mobileStandPortion = await MobileStandPortion.findByPk(id);
        if (!mobileStandPortion) {
            return res.status(404).json({ msg: `No existe un registro de porción con el id ${id}` });
        }

        await mobileStandPortion.destroy();

        res.json({ ok: true, msg: 'Porción eliminada del inventario del stand con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar la porción del inventario del stand' });
    }
};

module.exports = {
    createMobileStandPortion,
    getPortionStockByStand,
    getLowStockByStand,
    updateMobileStandPortion,
    deleteMobileStandPortion
};
