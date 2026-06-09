const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createBranch,
    getBranches,
    getBranchById,
    updateBranch,
    changeStateBranch,
    deleteBranch
} = require('../controllers/branchControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createBranch);
routes.get('/', checkAuth, getBranches);
routes.get('/:id', checkAuth, getBranchById);
routes.get('/change-state/:id', checkAuth, changeStateBranch);
routes.put('/:id', checkAuth, updateBranch);
routes.delete('/:id', checkAuth, deleteBranch);

module.exports = routes;
