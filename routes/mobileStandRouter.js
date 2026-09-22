const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createMobileStand,
    getMobileStands,
    getMobileStandById,
    updateMobileStand,
    deleteMobileStand
} = require('../controllers/mobileStandControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createMobileStand);
routes.get('/', checkAuth, getMobileStands);
routes.get('/:id', checkAuth, getMobileStandById);
routes.put('/:id', checkAuth, updateMobileStand);
routes.delete('/:id', checkAuth, deleteMobileStand);

module.exports = routes;
