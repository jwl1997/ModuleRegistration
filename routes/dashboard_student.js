const express = require('express');
const router = express.Router();
const sql = require('../sql');

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* GET Student Dashboard Page */
router.get('/', function(req, res, next) {
	res.render('dashboard_student', {
		title: 'Dashboard - Student',
		username: req.session.username,
		password: req.session.password,
		role: req.session.role
	});
});

module.exports = router;
