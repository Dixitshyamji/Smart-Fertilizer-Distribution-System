const express = require('express');
const router = express.Router();
const { registerFarmer, loginFarmer, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Farmer Public Endpoints
router.post('/farmer/register', registerFarmer);
router.post('/farmer/login', loginFarmer);

// Protected Profile Endpoint
router.get('/me', protect, getMe);

module.exports = router; // <--- THIS IS MUST