const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createMenuProductPortion,
    getRecipeByMenuProduct,
    updateMenuProductPortion,
    deleteMenuProductPortion
} = require('../controllers/menuProductPortionControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createMenuProductPortion);
routes.get('/menu-product/:menuProductId', checkAuth, getRecipeByMenuProduct);
routes.put('/:id', checkAuth, updateMenuProductPortion);
routes.delete('/:id', checkAuth, deleteMenuProductPortion);

module.exports = routes;
