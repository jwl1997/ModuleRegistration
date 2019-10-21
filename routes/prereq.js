const express = require('express');
const router = express.Router();
const sql = require('../sql');

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

let modules;
let dbPrereqs;

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
      res.render('prereq', {
        title: 'Prerequisite',
        parents: modules.rows,
        children: modules.rows,
        prereqs: p.rows
      });
    }
  });
});

// RULES:
// 1. No duplicate entries of (parent, child)
// 2. Parent is always larger than child

// Get all Prereq entries from the database
let parent;
router.post('/select_parent', function(req, res, next) {
  parent = req.query.parent;
  pool.query(sql.query.load_prereqs, (err, data) => {
    if (err) {
      unknownError(err, res);
    } else {
      dbPrereqs = data.rows;
      next();
    }
  });
});

router.post('/select_parent', function(req, res, next) {
  const clientChildren = req.body.children;
  let resultPrereqs = [];

  // Filter away the duplicate entries by users
  for (let i = 0; i < clientChildren.length; i++) {
    let isDuplicate = false;
    for (let j = 0; j < dbPrereqs.length; j++) {
      if (parent === dbPrereqs[j].parent && clientChildren[i] === dbPrereqs[j].child) {
        isDuplicate = true;
      }
    }
    // Also check that parent's mod_code is larger than child's mod_code
    if (!isDuplicate && parent > clientChildren[i]) {
      resultPrereqs.push({'parent': parent, 'child': clientChildren[i]});
    }
  }

  // Insert the remaining unique entries into database
  for (let i = 0; i < resultPrereqs.length; i++) {
    pool.query(sql.query.add_prereq, [resultPrereqs[i].parent, resultPrereqs[i].child], (err, data) => {
      if (err) {
        insertError('Prerequisite', err, res);
      }
    });
  }
  res.redirect('/prereq');
});

router.get('/delete_prereq', function(req, res, next) {
  const parent = req.query.parent;
  const child = req.query.child;

  pool.query(sql.query.delete_prereq, [parent, child], (err, data) => {
    if (err) {
      deleteError('Prereq', err, res);
    } else {
      return res.redirect('/prereq');
    }
  });
});

router.get('/select_parent', function(req, res, next) {
  const parent = req.query.parent;

  pool.query(sql.query.get_filtered_modules, [parent], (err, children) => {
    if (err) {
      getError('Modules', err, res);
    } else {
      res.render('prereq_child', {
        title: 'Prerequisite',
        parent: parent,
        children: children.rows,
      });
    }
  });
});

function getError(database, err, res) {
  console.error('Unable to get from ' + database, err);
  return res.redirect('/prereq?get=fail');
}

function deleteError(database, err, res) {
  console.error('Unable to delete from ' + database, err);
  return res.redirect('/prereq?delete=fail');
}

function unknownError(err, res) {
  console.error('Something went wrong', err);
  return res.redirect('/dashboard_admin?load_prereq=fail');
}

function insertError(database, err, res) {
  console.error('Unable to insert into ' + database, err);
  return res.redirect('/prereq?insert=fail');
}

module.exports = router;
