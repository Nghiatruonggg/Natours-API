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
const reviewRouter = require('./reviewRoutes');

const router = express.Router();
// router.param('id', checkID);

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tours-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(getMonthlyPlan, protected, restrictedTo('admin', 'lead-guide'));

router
  .route('/')
  .get(getAllTours)
  .post(protected, restrictedTo('admin', 'lead-guide'), addNewTour);

router
  .route('/:id')
  .get(getTour)
  .patch(protected, restrictedTo('admin', 'lead-guide'), updatedTour)
  .delete(protected, restrictedTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
