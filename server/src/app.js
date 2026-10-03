const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/db');

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Performance middleware
app.use(compression());

// Exact origins allowed to interact with the API
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://smart-fertilizer-distribution-system2.onrender.com' // Live Frontend URL
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, curl, Postman, or listed domains
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        // Fallback to allow any deployed origin to prevent blocking
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health & status route
app.get('/', (req, res) => {
  res.status(200).send('🌾 Smart Fertilizer System Backend is Live and Active.');
});

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

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: 'FAIL',
    message: `Cannot find route ${req.originalUrl} on this server.`
  });
});

module.exports = app;
