const AppError = require('../utils/appError');

// every Error, which is instance of AppError class, has isOperational property, and it is true.
// Operational Error is error come from client.

const handleCastError = (error) => {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFields = (error) => {
    const value = error.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    console.log(value);
    const message = `Duplicate fields value: ${value}. Please use another value`;
    return new AppError(message, 400);
};

const handleValidationError = (error) => {
    // The Object.values() method returns an array of a given object's own enumerable property values,
    // in the same order as that provided by a for...in loop.
    const errorMessage = Object.values(error.errors).map((el) => el.message);
    const message = `Invalid input data. ${errorMessage.join(', ')}`;
    return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            currentError: err,
            message: err.message,
            stack: err.stack,
        });
    } else {
        // rendered website
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!!!',
            msg: err.message,
        });
    }
};

const handleJWTError = (error) => AppError('Invalid Token, Please log in again', 401);

const handleJWTExpiredError = (error) => AppError('Your token expired, Please log in again', 401);

const sendErrorProd = (err, req, res) => {
    // API error
    if (req.originalUrl.startsWith('/api')) {
        // Operational, trusted error: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }

        // Programing or unkown error: don't leak error details
        console.log('ERROR!!', err);
        return res.status(500).json({
            status: 'ERROR!!!',
            message: 'Something went wrong!',
        });
    }
    // rendered website
    if (err.isOperational) {
        // Operational, trusted error: send message to client
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!!!',
            msg: err.message,
        });
    } else {
        // Programing or unkown error: don't leak error details
        console.log('ERROR!!', err);
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!!!',
            msg: 'Please try again later.',
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'Error!!!';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = Object.assign(err);
        if (error.name === 'CastError') error = handleCastError(error); // handle Cast Error
        if (error.code === 11000) error = handleDuplicateFields(error); // handle Duplicate Fields Error
        if (error.name === 'ValidationError') error = handleValidationError(error); // handle Validation Error
        if (error.name === 'JsonWebTokenError') error = handleJWTError(error); // handle JWT Error
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error); // handle JWT Expired Error
        sendErrorProd(error, req, res);
    }
};
