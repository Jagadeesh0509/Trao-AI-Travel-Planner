const express = require('express');
const router = express.Router();
const { register, login, getMe, googleAuth } = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
router.post('/register', register);

// @route   POST /api/auth/login
router.post('/login', login);

// @route   POST /api/auth/google
router.post('/google', googleAuth);

// @route   GET /api/auth/me  (protected)
router.get('/me', auth, getMe);

module.exports = router;
