const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined',
    });
};

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// DO NOT update password with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
    //1) create error if user update password
    if (req.body.password || req.body.passwordConfirmation) {
        return next(new AppError('This route is not for password update, please use updateMyPassword', 400));
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filterBody = filterObj(req.body, 'name', 'email');

    //3) Update user
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, { new: true, runValidators: true });
    res.status(200).json({
        status: 'success',
        user: updatedUser,
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
