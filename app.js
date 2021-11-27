const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit'); //limit request from an IP address
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const path = require('path');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL middleware

console.log(` 
************************************
--- our environment: ${process.env.NODE_ENV}
--- Author: ${process.env.USER_NAME}
************************************
`);

// development login
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Set Security HTTP headers
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
            baseUri: ["'self'"],
            fontSrc: ["'self'", 'https:', 'http:', 'data:'],
            scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
            imgSrc: ["'self'", 'data:', 'blob:'],
        },
        // directives: {
        //     defaultSrc: ["'self'"],
        //     baseUri: ["'self'"],
        //     fontSrc: ["'self'", 'https:', 'data:'],
        //     scriptSrc: [
        //         "'self'",
        //         'https://*.cloudflare.com',
        //         'https://*.stripe.com',
        //         'https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js',
        //     ],
        //     frameSrc: ["'self'", 'https://*.stripe.com'],
        //     objectSrc: ["'none'"],
        //     styleSrc: ["'self'", 'https:', 'unsafe-inline'],
        //     upgradeInsecureRequests: [],
        // },
    })
);

// limit request come from an IP address
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, Please try again in an hour',
});

app.use('/api', limiter);

//Body parse, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
// for example: client dont send email, but they send { "$gt": "" }, its ALWAYS TRUE, so they can login with no email
// now we use express-mongo-sanitize, but we can use SANITIZE-HTML
app.use(mongoSanitize());

//Data sanitization against XSS
// it trans html code to another characters
app.use(xssClean());

// Prevent parameter pollution
app.use(
    hpp({
        whilelist: ['duration', 'ratingsAverage', 'ratingQuantity', 'maxGroupSize', 'difficulty', 'price'],
    })
);

// Serving Static file
app.use(express.static(path.join(__dirname, 'public')));

// Test Middleware for Time
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next();
});

// 2) routes handler

// 3) Routes

// app.get('/api/v1/tours', getAllTours);

// app.get('/api/v1/tours/:id', getTour);

// app.patch('/api/v1/tours/:id', updateTour);

// app.post('/api/v1/tours', createTour);

// app.delete('/api/v1/tours/:id', deleteTour);

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
    // const err = new Error(`Can't find ${req.originalUrl} on this server`);
    // err.status = 'Fail';
    // err.statusCode = 404;
    const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404);
    next(err); // why we specify an argument for next(), it will be call Error Handling function
});

app.use(globalErrorHandler);
module.exports = app;
