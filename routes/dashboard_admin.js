var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* GET Admin Dashboard page */
router.get('/', function(req, res, next) {
	res.render('dashboard_admin', { title: 'Dashboard - Admin' });
	var username = req.body.username;
	console.info(username);

	router.post('/', function(req, res, next) {
		var username = req.body.username;
		console.info(username);
	
		// Construct SQL Query
		var sql_query = "SELECT M.mod_code, M.mod_name, M.sem, S.day, S.s_time_lect, S.e_time_lect, S.quota FROM Modules M, LectureSlots S WHERE M.mod_code = S.mod_code AND M.a_username = '" + username + "'";
	
		pool.query(sql_query, (err, data) => {
			// res.render('dashboard_admin', { 
			// 	title: 'Dashboard - Admin', data: data.rows 
			// });
	
			// username = req.body.username;
	
			// sql_query = "SELECT M.mod_code, M.mod_name, M.sem, S.day, S.s_time_lect, S.e_time_lect, S.quota FROM Modules M, LectureSlots S WHERE M.mod_code = S.mod_code AND M.a_username = '" + username + "'";
	
			// pool.query(sql_query, (err, data) => {
			// 	if (err) {
			// 		console.error(err);
			// 	}
			// })
	
		});
	});

});

module.exports = router;
