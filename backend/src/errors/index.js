class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends CustomError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ValidationError extends CustomError {
  constructor(errors = [], message = 'Validation failed') {
    super(message, 400);
    this.errors = errors;
  }
}

class AuthError extends CustomError {
  constructor(message = 'Not authorized') {
    super(message, 401);
  }
}

class PaymentError extends CustomError {
  constructor(message = 'Payment processing failed') {
    super(message, 402);
  }
}

class ForbiddenError extends CustomError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class ConflictError extends CustomError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export {
  CustomError,
  NotFoundError,
  ValidationError,
  AuthError,
  PaymentError,
  ForbiddenError,
  ConflictError
};