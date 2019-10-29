const express = require('express');
const router = express.Router();
const sql = require('../sql');

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

router.get('/', function(req, res, next) {
  pool.query(sql.query.load_appeal, [req.session.username], (err, appeals) => {
    if (err) {
      unknownError(err, res);
    } else {
      res.render('appeal', {
        title: 'Appeal',
        appeals: appeals.rows,
      });
    }
  });
});

router.get('/modify_appeal', function(req, res, next) {
  const mod_code = req.query.mod_code;
  const sem = req.query.sem;
  const day = req.query.day;
  const s_time_lect = req.query.s_time_lect;
  const e_time_lect = req.query.e_time_lect;
  const s_username = req.query.s_username;
  const status = req.query.status;

  pool.query(sql.query.update_appeal, [
    status,
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

router.get('/modify_appeal', function(req, res, next) {
  const mod_code = req.query.mod_code;
  const sem = req.query.sem;
  const day = req.query.day;
  const s_time_lect = req.query.s_time_lect;
  const e_time_lect = req.query.e_time_lect;
  const s_username = req.query.s_username;
  const status = req.query.status;

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
      if (status === 'Success') {
        next();
      } else {
        return res.redirect('/appeal');
      }
    }
  });
});

router.get('/modify_appeal', function(req, res, next) {
  const mod_code = req.query.mod_code;
  const s_username = req.query.s_username;

  pool.query(sql.query.add_takes, [s_username, mod_code], (err, data) => {
    if (err) {
      insertError('Takes', err, res);
    } else {
      return res.redirect('/appeal');
    }
  });
});

function unknownError(err, res) {
  console.error('Something went wrong', err);
  return res.redirect('/dashboard_admin?load_appeal=fail');
}

function insertError(database, err, res) {
  console.error('Unable to insert into ' + database, err);
  return res.redirect('/appeal?insert=fail');
}

module.exports = router;
