const multer = require('multer');
const sharp = require('sharp');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getAll,
  getOne
} = require('../utils/factoryFunction');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //user-userId-timestamp.extension
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();
// Filter if the file is image or not
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 404), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

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
  if (req.file) filterBody.photo = req.file.filename;

  // Update the user's data
  const currentUser = await userModel.findByIdAndUpdate(
    req.user.id,
    filterBody,
    {
      runValidators: true,
      new: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: currentUser
    }
  });
});

// Do not use this API to update user's password
exports.updateUser = updateOne(userModel, 'user');

exports.deleteMe = catchAsync(async (req, res, next) => {
  await userModel.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.deleteUser = deleteOne(userModel);
