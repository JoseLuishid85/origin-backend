const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductInventoryByBranch
} = require('../controllers/productControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createProduct);
routes.get('/', checkAuth, getProducts);
routes.get('/inventory/branch/:branchId', checkAuth, getProductInventoryByBranch);
routes.get('/:id', checkAuth, getProductById);
routes.put('/:id', checkAuth, updateProduct);
routes.delete('/:id', checkAuth, deleteProduct); // Endpoint Delete agregado

module.exports = routes;