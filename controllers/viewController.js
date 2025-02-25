const Tour = require('../models/tourModel');
const Booking = require('../models/bookingsModel');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1, Take data from collections
  const tours = await Tour.find();
  // console.log(tours)
  // 2, Build the template

  // 3, Export page
  res.status(200).render('overview', {
    title: 'Overview',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  res.status(200).render('tour', {
    title: `${tour.name}`,
    tour,
    reviews: tour.reviews,
    guides: tour.guides
  });
});

exports.getLogin = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login'
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your Account'
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // // Find all bookings related to the user
  // const bookings = await Booking.find({ user: req.user.id });
  
  // // Find tours with the returned IDs
  // const tourIDs = bookings.map((el) => el.tour);

  // // $in operator is used to find the element inside the array
  // const tours = await Tour.find({ _id: { $in: tourIDs } });

  const myTours = await Tour.find().populate({
    path: 'booking',
    match: { user: req.user.id }
  });

  const tours = myTours.filter((tour) => tour.booking.length > 0);
  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await userModel.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser
  });
});
