const ProductType = require('../models/ProductType');

const createProductType = async (req, res) => {
    const { name } = req.body;

    try {
        await ProductType.sync();

        // 1. Validar si el tipo de producto ya existe
        const typeExists = await ProductType.findOne({ where: { name } });
        if (typeExists) {
            return res.status(400).json({
                msg: 'El tipo de producto ya está registrado',
            });
        }

        // 2. Crear el registro
        const newProductType = await ProductType.create({ name });

        res.status(201).json({
            msg: "Tipo de producto agregado con éxito",
            productType: newProductType
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al procesar datos"
        });
    }
};

const getProductTypes = async (req, res) => {
    try {
        // Traemos solo los tipos de producto activos
        const productTypes = await ProductType.findAll({
            where: { state: true }
        });

        res.json(productTypes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener los tipos de producto"
        });
    }
};

const getProductTypeById = async (req, res) => {
    const { id } = req.params;

    try {
        const productType = await ProductType.findByPk(id);

        if (!productType) {
            return res.status(404).json({
                msg: `No existe un tipo de producto con el id ${id}`
            });
        }

        res.json(productType);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener el tipo de producto"
        });
    }
};

const updateProductType = async (req, res) => {
    const { id } = req.params;
    const { name, state } = req.body;

    try {
        // 1. Actualizar los datos
        await ProductType.update({
            name,
            state
        }, {
            where: { id }
        });

        // 2. Buscar el registro actualizado para retornarlo
        const updatedProductType = await ProductType.findByPk(id);

        res.json({
            ok: true,
            productType: updatedProductType
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al procesar datos'
        });
    }
};

const deleteProductType = async (req, res) => {
    const { id } = req.params;

    try {
        // Borrado lógico deshabilitando el estado
        await ProductType.update({
            state: false
        }, {
            where: { id }
        });

        res.json({
            ok: true,
            msg: `Tipo de producto con id ${id} desactivado con éxito`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al desactivar el tipo de producto'
        });
    }
};

module.exports = {
    createProductType,
    getProductTypes,
    getProductTypeById,
    updateProductType,
    deleteProductType,
};