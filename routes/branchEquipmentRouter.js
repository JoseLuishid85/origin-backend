const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createBranchEquipment,
    getBranchEquipmentByBranch,
    updateBranchEquipment,
    deleteBranchEquipment
} = require('../controllers/branchEquipmentControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createBranchEquipment);
routes.get('/branch/:branchId', checkAuth, getBranchEquipmentByBranch);
routes.put('/:id', checkAuth, updateBranchEquipment);
routes.delete('/:id', checkAuth, deleteBranchEquipment);

module.exports = routes;
