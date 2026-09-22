const path = require('path');
const fs = require('fs');
const { MenuProduct } = require('../models/associations');

const createMenuProduct = async (req, res) => {
    const { name, price } = req.body;

    try {
        const menuProductExists = await MenuProduct.findOne({ where: { name } });
        if (menuProductExists) {
            return res.status(400).json({ msg: 'Ya existe un producto del menú con ese nombre' });
        }

        const image = req.file ? `/uploads/menu-products/${req.file.filename}` : null;

        const newMenuProduct = await MenuProduct.create({ name, image, price });

        res.status(201).json({
            msg: "Producto del menú agregado con éxito",
            menuProduct: newMenuProduct
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al procesar datos" });
    }
};

const getMenuProducts = async (req, res) => {
    try {
        const menuProducts = await MenuProduct.findAll({ where: { state: true } });
        res.json(menuProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener los productos del menú" });
    }
};

const getMenuProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const menuProduct = await MenuProduct.findByPk(id);
        if (!menuProduct) {
            return res.status(404).json({ msg: `No existe un producto del menú con el id ${id}` });
        }
        res.json(menuProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener el producto del menú" });
    }
};

const updateMenuProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, state } = req.body;

    try {
        const menuProduct = await MenuProduct.findByPk(id);
        if (!menuProduct) {
            return res.status(404).json({ msg: `No existe un producto del menú con el id ${id}` });
        }

        const updateData = { name, price };
        if (state !== undefined) {
            updateData.state = state === true || state === 'true';
        }

        if (req.file) {
            updateData.image = `/uploads/menu-products/${req.file.filename}`;
            if (menuProduct.image) {
                fs.unlink(path.join(__dirname, '..', menuProduct.image), () => {});
            }
        }

        await MenuProduct.update(updateData, { where: { id } });

        const updatedMenuProduct = await MenuProduct.findByPk(id);

        res.json({ ok: true, menuProduct: updatedMenuProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar datos' });
    }
};

const deleteMenuProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const menuProduct = await MenuProduct.findByPk(id);
        if (!menuProduct) {
            return res.status(404).json({ msg: `No existe un producto del menú con el id ${id}` });
        }

        await MenuProduct.update({ state: false }, { where: { id } });
        res.json({ ok: true, msg: `Producto del menú con id ${id} desactivado con éxito` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar el producto del menú' });
    }
};

module.exports = {
    createMenuProduct,
    getMenuProducts,
    getMenuProductById,
    updateMenuProduct,
    deleteMenuProduct
};
