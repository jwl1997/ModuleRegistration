var express = require('express');
var router = express.Router();

/* GET home page */
router.get('/', function(req, res, next) {
  res.render('dashboard_admin', { title: 'Dashboard - Admin' });
});

module.exports = router;
