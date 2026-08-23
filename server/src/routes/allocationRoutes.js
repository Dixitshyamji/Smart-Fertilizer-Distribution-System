const express = require('express');
const router = express.Router();
const { getQuota, getGodowns } = require('../controllers/allocationController');
const { protect } = require('../middleware/authMiddleware');

// Quota Endpoints
router.get('/quota', protect, getQuota);
router.get('/my-quota', protect, getQuota);
router.get('/godowns', protect, getGodowns);

module.exports = router;