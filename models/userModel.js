const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

// name, email, photo, password, passwordConfirm

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name'],
      min: [6, 'The name needs to be longer'],
      max: 20,
    },
    email: {
      type: String,
      required: [true, 'We need an email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'This must be an email'],
    },
    photo: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'please provide the password'],
      min: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'you need to confirm your password'],
      validate: {
        // Only works on create() and save()
        validator: function (el) {
          return this.password === el;
        },
        message: 'password are not the same',
      },
    },
    active: {
      type: Boolean,
      default: true,
      select: true 
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true },
);

// eslint-disable-next-line prefer-arrow-callback
userSchema.pre('save', async function (next) {
  // Only runs when password is modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost 12 -> Delete passwordConfirm field
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function (next)  {
  if (!this.isModified('password') || this.isNew) return next();

  // Put passwordChangedAt behind one second for the token to create after password has changed
  this.passwordChangedAt = Date.now() - 1000;
  next();
})

userSchema.pre(/^find/, function (next) {
  // Points to the current query
  this.find({active: {$ne: false}})
  next()
})

userSchema.methods.correctPassword = async (
  candidatePassword,
  userPassword,
  // eslint-disable-next-line arrow-body-style
) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    console.log(changeTimestamp, JWTTimestamp);

    return JWTTimestamp < changeTimestamp;
  }

  // False means not change
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;
