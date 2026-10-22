const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Middleware to check validation results and format error messages
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
    return next(new AppError(`Validation failed: ${errorMessages}`, 400));
  }
  next();
};

module.exports = {
  validate
};
