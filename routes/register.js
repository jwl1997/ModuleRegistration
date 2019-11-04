const express = require('express');
const router = express.Router();
const sql = require('../sql');
const bcrypt = require('bcryptjs');

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* GET Register Page */
router.get('/', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

router.post('/', function(req, res, next) {
  const username = req.body.username;

  // Check if username exists
  pool.query(sql.query.auth_user, [username], (err, data) => {
    if (err) {
      unknownError(err, res);
    } else if (data.rows[0].exists) {
      userExistsError(res);
    } else {
      next();
    }
  });
});

const saltRounds = 10;
router.post('/', function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  // Generate hash
  bcrypt.genSalt(saltRounds, function (err, salt) {
    if (err) {
      hashFailedError(err, res);
    }
    bcrypt.hash(password, salt, function(err, hash) {
      if (err) {
        hashFailedError(err, res);
      }
      // Insert user to Users
      else {
        pool.query(sql.query.add_user, [username, hash], (err, data) => {
          if (err) {
            insertError('Users', err, res);
          } else if (data === undefined) {
            dataUndefinedError(res);
          } else {
            next();
          }
        });
      }
    })
  });
});

router.post('/', function(req, res, next) {
  const username = req.body.username;
  const role = req.body.role;
  const seniority = req.body.seniority;

  // If user is a Student, insert to Students
  if (role === 'Student') {
    pool.query(sql.query.add_student, [username, seniority], (err, data) => {
      if (err) {
        insertError('Students', err, res);
      } else if (data === undefined) {
        dataUndefinedError(res);
      }
    });
    // TODO: prompt student registration successful
    return res.redirect('/login');
  }
  // If user is an Admin, insert to Admins
  else if (role === 'Admin') {
    pool.query(sql.query.add_admin, [username], (err, data) => {
      if (err) {
        insertError('Admins', err, res);
      } else if (data === undefined) {
        dataUndefinedError(res);
      }
    });
    // TODO prompt admin registration successful
    return res.redirect('/login');
  }
  // User's role is neither a Student or an Admin
  else {
    noRoleError(res);
  }
});

function dataUndefinedError(res) {
  console.error('Data is undefined');
  return res.redirect('/register?undefined=fail');
}

function hashFailedError(err, res) {
  console.error('Hash failed');
  return res.redirect('/register?hash=fail');
}

function insertError(databaseName, err, res) {
  console.error('Unable to insert into ' + databaseName, err);
  return res.redirect('/register?insert=fail');
}

function noRoleError(res) {
  console.error('Role is neither a Student nor an Admin');
  return res.redirect('/register?role=fail');
}

function unknownError(err, res) {
  console.error('Something went wrong', err);
  return res.redirect('/register?unknown=fail');
}

function userExistsError(res) {
  console.info('User already exists in database');
  return res.redirect('/register?exists=fail');
}

module.exports = router;