const mongoose = require('mongoose');
//const slugify = require('slugify');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email address!'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email address!'],
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please provide a password!'],
        minLength: 8,
        select: false,
    },
    passwordConfirmation: {
        type: String,
        required: [true, 'Please confirm your password!'],
        validate: {
            // this only work on CREATE and SAVE
            validator: function (el) {
                return el === this.password;
            },
            message: 'Your password confirmation are not same',
        },
    },
    passwordChangedAt: {
        type: Date,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

userSchema.pre(/^find/, function (next) {
    // this point to current query
    this.find({ active: { $ne: false } });
    next();
});

// middleware to crypt password
userSchema.pre('save', async function (next) {
    // only run this function if password was actually modified
    if (!this.isModified('password')) return next();
    // HASH  with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    // delete passwordConfirmation filed
    this.passwordConfirmation = undefined;
    next();
});

userSchema.pre('save', function (next) {
    // only run this function if password was actually modified
    if (!this.isModified('password') || this.isNew) return next();

    // update passwordChangedAt
    this.passwordChangedAt = Date.now() - 1000; //because maybe signToken is created a bit before the changed password timestamp.
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        //console.log(changedTimeStamp, JWTTimestamp);
        return JWTTimestamp < changedTimeStamp; // true means changed
    }
    // not changed
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    console.log({ resetToken }, this.passwordResetToken);
    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
