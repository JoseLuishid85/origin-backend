const { Product, Department, ProductType, ProductUse } = require('../models/associations');

const createProduct = async (req, res) => {
    const data = req.body;
    try {
        // Opcional: Validar duplicado por nombre exacto si se requiere
        const productExists = await Product.findOne({ where: { name: data.name } });
        if (productExists) {
            return res.status(400).json({ msg: 'Ya existe un producto con ese nombre' });
        }

        const newProduct = await Product.create({
            name: data.name,
            packageType: data.packageType,
            packageQuantity: data.packageQuantity,
            departmentId: data.departmentId,
            productTypeId: data.productTypeId,
            productUseId: data.productUseId
        });

        res.status(201).json({
            msg: "Producto agregado con éxito",
            product: newProduct
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al procesar datos" });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { state: true },
            include: [
                { model: Department, as: 'department', attributes: ['name'] },
                { model: ProductType, as: 'productType', attributes: ['name'] },
                { model: ProductUse, as: 'productUse', attributes: ['name'] }
            ]
        });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener los productos" });
    }
};

const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByPk(id, {
            include: [
                { model: Department, as: 'department', attributes: ['name'] },
                { model: ProductType, as: 'productType', attributes: ['name'] },
                { model: ProductUse, as: 'productUse', attributes: ['name'] }
            ]
        });

        if (!product) {
            return res.status(404).json({ msg: `No existe un producto con el id ${id}` });
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener el producto" });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        await Product.update({
            name: data.name,
            packageType: data.packageType,
            packageQuantity: data.packageQuantity,
            departmentId: data.departmentId,
            productTypeId: data.productTypeId,
            productUseId: data.productUseId,
            state: data.state
        }, {
            where: { id }
        });

        const updatedProduct = await Product.findByPk(id, {
            include: [
                { model: Department, as: 'department', attributes: ['name'] },
                { model: ProductType, as: 'productType', attributes: ['name'] },
                { model: ProductUse, as: 'productUse', attributes: ['name'] }
            ]
        });

        res.json({ ok: true, product: updatedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar datos' });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await Product.update({ state: false }, { where: { id } });
        res.json({ ok: true, msg: `Producto con id ${id} desactivado con éxito` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar el producto' });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};