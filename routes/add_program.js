const express = require('express');
const router = express.Router();
const sql = require('../sql');

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* GET Add Program Page */
router.get('/', function(req, res, next) {
	pool.query(sql.query.load_modules, (err, data) => {
		if (err) {
			console.error(err);
			return res.redirect('/dashboard_admin?load=fail');
		}
		res.render('add_program', {
			title: 'Add Program', data: data.rows
		});
	});
});

/* POST */
router.post('/', function(req, res, next) {
	const program = req.body.program;
	pool.query(sql.query.add_program, [program], (err, data) => {
		if (err) {
			console.error('Unable to insert into Programs');
			return res.redirect('add_program?insert=fail');
		}
		const modules = req.body.modules;
		for (let i = 0; i < modules.length; i++) {
			pool.query(sql.query.add_required_modules_to_program, [program, modules[i]], (err, data) => {
				if (err) {
					console.error('Unable to insert into Require');
					return res.redirect('/program?insert=fail');
				}
			});
		}
		// TODO prompt admin insert queries successful
		return res.redirect('/dashboard_admin');
	});
});

module.exports = router;
