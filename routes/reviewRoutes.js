const express = require('express');
const {
  getAllReviews,
  createReviews,
  getReview,
  updateReviews,
  deleteReviews,
} = require('../controllers/reviewController');
const { protected, restrictedTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(protected, restrictedTo('user'), createReviews);

router.route('/:id').get(getReview).patch(updateReviews).delete(deleteReviews);

module.exports = router;
