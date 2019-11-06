const express = require('express');
const router = express.Router();
const sql = require('../sql');
const bcrypt = require('bcryptjs');

let fs = require('fs');
const sqlInit = fs.readFileSync('sql/init.sql').toString();

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

pool.query(sqlInit, function(err, data) {
  if (err) {
    console.log('Error initializing schema: ', err);
    process.exit(1);
  }
});

let round_time_err = "";

/* GET Login Page*/
router.get('/', function(req, res, next) {
  res.render('login', {
    title: 'Module Registration System',
    round_time_err: round_time_err,
    role_mismatch: req.query.role_mismatch,
    data_undefined: req.query.data_undefined,
    password_mismatch: req.query.password_mismatch,
    user_not_exist: req.query.user_not_exist,
    unknown: req.query.unknown,
    no_role: req.query.no_role
  });
});

router.post('/', function(req, res, next) {
  const username = req.body.username;

  // Check if username exists
  pool.query(sql.query.auth_user, [username], (err, data) => {
    if (err) {
      unknownError(err, res);
    } else if (!data.rows[0].exists) {
      userNotExistError(res);
    } else {
      next();
    }
  });
});

router.post('/', function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  // Authenticate password by comparing with hash
  pool.query(sql.query.get_hash, [username], (err, data) => {
    if (err) {
      unknownError(err, res);
    } else if (data === undefined) {
      dataUndefinedError(res);
    } else {
      const hashedPassword = data.rows[0].password;
      bcrypt.compare(password, hashedPassword, function(err, isMatch) {
        if (err) {
          unknownError(err, res);
        } else if (!isMatch) {
          passwordMismatchError(res);
        } else {
          req.session.password = hashedPassword;
          next();
        }
      });
    }
  });
});

router.post('/', function(req, res, next) {
  const username = req.body.username;
  const role = req.body.role;

  // If user is a Student, check in Students
  if (role === 'Student') {
    pool.query(sql.query.auth_student, [username], (err, data) => {
      if (!data.rows[0].exists) {
        roleMismatchError('Admin trying to log in as Student', res);
      } else {
        req.session.username = username;
        req.session.role = role;
        pool.query(sql.query.get_round_time, (err, data) => {
          if (err) {
            unknownError(err, res);
          } else {
            console.info(req.session);
            if(data.rows[0] === undefined){
              round_time_err = "You can not log in to this module registration system at this time. Please wait until the next registration round starts."
              console.log(round_time_err);
              return res.redirect('/login');
            }
            req.session.s_time_round = data.rows[0].s_time_round;
            req.session.e_time_round = data.rows[0].e_time_round;
            return res.redirect('/dashboard_student');
          }
        });
      }
    });
  }
  // If user is an Admin, check in Admins
  else if (role === 'Admin') {
    pool.query(sql.query.auth_admin, [username], (err, data) => {
      if (!data.rows[0].exists) {
        roleMismatchError('Student trying to log in as Admin', res);
      } else {
        req.session.username = username;
        req.session.role = role;
        //retrieve last round
        const query = 'SELECT * FROM Rounds ORDER BY s_time_round DESC LIMIT 1';
        pool.query(query,(err,rounds) => {
          if (err) {
            unknownError(err, res);
          } else {
            req.session.last_s_time_round = rounds.rows[0].s_time_round;
            req.session.last_e_time_round = rounds.rows[0].e_time_round;

            pool.query(sql.query.get_round_time, (err, data) => {
              if (err) {
                unknownError(err, res);
              } else {
                console.info(req.session);
                if(data.rows[0] === undefined){
                  req.session.s_time_round = '';
                  req.session.e_time_round = '';
                } else {
                  req.session.s_time_round = data.rows[0].s_time_round;
                  req.session.e_time_round = data.rows[0].e_time_round;
                }
                return res.redirect('/dashboard_admin');
              }
            });

          }
        });
      }
    });
  }
  // User's role is neither a Student or an Admin
  else {
    noRoleError(res);
  }
});

function dataUndefinedError(res) {
  console.error('Data is undefined');
  return res.redirect('/login?data_undefined=fail');
}

function roleMismatchError(comment, res) {
  console.info(comment);
  return res.redirect('/login?role_mismatch=fail');
}

function passwordMismatchError(res) {
  console.info("Password doesn't match!");
  return res.redirect('/login?password_mismatch=fail');
}

function noRoleError(res) {
  console.error('Role is neither a Student nor an Admin');
  return res.redirect('/login?no_role=fail');
}

function unknownError(err, res) {
  console.error('Something went wrong', err);
  return res.redirect('/login?unknown=fail');
}

function userNotExistError(res) {
  console.info('User does not exist in database');
  return res.redirect('/login?user_not_exist=fail');
}

module.exports = router;
