const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createMobileStandPortion,
    getPortionStockByStand,
    getLowStockByStand,
    updateMobileStandPortion,
    deleteMobileStandPortion
} = require('../controllers/mobileStandPortionControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createMobileStandPortion);
routes.get('/mobile-stand/:mobileStandId', checkAuth, getPortionStockByStand);
routes.get('/mobile-stand/:mobileStandId/low-stock', checkAuth, getLowStockByStand);
routes.put('/:id', checkAuth, updateMobileStandPortion);
routes.delete('/:id', checkAuth, deleteMobileStandPortion);

module.exports = routes;
