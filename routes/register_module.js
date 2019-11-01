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
var selected_mod_name = '';
var current_user = 'e0191334';
var err_msg = "";
var err_add = "";
var is_ranking_action = false;
var current_round_start_time;
var current_round_end_time;
var current_sem = 1;

router.get('/',function (req, res, next) {
	current_user = req.session.username;
	current_round_start_time = new Date(req.session.s_time_round).toLocaleString();
	current_round_end_time = new Date(req.session.e_time_round).toLocaleString();
	console.log("current round")
	console.log(current_round_start_time)
	if(is_ranking_action){
		is_ranking_action = false;
		next();
	}
	else{
		err_msg = "";
		const query = "SELECT mod_code, day, s_time_lect, e_time_lect, rank_pref, status, s_time_round, e_time_round, sem  FROM Register R WHERE R.s_username = $1 AND R.s_time_round = $2 AND R.e_time_round = $3 AND R.sem = $4";
		pool.query(query, [current_user, current_round_start_time, current_round_end_time, current_sem], (err, data) => {
			if (err) {

			} else {
				register_list = data.rows;
				next();
			}
		});
	}
})

router.get('/',function (req, res, next) {
	const query = "SELECT mod_code, mod_name FROM Modules M WHERE NOT EXISTS (SELECT 1 FROM Takes T WHERE T.s_username = $1 AND T.mod_code = M.mod_code AND T.has_completed = true) AND NOT EXISTS (SELECT 1 FROM Register R WHERE R.s_username = $1  AND R.mod_code = M.mod_code AND R.status = 'Success') AND (SELECT COUNT(*) FROM Prereq P WHERE P.child = M.mod_code) = (SELECT COUNT(*) FROM Prereq P JOIN Takes T ON P.parent = T.mod_code WHERE P.child = mod_code AND T.s_username = $1 )";
	pool.query(query, [current_user], (err, data) => {
		modules = data.rows;
		next();
	});
})

router.get('/',function (req, res) {
	if(lecture_slots == undefined){
		lecture_slots = [];
	}
	res.render('register_module', { title: 'Register Module', modules: modules, register_list: register_list, lecture_slots: lecture_slots, selected_mod_code: selected_mod_code, selected_mod_name:selected_mod_name, err_msg:err_msg, err_add:err_add });
})

router.get('/add_module',function (req, res) {
	let mod_code;
	if(req.query.module == undefined){
		lecture_slots = [];
		 res.redirect('/register_module');
	}
	else {
		mod_code = req.query.module;
		const query = "SELECT day, s_time_lect, e_time_lect FROM LectureSlots L WHERE L.mod_code = $1 AND L.sem = $2";
		pool.query(query, [mod_code, current_sem], (err, data) => {
			if (err) {
				console.log(err)
			} else {
				console.log(data)
				lecture_slots = data.rows;
				selected_mod_code = mod_code;
				console.log("modules")
				console.log(modules)
				for (let i = 0; i < modules.length; i++) {
					if (modules[i].mod_code == selected_mod_code) {
						selected_mod_name = modules[i].mod_name;
						break;
					}
				}
				err_add = "";
				return res.redirect('/register_module');
			}
		});
	}
})

router.get('/save', function (req, res){
	console.log("All lecture slots");
	console.log(lecture_slots)
	let lecture_slot = lecture_slots[req.query.index];
	console.log(lecture_slot);
	const query = "INSERT INTO Register VALUES(0,1,'Result Pending',$1,$2,$3,$4,$5,$6,$7,$8)";
	pool.query(query, [current_user,current_round_start_time,current_round_end_time,lecture_slot.day,lecture_slot.s_time_lect,lecture_slot.e_time_lect,current_sem,selected_mod_code], (err, data) => {
		if (err) {
			console.log(err);
			selected_mod_code = 'Select Module';
			selected_mod_name = '';
			res.redirect('/register_module');
		} else {
			console.log("insert register");
			console.log(data);
			if(data.rowCount == 0){
				err_add = "Fail to register the module. The lecture slot may be full, or you may already have registered another lecture slot for this module."
			}
			selected_mod_code = 'Select Module';
			selected_mod_name = '';
			res.redirect('/register_module');
		}
	});
})

router.get('/delete', function(req, res) {
	let mod_code = req.query.module;
	let sem = current_sem;
	let day;
	let s_time_lect;
	let e_time_lect;
	let s_time_round;
	let e_time_round;
	let i=0;
	for(;i<register_list.length;i++){
		if(register_list[i].mod_code == mod_code){
			day = register_list[i].day;
			s_time_lect = register_list[i].s_time_lect;
			e_time_lect = register_list[i].e_time_lect;
			s_time_round = register_list[i].s_time_round;
			e_time_round = register_list[i].e_time_round;
			break;
		}
	}
	console.log("delete");
	console.log(register_list[i]);
	const query = 'DELETE FROM Register WHERE mod_code = $1 AND sem = $2 AND day = $3 AND s_time_lect = $4 AND e_time_lect = $5 AND s_username = $6 AND s_time_round = $7 AND e_time_round = $8';
	pool.query(query, [mod_code, sem, day, s_time_lect, e_time_lect, current_user, s_time_round, e_time_round], (err, data) => {
		if (err) {
			deleteError('LectureSlot', err, res);
		} else {
			console.log(data);
			register_list = [];
			return res.redirect('/register_module');
		}
	});
});

router.get('/update_rank',function (req, res) {
	let index = req.query.index;
	let rank_pref = req.query.rank_pref;
	register_list[index].rank_pref = rank_pref;
	is_ranking_action = true;
	return res.redirect('/register_module');
})

router.get('/update_rankings', function (req, res) {
	err_msg = "";
	let valid = true;
	//check no duplicate ranks and rank 0
	for (let i=0;i<register_list.length && valid;i++){
		if(register_list[i].rank_pref == 0){
			valid = false;
			break;
		}
		for(let j=i+1;j<register_list.length;j++){
			if(register_list[i].rank_pref == register_list[j].rank_pref){
				valid = false;
				break;
			}
		}
	}
	if(valid) {
		const query = 'UPDATE Register SET rank_pref = $9 WHERE mod_code = $1 AND sem = $2 AND day = $3 AND s_time_lect = $4 AND e_time_lect = $5 AND s_username = $6 AND s_time_round = $7 AND e_time_round = $8';
		for(let index=0;index<register_list.length;index++){
			register_list[index].rank_pref = parseInt(register_list[index].rank_pref,10);
			console.log("register to update")
			console.log(register_list[index]);
			pool.query(query, [register_list[index].mod_code, register_list[index].sem, register_list[index].day, register_list[index].s_time_lect, register_list[index].e_time_lect, current_user, register_list[index].s_time_round, register_list[index].e_time_round, register_list[index].rank_pref], (err, data) => {
				if (err) {
					console.log(err);
				} else {
					console.log("update");
					console.log(data);
					if(index==register_list.length-1){
						return res.redirect('/register_module');
					}
				}7
			});
		}
		//return res.redirect('/register_module');
	} else {
		is_ranking_action = true;
		err_msg = "Invalid rankings. Please reset the rankings.";
		console.log(err_msg);
		return res.redirect('/register_module');
	}
})


function deleteError(database, err, res) {
	console.error('Unable to delete from ' + database, err);
	return res.redirect('/register?delete=fail');
}


module.exports = router;
