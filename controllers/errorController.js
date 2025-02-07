const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} = ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const message = `name: ${err.keyValue.name} has been duplicated`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errorMessage = Object.values(err.errors)
    .map((val) => val.message)
    .join(' ;');
  return new AppError(errorMessage, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please login again', 401);

const handleTokenExpiredError = () =>
  new AppError('Token expired. Please login again', 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Render view
    console.error(err);
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong :(',
      msg: err.message
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // API
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.statusCode,
        message: err.message
      });
    }
    // Log the error
    console.error(err);

    // Send the res
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  } else {
    // Render view
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong :(',
        msg: err.message
      });
    }
    // Log the error
    console.error(err);

    // Send the res
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong :(',
      msg: 'Please try again later'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  }

  // Windows issue: need trimming
  if (process.env.NODE_ENV.trim() === 'production') {
    let error = { ...err, message: err.message, name: err.name };
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    if (error.code === 11000) {
      error = handleDuplicateErrorDB(error);
    }

    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }

    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }

    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpiredError();
    }
    sendErrorProd(error, req, res);
  }
};
