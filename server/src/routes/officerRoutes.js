
const express = require('express');
const router = express.Router();
const { verifyToken, fulfillBooking } = require('../controllers/officerController');

// Removed 'protect' middleware so officer portal works directly
router.post('/verify-token', verifyToken);
router.post('/fulfill-booking', fulfillBooking);

module.exports = router;
