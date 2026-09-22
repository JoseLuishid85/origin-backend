const { Portion } = require('../models/associations');

const createPortion = async (req, res) => {
    const { name, unitType } = req.body;

    try {
        const portionExists = await Portion.findOne({ where: { name } });
        if (portionExists) {
            return res.status(400).json({ msg: 'Ya existe una porción con ese nombre' });
        }

        const newPortion = await Portion.create({ name, unitType });

        res.status(201).json({
            msg: "Porción agregada con éxito",
            portion: newPortion
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al procesar datos" });
    }
};

const getPortions = async (req, res) => {
    try {
        const portions = await Portion.findAll({ where: { state: true } });
        res.json(portions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener las porciones" });
    }
};

const getPortionById = async (req, res) => {
    const { id } = req.params;

    try {
        const portion = await Portion.findByPk(id);
        if (!portion) {
            return res.status(404).json({ msg: `No existe una porción con el id ${id}` });
        }
        res.json(portion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener la porción" });
    }
};

const updatePortion = async (req, res) => {
    const { id } = req.params;
    const { name, unitType, state } = req.body;

    try {
        await Portion.update({ name, unitType, state }, { where: { id } });

        const updatedPortion = await Portion.findByPk(id);

        res.json({ ok: true, portion: updatedPortion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar datos' });
    }
};

const deletePortion = async (req, res) => {
    const { id } = req.params;

    try {
        const portion = await Portion.findByPk(id);
        if (!portion) {
            return res.status(404).json({ msg: `No existe una porción con el id ${id}` });
        }

        await Portion.update({ state: false }, { where: { id } });
        res.json({ ok: true, msg: `Porción con id ${id} desactivada con éxito` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar la porción' });
    }
};

module.exports = {
    createPortion,
    getPortions,
    getPortionById,
    updatePortion,
    deletePortion
};
