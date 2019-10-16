const express = require('express');
const router = express.Router();
const sql = require('../sql');

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* GET Register Page */
router.get('/', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

/* POST */
router.post('/', function(req, res, next) {
  // Retrieve Information
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role;
  const seniority = req.body.seniority;

  console.log(req.body.modules_taken);
  console.log(req.body.modules_set);

  if (role === 'Student') {
    pool.query(sql.query.add_user, [username, password], (err, data) => {
      if (err) {
        console.error('Unable to insert into Users', err);
        return res.redirect('/register');
      }
      pool.query(sql.query.add_student, [username, seniority], (err, data) => {
        if (err) {
          console.error('Unable to insert into Students', err);
          return res.redirect('/register');
        }
      });
    });
    // TODO prompt student registration successful
    return res.redirect('/login');
  } else if (role === 'Admin') {
    pool.query(sql.query.add_user, [username, password], (err, data) => {
      if (err) {
        console.error('Unable to insert into Users', err);
        return res.redirect('/register');
      }
      pool.query(sql.query.add_admin, [username], (err, data) => {
        if (err) {
          console.error('Unable to insert into Admins', err);
          return res.redirect('/register');
        }
      });
    });
    // TODO prompt admin registration successful
    return res.redirect('/login');
  } else {
    console.error('Something went wrong');
    // TODO prompt user registration failed
    return res.redirect('/register');
  }
});

module.exports = router;