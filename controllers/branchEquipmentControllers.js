const { BranchEquipment, Equipment, Branch } = require('../models/associations');

const createBranchEquipment = async (req, res) => {
    const { equipmentId, branchId, quantity } = req.body;

    try {
        const equipment = await Equipment.findByPk(equipmentId);
        if (!equipment) {
            return res.status(400).json({ msg: `No existe un equipo con el id ${equipmentId}` });
        }

        const branch = await Branch.findByPk(branchId);
        if (!branch) {
            return res.status(400).json({ msg: `No existe una sucursal con el id ${branchId}` });
        }

        const exists = await BranchEquipment.findOne({ where: { equipmentId, branchId } });
        if (exists) {
            return res.status(400).json({ msg: 'Este equipo ya está registrado en el inventario de la sucursal' });
        }

        const newBranchEquipment = await BranchEquipment.create({
            equipmentId, branchId, quantity: quantity || 0
        });

        const created = await BranchEquipment.findByPk(newBranchEquipment.id, {
            include: [{ model: Equipment, as: 'equipment' }]
        });

        res.status(201).json({
            msg: "Equipo agregado al inventario con éxito",
            branchEquipment: created
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al procesar datos" });
    }
};

const getBranchEquipmentByBranch = async (req, res) => {
    const { branchId } = req.params;

    try {
        const branchExists = await Branch.findByPk(branchId);
        if (!branchExists) {
            return res.status(404).json({ msg: `No existe una sucursal con el id ${branchId}` });
        }

        const equipments = await BranchEquipment.findAll({
            where: { branchId, state: true },
            include: [{ model: Equipment, as: 'equipment' }]
        });

        res.json(equipments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener el inventario de equipos de la sucursal" });
    }
};

const updateBranchEquipment = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    try {
        const branchEquipment = await BranchEquipment.findByPk(id);
        if (!branchEquipment) {
            return res.status(404).json({ msg: `No existe un registro de equipo con el id ${id}` });
        }

        await BranchEquipment.update({ quantity }, { where: { id } });

        const updated = await BranchEquipment.findByPk(id, {
            include: [{ model: Equipment, as: 'equipment' }]
        });

        res.json({ ok: true, branchEquipment: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar datos' });
    }
};

const deleteBranchEquipment = async (req, res) => {
    const { id } = req.params;

    try {
        const branchEquipment = await BranchEquipment.findByPk(id);
        if (!branchEquipment) {
            return res.status(404).json({ msg: `No existe un registro de equipo con el id ${id}` });
        }

        await branchEquipment.destroy();

        res.json({ ok: true, msg: 'Equipo eliminado del inventario con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar el equipo del inventario' });
    }
};

module.exports = {
    createBranchEquipment,
    getBranchEquipmentByBranch,
    updateBranchEquipment,
    deleteBranchEquipment
};
