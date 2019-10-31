const express = require('express');
const router = express.Router();
const sql = require('../sql');

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

let modules;
let lectureSlots;

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
      lectureSlots = lectures.rows;
      res.render('lecture_slot', {
        title: 'Lecture Slot',
        modules: modules.rows,
        lectures: lectures.rows
      });
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
    req.body.module
  ], (err, data) => {
    if (err) {
      insertError('LectureSlots', err, res);
    } else {
      res.redirect('/lecture_slot');
    }
  });
});

router.post('/update', function(req, res) {
  const index = req.body.index - 1;
  const mod_code = req.body.mod_code;
  const sem = req.body.sem;
  const day = req.body.day;
  const s_time_lect = req.body.s_time_lect;
  const e_time_lect = req.body.e_time_lect;
  const quota = req.body.quota;

  let oldSlot = lectureSlots[index];
  let old_day = oldSlot.day;
  let old_s_time_lect = oldSlot.s_time_lect;
  let old_e_time_lect = oldSlot.e_time_lect;

  const query = 'UPDATE LectureSlots SET day = $1, s_time_lect = $2, e_time_lect = $3, quota = $4 WHERE mod_code = $5 AND sem = $6 AND day = $7 AND s_time_lect = $8 AND e_time_lect = $9';
  pool.query(query, [
    day,s_time_lect,e_time_lect,quota,mod_code,sem,old_day,old_s_time_lect,old_e_time_lect
  ], (err, data) => {
    if (err) {
      insertError('LectureSlots', err, res);
    } else {
      res.redirect('/lecture_slot');
    }
  });
});

router.get('/delete_lecture_slot', function(req, res, next) {
  const mod_code = req.query.module;
  const sem = req.query.sem;
  const day = req.query.day;
  const s_time_lect = req.query.s_time_lect;
  const e_time_lect = req.query.e_time_lect;

  pool.query(sql.query.delete_lecture, [
    mod_code, sem, day, s_time_lect, e_time_lect], (err, data) => {
    if (err) {
      deleteError('LectureSlot', err, res);
    } else {
      return res.redirect('/lecture_slot');
    }
  });
});

function deleteError(database, err, res) {
  console.error('Unable to delete from ' + database, err);
  return res.redirect('/lecture_slot?delete=fail');
}

function unknownError(err, res) {
  console.error('Something went wrong', err);
  return res.redirect('/dashboard_admin?load_lecture_slot=fail');
}

function insertError(database, err, res) {
  console.error('Unable to insert into ' + database, err);
  return res.redirect('/lecture_slot?insert=fail');
}

module.exports = router;
