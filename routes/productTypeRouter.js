const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createProductType,
    getProductTypes,
    getProductTypeById,
    updateProductType,
    changeStateProductType,
    deleteProductType
} = require('../controllers/productTypeControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createProductType);
routes.get('/', checkAuth, getProductTypes);
routes.get('/:id', checkAuth, getProductTypeById);
routes.get('/change-state/:id', checkAuth, changeStateProductType);
routes.put('/:id', checkAuth, updateProductType);
routes.delete('/:id', checkAuth, deleteProductType);

module.exports = routes;  