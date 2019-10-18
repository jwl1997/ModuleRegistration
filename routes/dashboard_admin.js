const express = require('express');
const router = express.Router();
const sql = require('../sql');

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* GET Admin Dashboard Page */
router.get('/', function(req, res, next) {
	pool.query(sql.query.load_admin_dashboard, [req.session.username], (err, values) => {
		res.render('dashboard_admin', {
			title: 'Dashboard - Admin',
			values: values.rows,
			username: req.session.username,
			password: req.session.password,
			role: req.session.role
		});
	});
});

module.exports = router;
