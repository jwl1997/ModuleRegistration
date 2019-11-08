const express = require('express');
const router = express.Router();
const sql = require('../sql');

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

let enrolledLectures;
let registeredLectures;

router.get('/', function(req, res, next) {
	console.log("time")
	console.log(new Date(req.session.s_time_round));
	console.log(req.session.s_time_round);
	pool.query(sql.query.load_current_takes, [req.session.username], (err, data) => {
		if (err) {
			unknownError(err, res);
		} else {
			enrolledLectures = data.rows;
			for (let i=0; i<enrolledLectures.length; i++){
				enrolledLectures[i].s_time_round = new Date(enrolledLectures[i].s_time_round).toLocaleString();
				enrolledLectures[i].e_time_round = new Date(enrolledLectures[i].e_time_round).toLocaleString();
			}
			next();
		}
	});
});

router.get('/', function(req, res, next) {
	pool.query(sql.query.load_register, [req.session.username], (err, data) => {
		if (err) {
			unknownError(err, res);
		} else {
			registeredLectures = data.rows;
			for (let i=0; i<registeredLectures.length; i++){
				registeredLectures[i].s_time_round = new Date(registeredLectures[i].s_time_round).toLocaleString();
				registeredLectures[i].e_time_round = new Date(registeredLectures[i].e_time_round).toLocaleString();
			}
			res.render('dashboard_student', {
				title: 'Dashboard - Student',
				username: req.session.username,
				password: req.session.password,
				role: req.session.role,
				registeredLectures: registeredLectures,
				enrolledLectures: enrolledLectures
			});
		}
	});
});

router.get('/appeal', function(req, res, next) {
	const mod_code = req.query.mod_code;
	const sem = req.query.sem;
	const day = req.query.day;
	const s_time_lect = req.query.s_time_lect;
	const e_time_lect = req.query.e_time_lect;
	const s_username = req.query.s_username;
	const status = "Appeal Pending";

	pool.query(sql.query.add_appeal, [
		status,
		day,
		mod_code,
		s_time_lect,
		e_time_lect,
		sem,
		s_username
	], (err, data) => {
		if (err) {
			insertError('Appeal', err, res);
		} else {
			next();
		}
	});
});

router.get('/appeal', function(req, res, next) {
	const mod_code = req.query.mod_code;
	const sem = req.query.sem;
	const day = req.query.day;
	const s_time_lect = req.query.s_time_lect;
	const e_time_lect = req.query.e_time_lect;
	const s_username = req.query.s_username;
	const status = "Appeal Pending";

	pool.query(sql.query.update_register, [
		status,
		mod_code,
		sem,
		day,
		s_time_lect,
		e_time_lect,
		s_username
	], (err, data) => {
		if (err) {
			insertError('Register', err, res);
		} else {
			return res.redirect('/dashboard_student');
		}
	});
});

router.get('/delete', function(req, res, next) {
	const mod_code = req.query.mod_code;
	const sem = req.query.sem;
	const day = req.query.day;
	const s_time_lect = req.query.s_time_lect;
	const e_time_lect = req.query.e_time_lect;
	const s_username = req.query.s_username;

	pool.query(sql.query.delete_appeal, [
		mod_code,
		sem,
		day,
		s_time_lect,
		e_time_lect,
		s_username
	], (err, data) => {
		if (err) {
			insertError('Appeal', err, res);
		} else {
			next();
		}
	});
});

router.get('/delete', function(req, res, next) {
	const mod_code = req.query.mod_code;
	const sem = req.query.sem;
	const day = req.query.day;
	const s_time_lect = req.query.s_time_lect;
	const e_time_lect = req.query.e_time_lect;
	const s_username = req.query.s_username;
	const status = "Fail";

	pool.query(sql.query.update_register, [
		status,
		mod_code,
		sem,
		day,
		s_time_lect,
		e_time_lect,
		s_username
	], (err, data) => {
		if (err) {
			insertError('Register', err, res);
		} else {
			return res.redirect('/dashboard_student');
		}
	});
});

function unknownError(err, res) {
	console.error('Something went wrong', err);
	return res.redirect('/login?load_dashboard_student=fail');
}

function insertError(database, err, res) {
	console.error('Unable to insert into ' + database, err);
	return res.redirect('/dashboard_student?insert=fail');
}

module.exports = router;
