const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createProductUse,
    getProductUses,
    getProductUseById,
    updateProductUse,
    changeStateProductUse,
    deleteProductUse
} = require('../controllers/productUseControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createProductUse);
routes.get('/', checkAuth, getProductUses);
routes.get('/:id', checkAuth, getProductUseById);
routes.get('/change-state/:id', checkAuth, changeStateProductUse);
routes.put('/:id', checkAuth, updateProductUse);
routes.delete('/:id', checkAuth, deleteProductUse);

module.exports = routes;