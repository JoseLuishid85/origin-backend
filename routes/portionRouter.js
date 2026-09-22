const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createPortion,
    getPortions,
    getPortionById,
    updatePortion,
    deletePortion
} = require('../controllers/portionControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createPortion);
routes.get('/', checkAuth, getPortions);
routes.get('/:id', checkAuth, getPortionById);
routes.put('/:id', checkAuth, updatePortion);
routes.delete('/:id', checkAuth, deletePortion);

module.exports = routes;
