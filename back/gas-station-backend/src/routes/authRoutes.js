const express = require('express');
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Rutas públicas
router.post('/login', login);

// Rutas protegidas
router.get('/me', protect, getMe);

module.exports = router;