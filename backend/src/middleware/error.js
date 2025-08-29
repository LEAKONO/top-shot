import {
  NotFoundError,
  ValidationError,
  AuthError,
  PaymentError,
  ForbiddenError,
  ConflictError
} from '../errors/index.js';

const errorHandler = (err, req, res, next) => {
  // Default error response
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific error types
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      error = new NotFoundError('Resource not found');
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      error = new ValidationError(errors);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      error = new ConflictError(`${field} already exists`);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      error = new AuthError('Invalid token');
    }

    // JWT expired
    if (err.name === 'TokenExpiredError') {
      error = new AuthError('Token expired');
    }

    sendErrorProd(error, res);
  }
};

// Development error response
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Production error response
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }) // Include validation errors if they exist
    });
  } 
  // Programming or other unknown error: don't leak error details
  else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

export { errorHandler };