const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe
} = require('../controllers/userController');
const {
  protected,
  forgotPassword,
  resetPassword,
  updatePassword,
  restrictedTo,
  logOut
} = require('../controllers/authController');
const { signUp, logIn } = require('../controllers/authController');

const router = express.Router();
router.post('/sign-up', signUp);
router.post('/login', logIn);
router.get('/logout', logOut);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.use(protected);
router.patch('/update-password/', updatePassword);
router.patch('/update-me', updateMe);
router.delete('/delete-me', deleteMe);
router.get('/me', getMe, getUser);

router.use(restrictedTo('admin'));
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
