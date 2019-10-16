const express = require('express');
const router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* SQL Query */
let sql_query = 'SELECT * FROM Programs';

/* GET home page */
router.get('/', function(req, res, next) {
  pool.query(sql_query, (err, data) => {
		res.render('register_module', { title: 'Register Module', data: data.rows });
	});
});

module.exports = router;
