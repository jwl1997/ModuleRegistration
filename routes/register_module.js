const express = require('express');
const router = express.Router();
const sql = require('../sql');

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* GET Register Module Page */
router.get('/', function(req, res, next) {
  pool.query(sql.query.load_programs, (err, data) => {
		res.render('register_module', { title: 'Register Module', data: data.rows });
	});
});

module.exports = router;
