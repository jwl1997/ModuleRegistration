const express = require('express');
const router = express.Router();
const sql = require('../sql');

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// TODO: As of now, unable to delete programs that are being referenced in Students

router.get('/', function(req, res, next) {
  const prog_name = req.query.program;

  pool.query(sql.query.delete_program, [prog_name], (err, data) => {
    if (err) {
      deleteError(err, res);
    } else {
      return res.redirect('/program');
    }
  });
});

function deleteError(err, res) {
  console.error(err);
  return res.redirect('/program?delete=fail');
}

module.exports = router;
