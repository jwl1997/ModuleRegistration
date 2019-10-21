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
  pool.query(sql.query.load_prereqs, (err, p) => {
    if (err) {
      unknownError(err, res);
    } else {
      res.render('prereq_child', {
        title: 'Prerequisite',
        parents: modules.rows,
        children: modules.rows,
        prereqs: p.rows
      });
    }
  });
});

function unknownError(err, res) {
  console.error('Something went wrong', err);
  return res.redirect('/dashboard_admin?load_prereq_child=fail');
}

module.exports = router;
