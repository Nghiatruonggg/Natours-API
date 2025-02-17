const express = require('express');
const router = express.Router();
const { protected } = require('../controllers/authController');
const { getCheckoutSession } = require('../controllers/bookingController');

router.get('/checkout-session/:tourId', protected, getCheckoutSession);

module.exports = router;
