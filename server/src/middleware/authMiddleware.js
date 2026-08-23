const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'agri_secret_key');
      req.user = decoded; // Contains id, role, custom_id
      next();
    } catch (error) {
      return res.status(401).json({
        status: 'FAIL',
        message: 'Not authorized, token invalid or expired.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 'FAIL',
      message: 'Not authorized, no token provided.'
    });
  }
};

module.exports = { protect };