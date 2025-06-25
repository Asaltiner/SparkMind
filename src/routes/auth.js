const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// POST /register
router.post('/register', register);

// POST /login
router.post('/login', login);

module.exports = router; 