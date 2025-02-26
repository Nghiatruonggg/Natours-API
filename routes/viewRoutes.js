const express = require('express');
const {
  getOverview,
  getTour,
  getLogin,
  getAccount,
  updateUserData,
  getMyTours
} = require('../controllers/viewController');
const { createBookingCheckout } = require('../controllers/bookingController');

const { protected, isLoggedIn } = require('../controllers/authController');

const router = express.Router();

router.get('/', isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLogin);
router.get('/me', protected, getAccount);
router.get('/my-tours', protected, getMyTours);

router.post('/submit-user-data', protected, updateUserData);

module.exports = router;
