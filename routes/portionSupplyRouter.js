const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createPortionSupply,
    getPortionSupplies,
    getPortionSupplyById,
    getPortionSuppliesByStand,
    changeStatePortionSupply,
    deletePortionSupply
} = require('../controllers/portionSupplyControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createPortionSupply);
routes.get('/', checkAuth, getPortionSupplies);
routes.get('/mobile-stand/:mobileStandId', checkAuth, getPortionSuppliesByStand);
routes.get('/:id', checkAuth, getPortionSupplyById);
routes.get('/change-state/:id', checkAuth, changeStatePortionSupply);
routes.delete('/:id', checkAuth, deletePortionSupply);

module.exports = routes;
