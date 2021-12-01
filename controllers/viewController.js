const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getHome = catchAsync(async(req, res, next) => {
    const toursDisplay = await Tour.find().sort('-ratingsAverage').limit(3);
    res.status(200).render('home', {
        title: 'Home',
        tours: toursDisplay,
    });
});

exports.getOverview = catchAsync(async(req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find();
    // 2) Build template
    // 3) Render that template using tour data
    res.status(200).render('overview', {
        title: 'Exciting tours for adventurous people',
        tours,
    });
});

exports.getTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user',
    });
    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }
    res.status(200)
        .set(
            'Content-Security-Policy',
            "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
        )
        .render('tour', {
            title: `${tour.name} Tour`,
            tour,
        });
});

exports.getLoginForm = (req, res, next) => {
    res.status(200).set('Content-Security-Policy', "connect-src 'self' https://cdnjs.cloudflare.com").render('login', {
        title: 'Log in',
    });
};

exports.getAccount = (req, res, next) => {
    res.status(200).render('account', {
        title: 'Your Account',
    });
};

exports.getAboutUs = catchAsync(async(req, res, next) => {
    const guides = await User.find({ role: 'guide' });
    res.status(200).render('aboutus', {
        title: 'About Us',
        guides,
    });
});

exports.getBooking = catchAsync(async(req, res, next) => {
    res.status(200).render('booking', {
        title: 'Booking',
    });
});

exports.getFaq = catchAsync(async(req, res, next) => {
    res.status(200).render('faq', {
        title: 'Faq',
    });
});