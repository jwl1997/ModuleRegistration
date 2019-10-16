const express = require('express');
const router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

var sql_query = 'SELECT * FROM DummyStudentDashboard';

/* GET home page */
router.get('/', function(req, res, next) {
	pool.query(sql_query, (err, data) => {
		res.render('dashboard_student', { 
      		title: 'Dashboard - Student', data: data.rows
    	});
	});
});

module.exports = router;
