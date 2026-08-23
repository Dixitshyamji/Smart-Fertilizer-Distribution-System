// const express = require('express');
// const router = express.Router();
// const { getGodowns, createBooking, getMyBookings } = require('../controllers/bookingController');
// const { protect } = require('../middleware/authMiddleware');

// router.get('/godowns', protect, getGodowns);
// router.post('/create', protect, createBooking);
// router.get('/my-bookings', protect, getMyBookings);

// module.exports = router;
const express = require('express');
const router = express.Router();
const { getGodowns, createBooking, getMyBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.get('/godowns', protect, getGodowns);
router.post('/create', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);

module.exports = router;