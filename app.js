let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let session = require('express-session');
let favicon = require('serve-favicon');

/* Using dotenv */
require('dotenv').config();

const {
  NODE_ENV = 'development',
  SESSION_NAME = 'sid',
  SESSION_SECRET = 'secret',
  SESSION_LIFETIME = 1000 * 60 * 60 * 2
} = process.env;

const IN_PROD = NODE_ENV === 'production';

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

/* Configure Session */
app.use(session({
  name: SESSION_NAME,
  // Symmetric key used to sign the cookie
  secret: SESSION_SECRET,
  // Does not force the session to be saved back to the session store
  resave: false,
  // Does not force an uninitialized (new but unmodified) session to be saved
  // back to the session store
  saveUninitialized: false,
  cookie: {
    // JS on client-side won't be able to access the cookies
    httpOnly: false,
    // 2 hours before cookies expire
    maxAge: SESSION_LIFETIME,
    // Browser will only accept cookies from same domain
    sameSite: true,
    // HTTP in development and HTTPS in production
    secure: IN_PROD
  }
}));

const redirectLogin = (req, res, next) => {
  console.log(req.session.username);
  if (!req.session.username) {
    res.redirect('/login');
  } else {
    next()
  }
};

const redirectHome = (req, res, next) => {
  console.log(req.session.username);
  if (req.session.username) {
    if (req.session.role === 'Student') {
      res.redirect('/dashboard_student')
    } else {
      res.redirect('/dashboard_admin')
    }
  } else {
    next()
  }
};

// TODO: Have middleware to ensure all unauthenticated users be rerouted to login page

app.use('/', require('./routes/index'));

/* Login Page */
app.use('/login', require('./routes/login'));

/* Register Page */
app.use('/register', require('./routes/register'));

/* Student Dashboard Page */
app.use('/dashboard_student', require('./routes/dashboard_student'));

/* Admin Dashboard Page */
app.use('/dashboard_admin', require('./routes/dashboard_admin'));

/* Register Module Page */
app.use('/register_module', require('./routes/register_module'));

/* Program Page */
app.use('/program', require('./routes/program'));

/* Module Page */
app.use('/module', require('./routes/module'));

/* Lecture Slot Page */
app.use('/lecture_slot', require('./routes/lecture_slot'));

/* Prereq Parent Page */
app.use('/prereq', require('./routes/prereq'));

/* Prereq Child Page */
app.use('/prereq_child', require('./routes/prereq_child'));

/* Rounds Page */
app.use('/round', require('./routes/round'));

/* Logout */
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Unable to clear cookies', err);
      return res.redirect('/login?clear_cookie=fail');
    }
    res.clearCookie(SESSION_NAME);
    res.redirect('/login');
  })
});

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
