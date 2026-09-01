
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// Global error handlers for debugging Render application behavior and preventing silent crashes
process.on('uncaughtException', (err) => {
  console.error('🔥 UNCAUGHT EXCEPTION:', err.stack || err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 UNHANDLED REJECTION AT:', promise, 'REASON:', reason);
});

// Bind to 0.0.0.0 to ensure Render can route traffic to this port correctly
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
===================================================
🌾 SMART FERTILIZER BACKEND SERVER STARTED
🚀 Server running on: http://0.0.0.0:${PORT}
⚡ Health Check API: http://0.0.0.0:${PORT}/api/health
===================================================
  `);
});