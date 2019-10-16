const express = require('express');
const router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

// Construct SQL Query
let sql_query = "SELECT mod_code, mod_name FROM Modules ORDER BY mod_code ASC";

/* GET Add Program page */
router.get('/', function(req, res, next) {

	// GET SQL Query
	pool.query(sql_query, (err, data) => {
		if (err) {
			console.error(err);
		}
		console.info(data.rows);
		res.render('add_program', { 
			title: 'Add Program', data: data.rows
		});
	});
});

/* POST */
router.post('/', function(req, res, next) {
	const program = req.body.program;

	// Construct SQL Query
	sql_query = "INSERT INTO Programs VALUES ('" + program + "')";

	// POST SQL Query
	pool.query(sql_query, (err, data) => {
		if (err) {
			console.error('Unable to insert into Programs');
			return res.redirect('add_program');
		} else {
			console.info('Successfully inserted program');
			return res.redirect('/dashboard_admin');
		}
	});
});

module.exports = router;
