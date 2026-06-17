const { Inventory, Product, Branch, Deposit } = require('../models/associations');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const createInventory = async (req, res) => {
    const { productId, branchId, depositId, stock, stockMin, stockOrder } = req.body;

    try {
        const productExists = await Product.findByPk(productId);
        if (!productExists) {
            return res.status(400).json({ msg: `No existe un producto con el id ${productId}` });
        }

        const branchExists = await Branch.findByPk(branchId);
        if (!branchExists) {
            return res.status(400).json({ msg: `No existe una sucursal con el id ${branchId}` });
        }

        const deposit = await Deposit.findByPk(depositId);
        if (!deposit) {
            return res.status(400).json({ msg: `No existe un depósito con el id ${depositId}` });
        }

        if (deposit.branchId !== branchId) {
            return res.status(400).json({ msg: `El depósito ${depositId} no pertenece a la sucursal ${branchId}` });
        }

        const exists = await Inventory.findOne({ where: { productId, depositId } });
        if (exists) {
            return res.status(400).json({ msg: 'Ya existe un registro de inventario para este producto en este depósito' });
        }

        const newInventory = await Inventory.create({
            productId, branchId, depositId, stock, stockMin, stockOrder
        });

        res.status(201).json({
            msg: "Inventario agregado con éxito",
            inventory: newInventory
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al procesar datos" });
    }
};

const getInventories = async (req, res) => {
    try {
        const inventories = await Inventory.findAll({
            where: { state: true },
            include: [
                { model: Product, as: 'product', attributes: ['id', 'name', 'packageType', 'packageQuantity'] },
                { model: Branch, as: 'branch', attributes: ['id', 'name'] },
                { model: Deposit, as: 'deposit', attributes: ['id', 'name', 'main'] }
            ]
        });

        res.json(inventories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener los inventarios" });
    }
};

const getInventoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const inventory = await Inventory.findByPk(id, {
            include: [
                { model: Product, as: 'product', attributes: ['id', 'name', 'packageType', 'packageQuantity'] },
                { model: Branch, as: 'branch', attributes: ['id', 'name'] },
                { model: Deposit, as: 'deposit', attributes: ['id', 'name', 'main'] }
            ]
        });

        if (!inventory) {
            return res.status(404).json({ msg: `No existe un inventario con el id ${id}` });
        }

        res.json(inventory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener el inventario" });
    }
};

const getInventoryByBranch = async (req, res) => {
    const { branchId } = req.params;

    try {
        const branchExists = await Branch.findByPk(branchId);
        if (!branchExists) {
            return res.status(404).json({ msg: `No existe una sucursal con el id ${branchId}` });
        }

        const inventories = await Inventory.findAll({
            where: { branchId, state: true },
            include: [
                { model: Product, as: 'product', attributes: ['id', 'name', 'packageType', 'packageQuantity'] },
                { model: Deposit, as: 'deposit', attributes: ['id', 'name', 'main'] }
            ]
        });

        res.json(inventories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener el inventario de la sucursal" });
    }
};

const getInventorySummaryByBranch = async (req, res) => {
    const { branchId } = req.params;

    try {
        const branchExists = await Branch.findByPk(branchId);
        if (!branchExists) {
            return res.status(404).json({ msg: `No existe una sucursal con el id ${branchId}` });
        }

        const mainDeposit = await Deposit.findOne({ where: { branchId, main: true } });
        if (!mainDeposit) {
            return res.status(400).json({ msg: 'La sucursal no tiene un depósito principal asignado' });
        }

        const totalStocks = await Inventory.findAll({
            where: { branchId, state: true },
            attributes: [
                'productId',
                [sequelize.fn('SUM', sequelize.col('stock')), 'totalStock']
            ],
            group: ['productId']
        });

        const mainInventories = await Inventory.findAll({
            where: { depositId: mainDeposit.id, state: true },
            include: [
                { model: Product, as: 'product', attributes: ['id', 'name', 'packageType', 'packageQuantity'] }
            ]
        });

        const stockMap = {};
        totalStocks.forEach(item => {
            stockMap[item.productId] = parseInt(item.getDataValue('totalStock'));
        });

        const summary = mainInventories.map(inv => {
            const totalStock = stockMap[inv.productId] || 0;
            return {
                productId: inv.productId,
                product: inv.product,
                stockMin: inv.stockMin,
                stockOrder: inv.stockOrder,
                totalStock,
                belowMin: totalStock < inv.stockMin,
                belowOrder: totalStock < inv.stockOrder
            };
        });

        res.json({
            branch: branchExists,
            summary
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener el resumen de inventario" });
    }
};

const updateInventory = async (req, res) => {
    const { id } = req.params;
    const { stock, stockMin, stockOrder } = req.body;

    try {
        const inventory = await Inventory.findByPk(id);
        if (!inventory) {
            return res.status(404).json({ msg: `No existe un inventario con el id ${id}` });
        }

        await Inventory.update({ stock, stockMin, stockOrder }, { where: { id } });

        const updatedInventory = await Inventory.findByPk(id, {
            include: [
                { model: Product, as: 'product', attributes: ['id', 'name', 'packageType', 'packageQuantity'] },
                { model: Branch, as: 'branch', attributes: ['id', 'name'] },
                { model: Deposit, as: 'deposit', attributes: ['id', 'name', 'main'] }
            ]
        });

        res.json({ ok: true, inventory: updatedInventory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar datos' });
    }
};

const changeStateInventory = async (req, res) => {
    const { id } = req.params;

    try {
        const inventory = await Inventory.findByPk(id);
        if (!inventory) {
            return res.status(404).json({ msg: `No existe un inventario con el id ${id}` });
        }

        await Inventory.update({ state: !inventory.state }, { where: { id } });

        const inventoryChanged = await Inventory.findByPk(id);

        res.json({ ok: true, inventory: inventoryChanged });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al cambiar el estado del inventario' });
    }
};

const deleteInventory = async (req, res) => {
    const { id } = req.params;

    try {
        const inventory = await Inventory.findByPk(id);
        if (!inventory) {
            return res.status(404).json({ msg: `No existe un inventario con el id ${id}` });
        }

        await inventory.destroy();

        res.json({ ok: true, msg: 'Inventario eliminado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar el inventario' });
    }
};

module.exports = {
    createInventory,
    getInventories,
    getInventoryById,
    getInventoryByBranch,
    getInventorySummaryByBranch,
    updateInventory,
    changeStateInventory,
    deleteInventory
};
