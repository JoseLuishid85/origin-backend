const { MobileStand } = require('../models/associations');

const createMobileStand = async (req, res) => {
    const { name, location } = req.body;

    try {
        const mobileStandExists = await MobileStand.findOne({ where: { name } });
        if (mobileStandExists) {
            return res.status(400).json({ msg: 'Ya existe un stand móvil con ese nombre' });
        }

        const newMobileStand = await MobileStand.create({ name, location });

        res.status(201).json({
            msg: "Stand móvil agregado con éxito",
            mobileStand: newMobileStand
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al procesar datos" });
    }
};

const getMobileStands = async (req, res) => {
    try {
        const mobileStands = await MobileStand.findAll({ where: { state: true } });
        res.json(mobileStands);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener los stands móviles" });
    }
};

const getMobileStandById = async (req, res) => {
    const { id } = req.params;

    try {
        const mobileStand = await MobileStand.findByPk(id);
        if (!mobileStand) {
            return res.status(404).json({ msg: `No existe un stand móvil con el id ${id}` });
        }
        res.json(mobileStand);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener el stand móvil" });
    }
};

const updateMobileStand = async (req, res) => {
    const { id } = req.params;
    const { name, location, state } = req.body;

    try {
        await MobileStand.update({ name, location, state }, { where: { id } });

        const updatedMobileStand = await MobileStand.findByPk(id);

        res.json({ ok: true, mobileStand: updatedMobileStand });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar datos' });
    }
};

const deleteMobileStand = async (req, res) => {
    const { id } = req.params;

    try {
        const mobileStand = await MobileStand.findByPk(id);
        if (!mobileStand) {
            return res.status(404).json({ msg: `No existe un stand móvil con el id ${id}` });
        }

        await MobileStand.update({ state: false }, { where: { id } });
        res.json({ ok: true, msg: `Stand móvil con id ${id} desactivado con éxito` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar el stand móvil' });
    }
};

module.exports = {
    createMobileStand,
    getMobileStands,
    getMobileStandById,
    updateMobileStand,
    deleteMobileStand
};
