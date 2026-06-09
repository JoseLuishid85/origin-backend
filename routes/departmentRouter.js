const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    changeStateDepartment,
    deleteDepartment
} = require('../controllers/departmentControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createDepartment);
routes.get('/', checkAuth, getDepartments);
routes.get('/:id', checkAuth, getDepartmentById);
routes.put('/change-state/:id', checkAuth, changeStateDepartment);
routes.put('/:id', checkAuth, updateDepartment);
routes.delete('/:id', checkAuth, deleteDepartment);

module.exports = routes;