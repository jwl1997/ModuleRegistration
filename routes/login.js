const express = require('express');
const router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* Get login page*/
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Module Registration System' });
});

/* POST */
router.post('/', function(req, res, next) {
  // Retrieve Information
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role;

  // Construct SQL Query
  var sql_query = "SELECT EXISTS (SELECT * FROM Users WHERE username = '" + username + "' AND password = '" + password + "')";

  // POST SQL Query and Retrieve Back Data
  pool.query(sql_query, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const isExist = data.rows[0].exists;
    if (isExist) {
      console.info('User exist in database');
      if (role === 'Student') {
        console.info('User is a student');
        return res.redirect('/dashboard_student');
      } else if (role === 'Admin') {
        console.info('User is an admin');
        return res.redirect('/dashboard_admin');
      } else {
        console.error('Something went wrong', err);
        return res.redirect('/users');
      }
    } else if (!isExist) {
      console.info('User does not exist in database');
      return res.redirect('/login');
    } else {
      console.error('Something went wrong', err);
      return res.redirect('/login');
    }
  });
});

module.exports = router;
