const express = require('express');
const router = express.Router();
const sql = require('../sql');

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});
var admin;
var last_s_time_round;
var last_e_time_round;
var sem = 1;
var round_start = false;
var err_msg = "";

/* GET Admin Dashboard Page */
router.get('/', function(req, res, next) {
	pool.query(sql.query.load_rounds, (err, rounds) => {
		if (err) {
			unknownError(err, res);
		} else {
			pool.query(sql.query.load_admin_dashboard, [req.session.username], (err, values) => {
				if (req.session.s_time_round !== ''){
					round_start = true;
				} else {
					round_start = false;
				}
				console.log(round_start);
				res.render('dashboard_admin', {
					title: 'Dashboard - Admin',
					values: values.rows,
					username: req.session.username,
					password: req.session.password,
					role: req.session.role,
					rounds: rounds.rows,
					err_msg: err_msg
				});
			});
		}
	});
});

router.get('/allocate', function (req, res) {
	if(round_start){
		err_msg = "Current registration round is still open. Please wait till: "+ req.session.e_time_round + " .";
		return res.redirect('/dashboard_admin');
	}
	console.log(req.session.last_e_time_round);
	admin = req.session.username;
	last_s_time_round = new Date(req.session.last_s_time_round).toLocaleString();
	last_e_time_round = new Date(req.session.last_e_time_round).toLocaleString();
	const query1 = "CREATE VIEW X AS SELECT r1.*, s.seniority, CASE WHEN r1.mod_code IN (SELECT re.mod_code FROM Require re WHERE re.prog_name = s.prog_name) THEN 10 ELSE 1 END AS prog_req FROM Register r1 join Students s on r1.s_username = s.s_username WHERE r1.s_time_round = '" + last_s_time_round + "' AND r1.e_time_round = '" + last_e_time_round + "' AND r1.sem = "+sem+" AND r1.mod_code IN (SELECT m.mod_code FROM Modules m WHERE m.a_username = '" + admin + "')";
	const query2 = 'UPDATE Register \n' +
		'SET priority_score = (10 - X.rank_pref) * X.seniority * X.prog_req\n' +
		'FROM X\n' +
		'WHERE Register.s_username = X.s_username AND \n' +
		'      Register.mod_code = X.mod_code AND\n' +
		'      Register.s_time_round = X.s_time_round AND\n' +
		'      Register.e_time_round = X.e_time_round AND\n' +
		'      Register.day = X.day AND\n' +
		'      Register.s_time_lect = X.s_time_lect AND\n' +
		'      Register.e_time_lect = X.e_time_lect AND\n' +
		'      Register.sem = X.sem';
	const query3 = 'CREATE VIEW Y AS \n' +
		'SELECT ranked_score.* \n' +
		'FROM (SELECT X.*, rank() OVER (PARTITION BY X.mod_code, X.day, X.s_time_lect, X.e_time_lect, X.sem ORDER BY priority_score DESC) FROM X) ranked_score\n' +
		'WHERE rank <= (\n' +
		'\tSELECT l.quota \n' +
		'\tFROM LectureSlots l\n' +
		'\tWHERE l.mod_code = ranked_score.mod_code AND\n' +
		'\t      l.sem = ranked_score.sem AND \n' +
		'\t      l.day = ranked_score.day AND\n' +
		'\t      l.s_time_lect = ranked_score.s_time_lect AND\n' +
		'\t      l.e_time_lect = ranked_score.e_time_lect)';
	const query4 = 'UPDATE Register \n' +
		'SET status = \'Success\'\n' +
		'FROM Y\n' +
		'WHERE Register.s_username = Y.s_username AND \n' +
		'      Register.mod_code = Y.mod_code AND\n' +
		'      Register.s_time_round = Y.s_time_round AND\n' +
		'      Register.e_time_round = Y.e_time_round AND\n' +
		'      Register.day = Y.day AND\n' +
		'      Register.s_time_lect = Y.s_time_lect AND\n' +
		'      Register.e_time_lect = Y.e_time_lect AND\n' +
		'      Register.sem = Y.sem';
	const query5 = 'UPDATE Register \n' +
		'SET status = \'Fail\'\n' +
		'FROM X\n' +
		'WHERE Register.s_username = X.s_username AND \n' +
		'      Register.mod_code = X.mod_code AND\n' +
		'      Register.s_time_round = X.s_time_round AND\n' +
		'      Register.e_time_round = X.e_time_round AND\n' +
		'      Register.day = X.day AND\n' +
		'      Register.s_time_lect = X.s_time_lect AND\n' +
		'      Register.e_time_lect = X.e_time_lect AND\n' +
		'      Register.sem = X.sem AND\n' +
		'      Register.status <> \'Success\'';
	const query6 = "INSERT INTO Takes (grade, has_completed, s_username, mod_code) SELECT DISTINCT 'IP', FALSE, s_username, mod_code FROM Y";
	const query7 = 'CREATE VIEW Z AS \n' +
		'WITH A AS ( SELECT l.*, (SELECT count(*) FROM Y WHERE Y.mod_code = l.mod_code AND\n' +
		'\t              Y.sem = l.sem AND\n' +
		'\t              Y.day = l.day AND\n' +
		'\t              Y.s_time_lect = l.s_time_lect AND\n' +
		'\t              Y.e_time_lect = l.e_time_lect) AS allocated\n' +
		'            FROM LectureSlots l)\n' +
		'SELECT * FROM A WHERE allocated > 0';
	const query8 = 'UPDATE LectureSlots\n' +
		'SET quota = Z.quota - Z.allocated\n' +
		'FROM Z\n' +
		'WHERE LectureSlots.mod_code = Z.mod_code AND\n' +
		'\t  LectureSlots.sem = Z.sem AND\n' +
		'\t  LectureSlots.day = Z.day AND\n' +
		'\t  LectureSlots.s_time_lect = Z.s_time_lect AND\n' +
		'\t  LectureSlots.e_time_lect = Z.e_time_lect';
	const query9 = 'DROP VIEW IF EXISTS Z';
	const query10 = 'DROP VIEW IF EXISTS Y';
	const query11 = 'DROP VIEW IF EXISTS X';
	console.log(query1)
	pool.query(query1, (err, data) => {
		console.log(err)
		console.log(data)
		pool.query(query2, (err, data) => {
			console.log(data)
			pool.query(query3, (err, data) => {
				console.log(data)
				pool.query(query4, (err, data) => {
					console.log(data)
					pool.query(query5, (err, data) => {
						console.log(data)
						pool.query(query6, (err, data) => {
							console.log(data)
							pool.query(query7, (err, data) => {
								console.log(data)
								pool.query(query8, (err, data) => {
									console.log(data)
									pool.query(query9, (err, data) => {
										console.log(data)
										pool.query(query10, (err, data) => {
											console.log(data)
											pool.query(query11, (err,data) => {
												console.log(data)
												return res.redirect('/dashboard_admin');
											})
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});

})

function unknownError(err, res) {
	console.error('Something went wrong', err);
	return res.redirect('/dashboard_admin?load_rounds=fail');
}

module.exports = router;
