const express = require('express');
const router = express.Router();
const { getSummaryMetrics } = require('../controllers/analyticsController');

router.get('/summary', getSummaryMetrics);

module.exports = router;