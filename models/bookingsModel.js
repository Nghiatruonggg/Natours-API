const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Bookings must belong to a tour!']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'users',
      required: [true, 'Bookings must belong to a user!']
    },
    price: {
      type: Number,
      required: [true, 'Booking must have a price.']
    },
    paid: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name'
  });

  next();
});

const bookings = mongoose.model('Bookings', bookingSchema);

module.exports = bookings;
