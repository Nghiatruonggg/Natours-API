const reviewModel = require('../models/reviewModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await reviewModel.find();
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await reviewModel.findById(req.params.id);

  if (!review) {
    return next(new AppError('Cannot find the review', 404));
  }

  res.status(200).json({
    status: 'success',
    data: review,
  });
});

exports.createReviews = catchAsync(async (req, res, next) => {
  if (!req.body.user) {
    req.body.user = req.user.id;
  }

  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }

  const newReviews = await reviewModel.create(req.body);

  res.status(201).json({
    status: 'success',
    data: newReviews,
  });
});

exports.deleteReviews = catchAsync(async (req, res, next) => {
  const deleteReview = await reviewModel.findByIdAndDelete(req.params.id);

  if (!deleteReview) {
    return next(new AppError('Cannot find this ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});

exports.updateReviews = catchAsync(async (req, res, next) => {
  const updatedReview = await reviewModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      runValidators: true,
      new: true,
    },
  );

  if (!updatedReview) {
    return next(new AppError('Cannot find this ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: updatedReview,
  });
});
