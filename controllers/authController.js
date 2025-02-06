const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const UserModel = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/email');

// eslint-disable-next-line arrow-body-style
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOption.secure = true;
  }
  res.cookie('jwt', token, cookieOption);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });

  createAndSendToken(newUser, 201, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email or password', 400));
  }
  // Check if the user exists && password is correct
  const user = await UserModel.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email or password incorrect', 400));
  }

  // Sign new JWT token and send them back
  createAndSendToken(user, 201, res);
});

exports.logOut = catchAsync(async (req, res, next) => {
  // Check if cookie exists -> Delete the cookie
  if (req.cookies) {
    res.cookie('jwt', 'loggedout', {
      httpOnly: true,
      expires: new Date(Date.now() + 10 * 1000)
    });

    res.status(200).json({
      status: 'success',
      data: 'You have been logged out!'
    });
  }

  // Already logged out
  next(new AppError('You have already logged out!', 401));
});

exports.protected = catchAsync(async (req, res, next) => {
  // 1, get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('Please log in first', 401));
  }

  // 2, verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3, check if users still exist
  const currentUser = await UserModel.findById(decoded.id);
  if (!currentUser)
    return next(new AppError('The user is no longer exists', 401));

  // 4, check if user changed password after JWT was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed the password. Please log in again'),
      401
    );
  }

  // Grant access to the protected routes
  req.user = currentUser;
  next();
});

// Only for rendering pages -> No errs
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 2, verify the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 3, check if users still exist
      const currentUser = await UserModel.findById(decoded.id);
      if (!currentUser) return next();

      // 4, check if user changed password after JWT was issued
      if (currentUser.changePasswordAfter(decoded.iat)) {
        return next();
      }

      // There is a logged in user
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }

  next();
};

// eslint-disable-next-line arrow-body-style
exports.restrictedTo = (...roles) => {
  return (req, res, next) => {
    // roles: ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Check if email exists
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('Cannot find this email', 404));
  }

  // Generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateModifiedOnly: true }); // only validate the modified fields

  // Send it to the user's email
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? Click on the link: ${resetUrl} and start changing!`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: 'Your password reset token',
      message
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateModifiedOnly: true }); // only validate the modified fields

    return next(new AppError('There was an error sending the email!', 500));
  }

  createAndSendToken(user, 201, res);
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on the token
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await UserModel.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: {
      $gt: Date.now()
    }
  });

  // If token has not expired and user exists, set the new password
  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // update changedPasswordAt property for the user in userModel

  // Log the user in, send JWT
  createAndSendToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1, Get user from collection
  const currentUser = await UserModel.findById(req.user.id).select('+password');

  if (!currentUser) {
    return next(new AppError('Cannot find the user', 400));
  }

  // 2, Check if posted password is correct
  const isCorrected = await currentUser.correctPassword(
    req.body.oldPassword,
    currentUser.password
  );

  if (!isCorrected)
    return next(
      new AppError('Your old password is incorrect! Please try again', 400)
    );

  // 3, If correct, set new password
  currentUser.password = req.body.newPassword;
  currentUser.passwordConfirm = req.body.confirmedNewPassword;
  await currentUser.save({ validateModifiedOnly: true });

  // 4, log the user in + send JWT token
  createAndSendToken(currentUser, 201, res);
});

exports.ownerCheck = ({ model, ownerFields }, ...roles) =>
  catchAsync(async (req, res, next) => {
    const currentDoc = await model.findById(req.params.id);

    if (!currentDoc) {
      return next(new AppError('Document not found', 404));
    }

    const ownerId = currentDoc[ownerFields]._id || currentDoc[ownerFields];

    if (!ownerId) {
      return next(new AppError('Cannot find the owner', 403));
    }

    if (ownerId !== req.user.id && !roles.includes(req.user.role)) {
      return next(new AppError('Permission denied', 403));
    }

    next();
  });
