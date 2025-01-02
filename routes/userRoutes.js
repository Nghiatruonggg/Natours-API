const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} = require('../controllers/userController');
const {
  protected,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');
const { signUp, logIn } = require('../controllers/authController');

const router = express.Router();
router.post('/sign-up', signUp);

router.post('/login', logIn);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.patch('/update-password/', protected, updatePassword);
router.patch('/update-me', protected, updateMe);
router.delete('/delete-me', protected, deleteMe);

router.route('/').get(getAllUsers).post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(protected, deleteUser);

module.exports = router;
