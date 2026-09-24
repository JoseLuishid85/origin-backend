const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createInvoice,
    getInvoices,
    getInvoiceById,
    getInvoicesByStand,
    cancelInvoice
} = require('../controllers/invoiceControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createInvoice);
routes.get('/', checkAuth, getInvoices);
routes.get('/mobile-stand/:mobileStandId', checkAuth, getInvoicesByStand);
routes.put('/cancel/:id', checkAuth, cancelInvoice);
routes.get('/:id', checkAuth, getInvoiceById);

module.exports = routes;
