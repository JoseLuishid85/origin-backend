const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createClient,
    getClients,
    getClientById,
    getClientByDocument,
    updateClient,
    changeStateClient
} = require('../controllers/clientControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createClient);
routes.get('/', checkAuth, getClients);
routes.get('/document/:nationality/:document', checkAuth, getClientByDocument);
routes.get('/change-state/:id', checkAuth, changeStateClient);
routes.get('/:id', checkAuth, getClientById);
routes.put('/:id', checkAuth, updateClient);

module.exports = routes;
