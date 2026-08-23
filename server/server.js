
// const path = require('path');
// require('dotenv').config({ path: path.join(__dirname, '.env') });
// const app = require('./src/app');

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`
// ===================================================
// 🌾 SMART FERTILIZER BACKEND SERVER STARTED
// 🚀 Server running on: http://localhost:${PORT}
// ⚡ Health Check API: http://localhost:${PORT}/api/health
// ===================================================
//   `);
// });
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

// Global error logging for debugging Render crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

if (!MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined in Environment Variables!");
}

// Database connect hone se pehle server ko port par bind karein
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server successfully listening on port ${PORT}`);
});

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
  })
  .catch((err) => {
    console.error('MongoDB Connection Error (Check Atlas IP & Credentials):', err.message);
  });