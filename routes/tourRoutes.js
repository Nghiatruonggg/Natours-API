const express = require('express');
const {
  getAllTours,
  addNewTour,
  getTour,
  updatedTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');
const { protected, restrictedTo } = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes')

const router = express.Router();
// router.param('id', checkID);

router.use('/:tourId/reviews', reviewRouter)

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tours-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').get(protected, getAllTours).post(addNewTour);

router
  .route('/:id')
  .get(getTour)
  .patch(updatedTour)
  .delete(protected, restrictedTo('admin', 'lead-guide'), deleteTour);



module.exports = router;

/*
- Relationship Tours/Reviews
POST tours/toursId/reviews - Post reviews on tours
GET tours/toursId/reviews - Get all reviews on tours
GET tours/toursId/reviews/reviewsId - Get one review from tours
*/
