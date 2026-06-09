const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createDeposit,
    getDeposits,
    getDepositById,
    updateDeposit,
    changeStateDeposit,
    changeMainDeposit,
    deleteDeposit
} = require('../controllers/depositControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createDeposit);
routes.get('/', checkAuth, getDeposits);
routes.get('/:id', checkAuth, getDepositById);
routes.get('/change-state/:id', checkAuth, changeStateDeposit);
routes.get('/change-main/:id', checkAuth, changeMainDeposit);
routes.put('/:id', checkAuth, updateDeposit);
routes.delete('/:id', checkAuth, deleteDeposit);

module.exports = routes;
