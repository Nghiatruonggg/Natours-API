const express = require('express');
const {
  getOverview,
  getTour,
  getLogin,
  getAccount,
  updateUserData
} = require('../controllers/viewController');

const { protected } = require('../controllers/authController');
const { isLoggedIn } = require('../controllers/authController');

const router = express.Router();

router.get('/', isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLogin);
router.get('/me', protected, getAccount);

router.post('/submit-user-data', protected, updateUserData);

module.exports = router;
