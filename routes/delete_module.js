const express = require('express');
const router = express.Router();
const sql = require('../sql');

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

router.get('/', function(req, res, next) {
  const mod_code = req.query.module;

  pool.query(sql.query.delete_require, [mod_code], (err, data) => {
    if (err) {
      deleteError(err, res);
    } else {
      next();
    }
  });
});

router.get('/', function(req, res, next) {
  const mod_code = req.query.module;

  pool.query(sql.query.delete_module, [mod_code], (err, data) => {
    if (err) {
      deleteError(err, res);
    } else {
      return res.redirect('/module');
    }
  });
});

function deleteError(err, res) {
  console.error(err);
  return res.redirect('/module?delete=fail');
}

module.exports = router;
