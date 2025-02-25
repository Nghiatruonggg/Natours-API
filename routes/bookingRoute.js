const express = require('express');
const router = express.Router();
const { protected, restrictedTo } = require('../controllers/authController');
const {
  getCheckoutSession,
  getBookings,
  createBooking,
  getOneBooking,
  editBooking,
  deleteBooking
} = require('../controllers/bookingController');

router.use(protected);
router.get('/checkout-session/:tourId', getCheckoutSession);

router.use(restrictedTo('admin', 'lead-guide'));
router.route('/').get(getBookings).post(createBooking);
router
  .route('/:id')
  .get(getOneBooking)
  .patch(editBooking)
  .delete(deleteBooking);

module.exports = router;
