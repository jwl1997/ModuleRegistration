const express = require('express');
const router = express.Router();
const sql = require('../sql');

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* GET Add Module Page */
router.get('/', function(req, res, next) {
  res.render('add_module', { title: 'Add Module' });
});

/* POST */
router.post('/', function(req, res, next) {
	pool.query(sql.query.add_module, [req.body.mod_code, req.body.mod_name,
    req.body.sem, req.body.username], (err, data) => {
		if (err) {
			console.error('Unable to insert into Modules', err);
			return res.redirect('/add_module');
		}

		pool.query(sql.query.add_lecture, [req.body.day, req.body.start_time,
      req.body.end_time, req.body.quota, req.body.mod_code], (err, data) => {
			if (err) {
				console.error('Unable to insert into LectureSlots', err);
				return res.redirect('/add_module');
			}
      return res.redirect('/dashboard_admin');
		});
	});
});

module.exports = router;
