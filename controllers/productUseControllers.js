
const { Product, ProductUse } = require('../models/associations');

const createProductUse = async (req, res) => {
    const { name } = req.body;

    try {
        await ProductUse.sync();

        // 1. Validar si el uso de producto ya existe
        const useExists = await ProductUse.findOne({ where: { name } });
        if (useExists) {
            return res.status(400).json({
                msg: 'El uso de producto ya está registrado',
            });
        }

        // 2. Crear el registro
        const newProductUse = await ProductUse.create({ name });

        res.status(201).json({
            msg: "Uso de producto agregado con éxito",
            productUse: newProductUse
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al procesar datos"
        });
    }
};

const getProductUses = async (req, res) => {
    try {
        // Traemos solo los usos de producto activos
        const productUses = await ProductUse.findAll({
            where: { state: true }
        });

        res.json(productUses);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener los usos de producto"
        });
    }
};

const getProductUseById = async (req, res) => {
    const { id } = req.params;

    try {
        const productUse = await ProductUse.findByPk(id);

        if (!productUse) {
            return res.status(404).json({
                msg: `No existe un uso de producto con el id ${id}`
            });
        }

        res.json(productUse);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener el uso de producto"
        });
    }
};

const updateProductUse = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        // 1. Actualizar los datos
        await ProductUse.update({
            name
        }, {
            where: { id }
        });

        // 2. Buscar el registro actualizado para retornarlo
        const updatedProductUse = await ProductUse.findByPk(id);

        res.json({
            ok: true,
            productUse: updatedProductUse
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al procesar datos'
        });
    }
};

const changeStateProductUse = async (req, res) => {
    const { id } = req.params;

    try {
        // Borrado lógico deshabilitando el estado
        const productUse = await ProductUse.findByPk(id);

        await ProductUse.update({
            state: !productUse.state
        }, {
            where: { id }
        });

        const productUseCahnged = await ProductUse.findByPk(id);

        res.json({
            ok: true,
            productUse: productUseCahnged
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al desactivar el uso de producto'
        });
    }
};

const deleteProductUse = async (req, res) => {
    const { id } = req.params;

    try {

        const productUse = await ProductUse.findByPk(id);

        if (!productUse) {
            return res.status(404).json({
                msg: `No existe un uso de producto con el id ${id}`
            });
        }

        const productExists = await Product.findOne({
            where: { productUseId: id }
        });

        if (productExists) {
            return res.status(400).json({
                ok: false,
                msg: 'No se puede eliminar el uso de producto porque tiene productos asociados'
            });
        }

        await productUse.destroy();

        res.json({
            ok: true,
            msg: `Uso de producto fue eliminado con éxito`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al desactivar el uso de producto'
        });
    }
};

module.exports = {
    createProductUse,
    getProductUses,
    getProductUseById,
    updateProductUse,
    changeStateProductUse,
    deleteProductUse,
};