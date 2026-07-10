const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createEquipment,
    getEquipments,
    getEquipmentById,
    updateEquipment,
    deleteEquipment
} = require('../controllers/equipmentControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createEquipment);
routes.get('/', checkAuth, getEquipments);
routes.get('/:id', checkAuth, getEquipmentById);
routes.put('/:id', checkAuth, updateEquipment);
routes.delete('/:id', checkAuth, deleteEquipment);

module.exports = routes;
