const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB Atlas
connectDB();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/allocation', require('./routes/allocationRoutes'));
app.use('/api/booking', require('./routes/bookingRoutes'));
app.use('/api/officer', require('./routes/officerRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'SUCCESS',
    message: '🌾 Smart Fertilizer System Backend API running smoothly on MongoDB Atlas!',
    timestamp: new Date()
  });
});

// Global 404
app.use((req, res) => {
  res.status(404).json({
    status: 'FAIL',
    message: `Cannot find route ${req.originalUrl} on this server.`
  });
});

module.exports = app;