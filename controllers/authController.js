const crypto = require('crypto');
const { promisify } = require('util'); // promisify will return a function that return a promise
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

const createAndSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions); //set cookie
    // Remove password after send it back to client
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirmation: req.body.passwordConfirmation,
        //passwordChangedAt: req.body.passwordChangedAt, lesson 131 error fix
        role: req.body.role,
    });
    createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //1) check if email and password exist
    if (!email || !password) {
        return new AppError('Please provide email and password!!!', 400);
    }

    // 2) check if user exists and password are is correct
    const user = await User.findOne({ email }).select('+password');
    // const correct = await user.correctPassword(password, user.password);
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect Email or Password', 401));
    }

    // 3) if everything is ok, send token to client
    createAndSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    //1) getting token and check it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    //console.log(token);
    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access', 401));
    }

    //2) verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(decoded);

    //3) check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new AppError('The user belonging to this token does no longer exist', 401));
    }

    //4) check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please try again', 401));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = freshUser;
    next();
});

// only for rendered pages, no errors !
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            //1) verification token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

            //2) check if user still exists
            const freshUser = await User.findById(decoded.id);
            if (!freshUser) {
                return next();
            }

            //3) check if user changed password after the token was issued
            if (freshUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // THIS IS LOGGED IN USER
            res.locals.user = freshUser;
        } catch (err) {
            return next();
        }
    }
    next();
};

exports.logout = (req, res) => {
    res.cookie('jwt', 'logged out', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({
        status: 'success',
    });
};

exports.restrictTo =
    (...roles) =>
    (req, res, next) => {
        // roles is an array ['lead', 'admin'] . role='user'
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1) get user based on email
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new AppError('There is no user with the given email', 404));

    //2) generate random reset tokens
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //3) send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password ? Please submit new password and passwordConfirmation to: ${resetURL}.
        If you didn't forgot your password, please ignore this email`;

    // because might have error with sendEmail, in this case, we dont want to simply send message to client by global handling middleware
    // we need to set back the passwordResetToken and passwordResetExpires that we defined
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 minutes)',
            message,
        });
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken, // first, find user has the same token in DB
        passwordResetExpires: { $gt: Date.now() }, // second, check if passwordResetExpired gt than now (mean valid)
    });

    //2) If token has NOT expired, and there is user, set new password
    if (!user) {
        return next(new AppError('Token is invalid or expired.', 400));
    }
    user.password = req.body.password;
    user.passwordConfirmation = req.body.passwordConfirmation;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //3) Update changedPasswordAt property for the user

    //4) Log the user in, send JWT
    createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1) Get user form the collection
    const user = await User.findById(req.user.id).select('+password');

    //2) Check if POSTed current password is correct
    const check = await user.correctPassword(req.body.passwordCurrent, user.password);
    if (!check) return next(new AppError('Your current password is incorrect', 401));

    //3) If so, update password
    user.password = req.body.password;
    user.passwordConfirmation = req.body.passwordConfirmation;
    await user.save();
    //4) Log in user, send JWT
    createAndSendToken(user, 200, res);
});
