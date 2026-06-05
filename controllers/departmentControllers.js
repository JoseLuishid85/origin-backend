const Department = require('../models/Department');

const createDepartment = async (req, res) => {
    const { name } = req.body;

    try {
        // Asegurar que la tabla exista/esté sincronizada si lo requieres como en User
        await Department.sync();

        // 1. Validar si el departamento ya existe
        const departmentExists = await Department.findOne({ where: { name } });
        if (departmentExists) {
            return res.status(400).json({
                msg: 'El departamento ya está registrado',
            });
        }

        // 2. Crear el registro
        const newDepartment = await Department.create({ name });

        res.status(201).json({
            msg: "Departamento agregado con éxito",
            department: newDepartment
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al procesar datos"
        });
    }
};

const getDepartments = async (req, res) => {
    try {
        // Traemos solo los departamentos activos (state: true)
        const departments = await Department.findAll({
            where: { state: true }
        });

        res.json(departments);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener los departamentos"
        });
    }
};

const getDepartmentById = async (req, res) => {
    const { id } = req.params;

    try {
        const department = await Department.findByPk(id);

        if (!department) {
            return res.status(404).json({
                msg: `No existe un departamento con el id ${id}`
            });
        }

        res.json(department);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener el departamento"
        });
    }
};

const updateDepartment = async (req, res) => {
    const { id } = req.params;
    const { name, state } = req.body;

    try {
        // 1. Actualizar los datos del departamento
        await Department.update({
            name,
            state
        }, {
            where: { id }
        });

        // 2. Buscar el departamento actualizado para retornarlo
        const updatedDepartment = await Department.findByPk(id);

        res.json({
            ok: true,
            department: updatedDepartment
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al procesar datos'
        });
    }
};

const deleteDepartment = async (req, res) => {
    const { id } = req.params;

    try {
        // Borrado lógico: cambiamos 'state' a false para no romper el historial de productos
        await Department.update({
            state: false
        }, {
            where: { id }
        });

        res.json({
            ok: true,
            msg: `Departamento con id ${id} desactivado con éxito`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al desactivar el departamento'
        });
    }
};

module.exports = {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
};