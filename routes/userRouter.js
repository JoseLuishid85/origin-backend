const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    changePassword
} = require('../controllers/userControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createUser);
routes.get('/', checkAuth, getUsers);
routes.put('/change-password', checkAuth, changePassword);
routes.get('/:id', checkAuth, getUserById);
routes.put('/:id', checkAuth, updateUser);

module.exports = routes;