const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingsModel');
const catchAsync = require('../utils/catchAsync');
const {
  getAll,
  createOne,
  getOne,
  updateOne,
  deleteOne
} = require('../utils/factoryFunction');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get the current tour
  const tour = await Tour.findById(req.params.tourId);

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'aud',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://natours.dev/img/tours/${tour.imageCover}`]
          }
        }
      }
    ]
  });

  // Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // Temporary -> everyone can make bookings without paying
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

// exports.getBooking = catchAsync(async (req, res, next) => {
//   const getTour = new APIFeatures(Tour, req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate()
//     .matchUser({ path: 'booking', match: { user: req.user.id } });

//   const unfilteredBooking = await getTour.query;
//   const booking = unfilteredBooking.filter((tour) => tour.booking.length > 0);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       booking
//     }
//   });
// });

exports.getBookings = getAll(Booking, 'booking');
exports.createBooking = createOne(Booking, 'booking');
exports.getOneBooking = getOne(Booking);
exports.editBooking = updateOne(Booking, 'updatedBooking');
exports.deleteBooking = deleteOne(Booking);
