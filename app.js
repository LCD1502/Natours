const express = require('express');
const morgan = require('morgan');

const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
// 1) middleware

console.log(` 
************************************
--- our environment: ${process.env.NODE_ENV}
--- Author: ${process.env.USER_NAME}
************************************
`);

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 2) routes handler

// 3) Routes

// app.get('/api/v1/tours', getAllTours);

// app.get('/api/v1/tours/:id', getTour);

// app.patch('/api/v1/tours/:id', updateTour);

// app.post('/api/v1/tours', createTour);

// app.delete('/api/v1/tours/:id', deleteTour);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    // const err = new Error(`Can't find ${req.originalUrl} on this server`);
    // err.status = 'Fail';
    // err.statusCode = 404;
    const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404);
    next(err); // why we specify an argument for next(), it will be call Error Handling function
});

app.use(globalErrorHandler);
module.exports = app;
