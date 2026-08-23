const jwt = require('jsonwebtoken');

// Generate unique Farmer ID like FRM-2026-1042
const generateFarmerId = () => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `FRM-2026-${randomDigits}`;
};

// Generate JWT Token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'agri_secret_key', {
    expiresIn: '7d'
  });
};

module.exports = {
  generateFarmerId,
  generateToken
};