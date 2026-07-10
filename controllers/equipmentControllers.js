const { Equipment } = require('../models/associations');

const createEquipment = async (req, res) => {
    const { name, type, brand } = req.body;

    try {
        const equipmentExists = await Equipment.findOne({ where: { name } });
        if (equipmentExists) {
            return res.status(400).json({ msg: 'Ya existe un equipo con ese nombre' });
        }

        const newEquipment = await Equipment.create({ name, type, brand });

        res.status(201).json({
            msg: "Equipo agregado con éxito",
            equipment: newEquipment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al procesar datos" });
    }
};

const getEquipments = async (req, res) => {
    try {
        const equipments = await Equipment.findAll({ where: { state: true } });
        res.json(equipments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener los equipos" });
    }
};

const getEquipmentById = async (req, res) => {
    const { id } = req.params;

    try {
        const equipment = await Equipment.findByPk(id);
        if (!equipment) {
            return res.status(404).json({ msg: `No existe un equipo con el id ${id}` });
        }
        res.json(equipment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener el equipo" });
    }
};

const updateEquipment = async (req, res) => {
    const { id } = req.params;
    const { name, type, brand, state } = req.body;

    try {
        await Equipment.update({ name, type, brand, state }, { where: { id } });

        const updatedEquipment = await Equipment.findByPk(id);

        res.json({ ok: true, equipment: updatedEquipment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar datos' });
    }
};

const deleteEquipment = async (req, res) => {
    const { id } = req.params;

    try {
        const equipment = await Equipment.findByPk(id);
        if (!equipment) {
            return res.status(404).json({ msg: `No existe un equipo con el id ${id}` });
        }

        await Equipment.update({ state: false }, { where: { id } });
        res.json({ ok: true, msg: `Equipo con id ${id} desactivado con éxito` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar el equipo' });
    }
};

module.exports = {
    createEquipment,
    getEquipments,
    getEquipmentById,
    updateEquipment,
    deleteEquipment
};
