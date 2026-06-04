const express = require('express');
const { loginUser } = require('../controllers/authControllers.js')

const router = express.Router();

router.post('/', loginUser);

module.exports = router;