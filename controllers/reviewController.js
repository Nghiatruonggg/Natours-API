const reviewModel = require('../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('../utils/factoryFunction');

exports.getAllReviews = getAll(reviewModel, 'reviews');
exports.getReview = getOne(reviewModel);
exports.createReviews = createOne(reviewModel, 'reviews');
exports.deleteReviews = deleteOne(reviewModel);
exports.updateReviews = updateOne(reviewModel, 'reviews');

exports.setUserToursId = (req, res, next) => {
  if (!req.body.user) {
    req.body.user = req.user.id;
  }

  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }

  next();
};