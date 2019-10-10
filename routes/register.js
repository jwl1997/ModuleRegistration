var express = require('express');
var router = express.Router();

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
  var username = req.body.username;
  var password = req.body.password;
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var role = req.body.role;

  // Construct SQL Query
  var sql_query = "INSERT INTO Users VALUES ('" + username + "', '" + password + "')";

  // POST SQL Query
  pool.query(sql_query, (err, data) => {
    if (err) {
      console.error('Unable to insert into Users table\n' + err);
      return;
    }

    if (role == 'Student') {
      console.info('Inserting into Students table');
      var level = req.body.level;
      var program = req.body.program;
      var year = req.body.year;
      var modules_taken = req.body.modules_taken;
      console.log(JSON.stringify(modules_taken));
  
      // Construct SQL Query
      sql_query = "INSERT INTO Students VALUES (" + 
      "'" + username + "', " +
      "'" + first_name + "', " + 
      "'" + last_name + "', " + 
      "'" + level + "', " + 
      "'" + program + "', " + 
      "'" + year + "', " + 
      "'{" + modules_taken + "}')";
    } else if (role == 'Admin') {
      var modules_set = req.body.modules_set;
      // console.log(JSON.stringify(modules_set));
      // console.log(JSON.parse(modules_set));
      // console.log(modules_set);
  
      console.info('Inserting into Admins table');
      sql_query = "INSERT INTO Admins VALUES (" + 
      "'" + username + "', " +
      "'" + first_name + "', " + 
      "'" + last_name + "', " + 
      "'{" + modules_set + "}')";
    } else {
      console.error('Something went wrong');
    }
  
    // POST SQL Query
    pool.query(sql_query, (err, data) => {
      if (err) {
        console.error('Unable to insert into Students or Admins tables\n' + err);
        sql_query = "DELETE FROM Users WHERE username = '" + username + "'";
        pool.query(sql_query, (err, data) => {});
      } else {
        console.info('Successfully inserted');
        return res.redirect('/login');
      }
      return;
    });
  });
})

module.exports = router;