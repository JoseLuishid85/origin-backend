const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const { menuProductImage } = require('../middlewares/upload.js');
const {
    createMenuProduct,
    getMenuProducts,
    getMenuProductById,
    updateMenuProduct,
    deleteMenuProduct
} = require('../controllers/menuProductControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, menuProductImage, createMenuProduct);
routes.get('/', checkAuth, getMenuProducts);
routes.get('/:id', checkAuth, getMenuProductById);
routes.put('/:id', checkAuth, menuProductImage, updateMenuProduct);
routes.delete('/:id', checkAuth, deleteMenuProduct);

module.exports = routes;
