const express = require('express');
const router = express.Router();
const sql = require('../sql');

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* GET Login Page*/
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Module Registration System' });
});

/* POST */
router.post('/', function(req, res, next) {
  // Retrieve Information
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role;

  pool.query(sql.query.login, [username, password], (err, data) => {
    if (err) {
      console.error(err);
      return res.redirect('/login');
    }
    console.info(data.rows);
    const isExist = data.rows[0].exists;
    if (isExist) {
      console.info('User exist in database');
      if (role === 'Student') {
        return res.redirect('/dashboard_student');
      } else if (role === 'Admin') {
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
