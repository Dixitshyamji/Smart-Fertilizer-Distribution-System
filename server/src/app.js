const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/db');

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Use compression middleware for performance optimization
app.use(compression());

// CORS configuration - support local development and production deployment
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// Serve client built static assets in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(distPath, {
    maxAge: '1d',
    etag: true
  }));

  // SPA fallback routing - serve index.html for React routing paths
  app.get(/.*/, (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({
    status: 'FAIL',
    message: `Cannot find route ${req.originalUrl} on this server.`
  });
});

module.exports = app;