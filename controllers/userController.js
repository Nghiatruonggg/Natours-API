const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const filteredFields = (obj, ...allowedFields) => {
  const newObject = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObject[key] = obj[key];
    }
  });

  return newObject;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await userModel.find();

  // Send response
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users,
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined',
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // If user tries to update the password, error
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password update', 400));
  }

  // Filter out the unwanted fields
  const filterBody = filteredFields(req.body, 'name', 'email');

  
  // Update the user's data
  const currentUser = await userModel.findByIdAndUpdate(req.user.id, filterBody, {
    runValidators: true,
    new: true
  })
  
  res.status(200).json({
    status: 'success',
    data: {
      user: currentUser
    }
  });

});

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined',
  });
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await userModel.findByIdAndUpdate(req.user.id, {active: false})

  res.status(204).json({
    status: 'success',
    data: null
  })
})

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined',
  });
};
