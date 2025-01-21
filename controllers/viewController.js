const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1, Take data from collections
  const tours = await Tour.find();
  console.log(tours)
  // 2, Build the template

  // 3, Export page
  res.status(200).render('overview', {
    title: 'Overview',
    tours
  });
});

exports.getTour = (req, res, next) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker'
  });
};
