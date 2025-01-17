const express = require('express');
const {
  getAllReviews,
  createReviews,
  getReview,
  updateReviews,
  deleteReviews,
  setUserToursId
} = require('../controllers/reviewController');
const {
  protected,
  restrictedTo,
  ownerCheck
} = require('../controllers/authController');
const reviewModel = require('../models/reviewModel');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(protected, restrictedTo('user'), setUserToursId, createReviews);

router
  .route('/:id')
  .get(getReview)
  .patch(
    protected,
    ownerCheck({ model: reviewModel, ownerFields: 'user' }, 'user'),
    updateReviews
  )
  .delete(
    protected,
    ownerCheck({ model: reviewModel, ownerFields: 'user' }, 'user', 'admin'),
    deleteReviews
  );

module.exports = router;
