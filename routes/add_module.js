const express = require('express');
const router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* GET Add Module page */
router.get('/', function(req, res, next) {
  res.render('add_module', { title: 'Add Module' });
});

/* POST */
router.post('/', function(req, res, next) {
	var mod_code = req.body.mod_code;
	var mod_name = req.body.mod_name;
	var sem = req.body.sem;
	var username = req.body.username;
	var quota = req.body.quota;
	var day = req.body.day;
	var start_time = req.body.start_time;
	var end_time = req.body.end_time;

	// Construct SQL Query
	var sql_query = "INSERT INTO Modules VALUES ('" + mod_code + "', '" + 
	mod_name + "', " + sem + ", '" + username + "')";

	// POST SQL Query
	pool.query(sql_query, (err, data) => {
		if (err) {
			console.error('Unable to insert into Modules', err);
			return res.redirect('/add_module');
		}

		// Construct SQL Query
		sql_query = "INSERT INTO LectureSlots VALUES ('" + day + "', '" + 
		start_time + "', '" + end_time + "', " + quota + ", '" + mod_code + 
		"')";

		// POST SQL Query
		pool.query(sql_query, (err, data) => {
			if (err) {
				console.error('Unable to insert into LectureSlots', err);
				return res.redirect('/add_module');
			} else {
				console.info('Successfully inserted into Modules and LectureSlots');
				return res.redirect('/dashboard_admin');
			}
		});
	});

});

module.exports = router;
