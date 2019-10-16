const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

/* Using dotenv */
require('dotenv').config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

/* Login Page */
const loginRouter = require('./routes/login');

/* Register Page */
const registerRouter = require('./routes/register');

/* Student Dashboard Page */
const dashboardStudentRouter = require('./routes/dashboard_student');

/* Admin Dashboard Page */
const dashboardAdminRouter = require('./routes/dashboard_admin');

/* Register Module Page */
const regModRouter = require('./routes/register_module');

/* Add Program Page */
const addProgRouter = require('./routes/add_program');

/* Add Program Page */
const addModRouter = require('./routes/add_module');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
    sameSite: true
  }
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

/* Login Page */
app.use('/login', loginRouter);

/* Register Page */
app.use('/register', registerRouter);

/* Student Dashboard Page */
app.use('/dashboard_student', dashboardStudentRouter);

/* Admin Dashboard Page */
app.use('/dashboard_admin', dashboardAdminRouter);

/* Register Module Page */
app.use('/register_module', regModRouter);

/* Add Program Page */
app.use('/add_program', addProgRouter);

/* Add Module Page */
app.use('/add_module', addModRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
