var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* Get */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Module Registration System' });
});

/* POST */
router.post('/', function(req, res, next) {
  // Retrieve Information
  var username = req.body.username;
  var password = req.body.password;
  var role = req.body.role;

  // Construct Specific SQL Query
  var sql_query = "SELECT EXISTS (SELECT * FROM Users WHERE username = '" + username + "' AND password = '" + password + "')";

  pool.query(sql_query, (err, data) => {
    res.render('display', {
      title: 'Database Connect', data: data.rows
    });
    // if (err) {
    //   return res.redirect('/login?login=fail');
    // } else {
    //   return res.redirect('/register');
    // }
  });
});

module.exports = router;
