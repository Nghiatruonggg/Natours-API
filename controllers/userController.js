const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getAll,
  getOne,
} = require('../utils/factoryFunction');

const filteredFields = (obj, ...allowedFields) => {
  const newObject = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObject[key] = obj[key];
    }
  });

  return newObject;
};

exports.getAllUsers = getAll(userModel, 'user');

exports.getUser = getOne(userModel);

// Admin Only
exports.createUser = createOne(userModel, 'user');

exports.updateMe = catchAsync(async (req, res, next) => {
  // If user tries to update the password, error
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password update', 400));
  }

  // Filter out the unwanted fields
  const filterBody = filteredFields(req.body, 'name', 'email');

  // Update the user's data
  const currentUser = await userModel.findByIdAndUpdate(
    req.user.id,
    filterBody,
    {
      runValidators: true,
      new: true,
    },
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: currentUser,
    },
  });
});

// Do not use this API to update user's password
exports.updateUser = updateOne(userModel, 'user');

exports.deleteMe = catchAsync(async (req, res, next) => {
  await userModel.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next()
}

exports.deleteUser = deleteOne(userModel);
