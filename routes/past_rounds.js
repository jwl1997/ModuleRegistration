const express = require('express');
const router = express.Router();
const sql = require('../sql');

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

var past_rounds = [];
var values = [];
var selected_round = "Select Past Round";
var sem = 1;
var reload = false;
var index = 0;

router.get('/', function(req, res) {
    if(reload){
        let admin = req.session.username;
        const s_time_round = past_rounds[index].s_time_round;
        const e_time_round = past_rounds[index].e_time_round;
        pool.query(sql.query.load_selected_register, [s_time_round, e_time_round, admin], (err, data) => {
            if (err) {
                unknownError(err, res);
            } else {
                console.log(data)
                values = data.rows;
                for (let i=0; i<values.length; i++){
                    values[i].s_time_round = new Date(values[i].s_time_round).toLocaleString();
                    values[i].e_time_round = new Date(values[i].e_time_round).toLocaleString();
                }
                reload = false;
                return res.render('past_rounds', {
                    title: 'Past Rounds',
                    past_rounds: past_rounds,
                    role: req.session.role,
                    username: req.session.username,
                    values: values,
                    selected_round: selected_round,

                });
            }
        });
    }
	pool.query(sql.query.load_past_rounds, (err, data) => {
		if (err) {
		  unknownError(err, res);
		} else {
		    past_rounds = data.rows;
		    for (let i=0; i<past_rounds.length; i++){
		        past_rounds[i].s_time_round = new Date(past_rounds[i].s_time_round).toLocaleString();
		        past_rounds[i].e_time_round = new Date(past_rounds[i].e_time_round).toLocaleString();
            }
            return res.render('past_rounds', {
            title: 'Past Rounds',
            past_rounds: past_rounds,
            values: values,
            selected_round: selected_round,
                role: req.session.role,
                username: req.session.username
      });
    }
	});
});

router.get('/select_round', function(req, res) {
  let admin = req.session.username;
  index = req.query.index;
  const s_time_round = past_rounds[index].s_time_round;
  const e_time_round = past_rounds[index].e_time_round;
  selected_round = s_time_round + " - " + e_time_round;

  pool.query(sql.query.load_selected_register, [s_time_round, e_time_round, admin], (err, data) => {
    if (err) {
      unknownError(err, res);
    } else {
        console.log(data)
        values = data.rows;
      return res.redirect('/past_rounds');
    }
  });
});

router.get('/allocate', function (req, res) {

    let admin = req.session.username;
    let last_s_time_round = selected_round.slice(0,selected_round.indexOf('-')-1);
    let last_e_time_round = selected_round.slice(selected_round.indexOf('-')+1,selected_round.length);
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
                                                reload = true;
                                                return res.redirect('/past_rounds');
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
  return res.redirect('/dashboard_admin?load_past_rounds=fail');
}

module.exports = router;
