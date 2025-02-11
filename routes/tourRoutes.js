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
  getToursWithin,
  getDistance,
  uploadTourImages,
  resizeTourImages
} = require('../controllers/tourController');
const { protected, restrictedTo } = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();
// router.param('id', checkID);

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

// Search Query Params: /tours-within?distance=200&center=40,45&unit=miles
router.get('/tours-within/:distance/center/:latlng/unit/:unit', getToursWithin);

router.get('/distance/:latlng/unit/:unit', getDistance);

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
  .patch(
    protected,
    restrictedTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updatedTour
  )
  .delete(protected, restrictedTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
