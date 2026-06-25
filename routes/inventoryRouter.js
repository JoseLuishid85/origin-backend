const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createInventory,
    getInventories,
    getInventoryById,
    getInventoryByBranch,
    getInventorySummaryByBranch,
    getCriticalStock,
    updateInventory,
    changeStateInventory,
    deleteInventory
} = require('../controllers/inventoryControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createInventory);
routes.get('/', checkAuth, getInventories);
routes.get('/critical', checkAuth, getCriticalStock);
routes.get('/branch/:branchId', checkAuth, getInventoryByBranch);
routes.get('/branch/:branchId/summary', checkAuth, getInventorySummaryByBranch);
routes.get('/change-state/:id', checkAuth, changeStateInventory);
routes.get('/:id', checkAuth, getInventoryById);
routes.put('/:id', checkAuth, updateInventory);
routes.delete('/:id', checkAuth, deleteInventory);

module.exports = routes;
