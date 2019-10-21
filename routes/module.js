const express = require('express');
const router = express.Router();
const sql = require('../sql');

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

let modules;

router.get('/', function(req, res, next) {
	pool.query(sql.query.load_modules, (err, m) => {
		if (err) {
			unknownError(err, res);
		} else {
			modules = m;
			next();
		}
	});
});

router.get('/', function(req, res, next) {
	pool.query(sql.query.load_lectures, (err, lectures) => {
		if (err) {
			unknownError(err, res);
		} else {
			res.render('module', {
				title: 'Module',
				modules: modules.rows,
				lectures: lectures.rows,
			});
		}
	});
});

router.post('/', function(req, res, next) {
	pool.query(sql.query.add_module, [
		req.body.mod_code,
		req.body.mod_name,
		req.session.username
	], (err, data) => {
		if (err) {
			insertError('Module', err, res);
		} else {
			next();
		}
	});
});

router.post('/', function(req, res, next) {
	pool.query(sql.query.add_lecture, [
		req.body.day,
		req.body.start_time,
		req.body.end_time,
		req.body.sem,
		req.body.quota,
		req.body.mod_code
	], (err, data) => {
		if (err) {
      insertError('LectureSlots', err, res);
		} else {
      next();
		}
	});
});

router.post('/', function(req, res, next) {
	const prereqs = req.body.prereqs;
	const mod_code = req.body.mod_code;

	for (let i = 0; i < prereqs.length; i++) {
		pool.query(sql.query.add_prereq,
			[mod_code, prereqs[i]], (err, data) => {
				if (err) {
					insertError('Prereq', err, res);
				}
			});
	}
	// TODO: prompt admin insert queries successful
	return res.redirect('/module');
});

// Deleting modules from Module will affect Require and Prereq

// router.get('/delete_module', function(req, res, next) {
// 	const mod_code = req.query.module;
//
// 	pool.query(sql.query.delete_require, [mod_code], (err, data) => {
// 		if (err) {
// 			deleteError(err, res);
// 		} else {
// 			next();
// 		}
// 	});
// });
//
// router.get('/delete_module', function(req, res, next) {
// 	const mod_code = req.query.module;
//
// 	pool.query(sql.query.delete_module, [mod_code], (err, data) => {
// 		if (err) {
// 			deleteError('Module', err, res);
// 		} else {
// 			return res.redirect('/module');
// 		}
// 	});
// });

function deleteError(database, err, res) {
	console.error('Unable to delete from ' + database, err);
	return res.redirect('/module?delete=fail');
}

function unknownError(err, res) {
	console.error('Something went wrong', err);
	return res.redirect('/dashboard_admin?load_module=fail');
}

function insertError(database, err, res) {
	console.error('Unable to insert into ' + database, err);
	return res.redirect('/module?insert=fail');
}

module.exports = router;
