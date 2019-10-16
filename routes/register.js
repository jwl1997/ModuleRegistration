const express = require('express');
const router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* GET register page */
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

  // Construct SQL Query
  var sql_query = "INSERT INTO Users VALUES ('" + username + "', '" + password + "')";

  // POST SQL Query
  pool.query(sql_query, (err, data) => {
    /* Catches duplicate keys. Prevents a user to register as Admin
    and as Student */
    if (err) {
      console.error('Unable to insert into Users table\n' + err);
      return res.redirect('/login');
    }

    if (role === 'Student') {
      console.info('Inserting into Students table');
  
      // Construct SQL Query
      sql_query = "INSERT INTO Students (s_username, seniority)" + "VALUES ('" + username + "', " + seniority + ")";
    } 
    else if (role === 'Admin') {
      console.info('Inserting into Admins table');
      sql_query = "INSERT INTO Admins VALUES ('" + username + "')";
    } 
    else {
      console.error('Something went wrong');
    }
  
    // POST SQL Query
    pool.query(sql_query, (err, data) => {
      if (err) {
        console.error('Unable to insert into Students or Admins tables\n' + err);
        sql_query = "DELETE FROM Users WHERE username = '" + username + "'";
        pool.query(sql_query, (err, data) => {});
        return res.redirect('/login');
      } else {
        console.info('Successfully inserted');
        return res.redirect('/login');
      }
    });
  });
});

module.exports = router;