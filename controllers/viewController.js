const Tour = require('../models/tourModel');
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
