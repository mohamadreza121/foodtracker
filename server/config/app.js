const express = require('express');
const { setUser } = require('../middleware/authmiddleware');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./db'); // Database connection
const createError = require('http-errors');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to Database
connectDB();

// View engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(setUser);
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../node_modules')));

// Make user available in all views
app.use((req, res, next) => {
  res.locals.user = req.user || null; // Pass `req.user` to all views or null if not logged in
  next();
});


// Import routers
const indexRouter = require('../routes/index');
const userRouter = require('../routes/userroutes');
const foodRouter = require('../routes/foodroutes');
const { required } = require('joi');

// Use routers
app.use('/', indexRouter);
app.use('/userroutes', userRouter);
app.use('/foodroutes', foodRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', { error: res.locals.error });
});

module.exports = app;
