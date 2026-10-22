const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const db = require('../config/db');

const authenticateToken = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please provide an authorization token.', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_super_secret_jwt_key_2026');

    // Confirm user still exists in database
    const result = await db.query('SELECT id, name, email FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Attach user to request object
    req.user = result.rows[0];
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  authenticateToken
};
