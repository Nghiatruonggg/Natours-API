const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/AppError');
const viewRouter = require('./routes/viewRoutes');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoute');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Global Middlewares
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *

// app.use(cors({
//   origin: 'https://123.com/'
// }));

app.options('*', cors());

// Set security HTTP headers
// TODO: Setup directives specifically for mapbox's url allow
app.use(
  helmet({
    contentSecurityPolicy: {
      reportOnly: true
    }
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Max requests depends on the usage of the app
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour!'
});

// Set security limiter
app.use('/api', limiter);

// Body parser to json for req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS attacks
app.use(xss());

// Preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Compress all the text that is sent to the client
app.use(compression());

// Middleware testing
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

// Need to put below after all of the request cant hit the routers
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);
// Start the server
module.exports = app;
