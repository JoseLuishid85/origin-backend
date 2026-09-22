const { MenuProductPortion, MenuProduct, Portion } = require('../models/associations');

const createMenuProductPortion = async (req, res) => {
    const { menuProductId, portionId, quantity } = req.body;

    try {
        const menuProduct = await MenuProduct.findByPk(menuProductId);
        if (!menuProduct) {
            return res.status(400).json({ msg: `No existe un producto del menú con el id ${menuProductId}` });
        }

        const portion = await Portion.findByPk(portionId);
        if (!portion) {
            return res.status(400).json({ msg: `No existe una porción con el id ${portionId}` });
        }

        const exists = await MenuProductPortion.findOne({ where: { menuProductId, portionId } });
        if (exists) {
            return res.status(400).json({ msg: 'Esta porción ya está registrada en la receta de este producto del menú' });
        }

        const newMenuProductPortion = await MenuProductPortion.create({ menuProductId, portionId, quantity });

        const created = await MenuProductPortion.findByPk(newMenuProductPortion.id, {
            include: [{ model: Portion, as: 'portion' }]
        });

        res.status(201).json({
            msg: "Ítem de receta agregado con éxito",
            menuProductPortion: created
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al procesar datos" });
    }
};

const getRecipeByMenuProduct = async (req, res) => {
    const { menuProductId } = req.params;

    try {
        const menuProductExists = await MenuProduct.findByPk(menuProductId);
        if (!menuProductExists) {
            return res.status(404).json({ msg: `No existe un producto del menú con el id ${menuProductId}` });
        }

        const recipeItems = await MenuProductPortion.findAll({
            where: { menuProductId },
            include: [{ model: Portion, as: 'portion' }]
        });

        res.json(recipeItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener la receta del producto del menú" });
    }
};

const updateMenuProductPortion = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    try {
        const menuProductPortion = await MenuProductPortion.findByPk(id);
        if (!menuProductPortion) {
            return res.status(404).json({ msg: `No existe un ítem de receta con el id ${id}` });
        }

        await MenuProductPortion.update({ quantity }, { where: { id } });

        const updated = await MenuProductPortion.findByPk(id, {
            include: [{ model: Portion, as: 'portion' }]
        });

        res.json({ ok: true, menuProductPortion: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar datos' });
    }
};

const deleteMenuProductPortion = async (req, res) => {
    const { id } = req.params;

    try {
        const menuProductPortion = await MenuProductPortion.findByPk(id);
        if (!menuProductPortion) {
            return res.status(404).json({ msg: `No existe un ítem de receta con el id ${id}` });
        }

        await menuProductPortion.destroy();

        res.json({ ok: true, msg: 'Ítem de receta eliminado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar el ítem de receta' });
    }
};

module.exports = {
    createMenuProductPortion,
    getRecipeByMenuProduct,
    updateMenuProductPortion,
    deleteMenuProductPortion
};
