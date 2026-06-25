const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createTransfer,
    getTransfers,
    getRecentTransfers,
    getTransferById,
    getTransfersByBranch,
    changeStateTransfer,
    deleteTransfer
} = require('../controllers/transferControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createTransfer);
routes.get('/', checkAuth, getTransfers);
routes.get('/recent', checkAuth, getRecentTransfers);
routes.get('/branch/:branchId', checkAuth, getTransfersByBranch);
//routes.get('/change-state/:id', checkAuth, changeStateTransfer);
routes.get('/:id', checkAuth, getTransferById);
//routes.delete('/:id', checkAuth, deleteTransfer);

module.exports = routes;
