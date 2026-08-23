// const express = require('express');
// const router = express.Router();
// const { verifyToken, fulfillBooking } = require('../controllers/officerController');
// const { protect } = require('../middleware/authMiddleware');

// router.post('/verify-token', protect, verifyToken);
// router.post('/fulfill-booking', protect, fulfillBooking);

// module.exports = router;
const express = require('express');
const router = express.Router();
const { verifyToken, fulfillBooking } = require('../controllers/officerController');

// Removed 'protect' middleware so officer portal works directly
router.post('/verify-token', verifyToken);
router.post('/fulfill-booking', fulfillBooking);

module.exports = router;