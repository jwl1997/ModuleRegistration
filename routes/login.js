const express = require('express');
const router = express.Router();
const sql = require('../sql');
// DO NOT DELETE: Hashed Password Implementation
// const bcrypt = require('bcryptjs');

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* GET Login Page*/
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Module Registration System' });
});

router.post('/', function(req, res, next) {
  const username = req.body.username;

  // Check if username exists
  pool.query(sql.query.auth_user, [username], (err, data) => {
    if (err) {
      unknownError(err, res);
    } else if (!data.rows[0].exists) {
      userNotExistsError(res);
    } else {
      next();
    }
  });
});

// Non-hashed Password Implementation
router.post('/', function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  // Authenticate password
  pool.query(sql.query.get_hash, [username], (err, data) => {
    if (err) {
      unknownError(err, res);
    } else if (data === undefined) {
      dataUndefinedError(res);
    } else {
      const postgresPassword = data.rows[0].password;
      if (postgresPassword !== password) {
        passwordMismatchError(res);
      } else {
        req.session.password = password;
        next();
      }
    }
  })
});

// DO NOT DELETE: Hashed Password Implementation
// router.post('/', function(req, res, next) {
//   const username = req.body.username;
//   const password = req.body.password;
//
//   // Authenticate password by comparing with hash
//   pool.query(sql.query.get_hash, [username], (err, data) => {
//     if (err) {
//       unknownError(err, res);
//     } else if (data === undefined) {
//       dataUndefinedError(res);
//     } else {
//       const hashedPassword = data.rows[0].password;
//       bcrypt.compare(password, hashedPassword, function(err, isMatch) {
//         if (err) {
//           unknownError(err, res);
//         } else if (!isMatch) {
//           passwordMismatchError(res);
//         } else {
//           req.session.password = hashedPassword;
//           next();
//         }
//       });
//     }
//   });
// });

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
            req.session.s_time_round = data.rows[0].s_time_round;
            req.session.e_time_round = data.rows[0].e_time_round;
            console.info(req.session);
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
        pool.query(sql.query.get_round_time, (err, data) => {
          if (err) {
            unknownError(err, res);
          } else {
            req.session.s_time_round = data.rows[0].s_time_round;
            req.session.e_time_round = data.rows[0].e_time_round;
            console.info(req.session);
            return res.redirect('/dashboard_admin');
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
  return res.redirect('/login?undefined=fail');
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
  return res.redirect('/login?role=fail');
}

function unknownError(err, res) {
  console.error('Something went wrong', err);
  return res.redirect('/login?login=fail');
}

function userNotExistsError(res) {
  console.info('User does not exist in database');
  return res.redirect('/login?exists=fail');
}

module.exports = router;
