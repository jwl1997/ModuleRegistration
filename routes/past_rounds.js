const express = require('express');
const router = express.Router();
const sql = require('../sql');

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

router.get('/', function(req, res, next) {
	pool.query(sql.query.load_past_rounds, (err, data) => {
		if (err) {
		  unknownError(err, res);
		} else {
      res.render('past_rounds', {
        title: 'Past Rounds',
        past_rounds: data.rows,
      });
    }
	});
});

router.get('/select_round', function(req, res, next) {
  const s_time_round = getDateTime(req.query.s_time_round);
  const e_time_round = getDateTime(req.query.e_time_round);

  pool.query(sql.query.load_selected_register, [s_time_round, e_time_round], (err, values) => {
    if (err) {
      unknownError(err, res);
    } else {
      res.render('past_rounds_view', {
        title: 'Past Rounds',
        values: values.rows,
      });
    }
  });
});

function getDateTime(time) {
  const t = new Date(time);
  return t.getUTCFullYear() + "-" +
    (t.getUTCMonth() + 1) + "-" +
    t.getUTCDate() + " " +
    t.getUTCHours() + ":" +
    t.getUTCMinutes() + ":" +
    t.getUTCSeconds();
}

function unknownError(err, res) {
  console.error('Something went wrong', err);
  return res.redirect('/dashboard_admin?load_past_rounds=fail');
}

module.exports = router;
