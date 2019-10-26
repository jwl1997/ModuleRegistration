const express = require('express');
const router = express.Router();
const sql = require('../sql');
const app = express();

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* GET Register Module Page */
var register_list;
var modules;
var lecture_slots;
var selected_mod_code = 'Select Module';
var selected_mod_name = ''

router.get('/',function (req, res, next) {
	var s_username = 'e0191334';
	const query = "SELECT mod_code, day, s_time_lect, e_time_lect, rank_pref, reg_status FROM Register R WHERE R.s_username = $1";
	pool.query(query, [s_username], (err, data) => {
		if (err) {

		} else {
			console.log(data);
			register_list = data.rows;
			next();
		}
	});
})

router.get('/',function (req, res, next) {
	var s_username = 'e0191334';
	const query = "SELECT mod_code, mod_name FROM Modules M WHERE NOT EXISTS (SELECT 1 FROM Takes T WHERE T.s_username = $1 AND T.mod_code = M.mod_code AND T.has_completed = true) AND NOT EXISTS (SELECT 1 FROM Register R WHERE R.s_username = $1  AND R.mod_code = M.mod_code AND R.reg_status = 'success') AND (SELECT COUNT(*) FROM Prereq P WHERE P.child = M.mod_code) = (SELECT COUNT(*) FROM Prereq P JOIN Takes T ON P.parent = T.mod_code WHERE P.child = mod_code AND T.s_username = $1 )";
	pool.query(query, [s_username], (err, data) => {
		modules = data.rows;
		//res.render('register_module', { title: 'Register Module', modules: modules, register_list:register_list });
		console.log(data);
		next();
	});
})

router.get('/',function (req, res) {
	let mod_code;
	let sem = 1;
	if(lecture_slots == undefined){
		mod_code = 'CS1010';
		const query = "SELECT day, s_time_lect, e_time_lect FROM LectureSlots L WHERE L.mod_code = $1 AND L.sem = $2";
		pool.query(query, [mod_code,sem], (err, data) => {
			if (err) {
				console.log(err)
			} else {
				console.log(data);
				lecture_slots = data.rows;
				res.render('register_module', { title: 'Register Module', modules: modules, register_list: register_list, lecture_slots: lecture_slots, selected_mod_code: selected_mod_code });
			}
		});
	}
	else {
		res.render('register_module', { title: 'Register Module', modules: modules, register_list: register_list, lecture_slots: lecture_slots, selected_mod_code: selected_mod_code });
	}

})

router.get('/add_module',function (req, res) {
	let mod_code;
	if(req.query.module == undefined){
		mod_code = 'CS1010';
	}
	else {
		mod_code = req.query.module;
	}
	let sem = 1;
	const query = "SELECT day, s_time_lect, e_time_lect FROM LectureSlots L WHERE L.mod_code = $1 AND L.sem = $2";
	pool.query(query, [mod_code,sem], (err, data) => {
		if (err) {
			console.log(err)
		} else {
			console.log(data);
			lecture_slots = data.rows;
			selected_mod_code = mod_code;
			res.redirect('/register_module');
		}
	});
})





module.exports = router;
