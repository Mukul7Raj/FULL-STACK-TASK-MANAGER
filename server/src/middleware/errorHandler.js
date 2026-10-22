// Custom Operational Error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 Handler for undefined routes
const notFoundHandler = (req, res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
};

// Centralized Global Error Handler
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle unique constraint violation in Postgres (error code 23505)
  if (err.code === '23505') {
    err.statusCode = 409;
    err.message = 'A record with that information already exists.';
  }

  // Handle foreign key violation (error code 23503)
  if (err.code === '23503') {
    err.statusCode = 400;
    err.message = 'Referenced resource does not exist.';
  }

  // Handle invalid JWT
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.message = 'Invalid authentication token. Please log in again.';
  }

  // Handle expired JWT
  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.message = 'Your session has expired. Please log in again.';
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err
    });
  }

  // Production response: don't leak stack traces
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message || 'An unexpected error occurred.'
  });
};

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler
};
