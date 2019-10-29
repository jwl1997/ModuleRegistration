const sql = {};

sql.query = {
  get_hash: 'SELECT password FROM Users WHERE username = $1',
  auth_user: 'SELECT EXISTS (SELECT * FROM Users WHERE username = $1)',
  auth_student: 'SELECT EXISTS (SELECT s_username FROM Students WHERE s_username = $1)',
  auth_admin: 'SELECT EXISTS (SELECT a_username FROM Admins WHERE a_username = $1)',

  add_user: 'INSERT INTO Users (username, password) VALUES ($1, $2)',
  add_student: 'INSERT INTO Students (s_username, seniority) VALUES ($1, $2)',
  add_admin: 'INSERT INTO Admins (a_username) VALUES ($1)',

  // load_student_dashboard: 'SELECT * FROM DummyStudentDashboard',
  load_admin_dashboard: 'SELECT M.mod_code, M.mod_name, S.sem, S.day, S.s_time_lect, S.e_time_lect, S.quota FROM Modules M, LectureSlots S WHERE M.mod_code = S.mod_code AND M.a_username = $1',

  load_programs: 'SELECT prog_name FROM Programs',
  add_program: 'INSERT INTO Programs (prog_name) VALUES ($1)',
  delete_program: 'DELETE FROM Programs WHERE prog_name = $1',

  load_modules: 'SELECT mod_code, mod_name FROM Modules ORDER BY mod_code ASC',
  add_module: 'INSERT INTO Modules (mod_code, mod_name, a_username) VALUES ($1, $2, $3)',
  delete_module: 'DELETE FROM Modules WHERE mod_code = $1',
  get_filtered_modules: 'SELECT mod_code, mod_name FROM Modules WHERE mod_code < $1 ORDER BY mod_code',

  load_lectures: 'SELECT day, s_time_lect, e_time_lect, sem, quota, mod_code FROM LectureSlots ORDER BY (mod_code, sem) ASC',
  add_lecture: 'INSERT INTO LectureSlots (day, s_time_lect, e_time_lect, sem, quota, mod_code) VALUES ($1, $2, $3, $4, $5, $6)',
  delete_lecture: 'DELETE FROM LectureSlots WHERE mod_code = $1 AND sem = $2 AND day = $3 AND s_time_lect = $4 AND e_time_lect = $5',

  load_rounds: 'SELECT s_time_round, e_time_round FROM Rounds ORDER BY s_time_round, e_time_round ASC',
  add_round: 'INSERT INTO Rounds (s_time_round, e_time_round) VALUES ($1, $2)',

  load_prereqs: 'SELECT parent, child FROM Prereq ORDER BY (parent, child) ASC',
  add_prereq: 'INSERT INTO Prereq (parent, child) VALUES ($1, $2)',
  delete_prereq: 'DELETE FROM Prereq WHERE parent = $1 AND child = $2',

  add_require: 'INSERT INTO Require (prog_name, mod_code) VALUES ($1, $2)',
  delete_require: 'DELETE FROM Require WHERE mod_code = $1',

  load_appeal: 'SELECT A.status, A.mod_code, A.sem, A.day, A.s_time_lect, A.e_time_lect, A.s_username FROM' +
    ' Modules M, Appeal A WHERE M.mod_code = A.mod_code AND a_username = $1 ORDER BY A.mod_code, A.sem, A.day,' +
    ' A.s_time_lect, A.e_time_lect, A.s_username ASC',
  add_appeal: 'INSERT INTO Appeal (status, day, mod_code, s_time_lect, e_time_lect, sem, s_username) VALUES' +
    ' ($1, $2, $3, $4, $5, $6, $7)',
  delete_appeal: 'DELETE FROM Appeal WHERE mod_code = $1 AND sem = $2 AND day = $3 AND' +
    ' s_time_lect = $4 AND e_time_lect = $5 AND s_username = $6',
  update_appeal: 'UPDATE Appeal SET status = $1 WHERE (mod_code = $2 AND sem = $3 AND day = $4 AND' +
    ' s_time_lect = $5 AND e_time_lect = $6 AND s_username = $7)',

  load_register: 'SELECT R.mod_code, M.mod_name, R.sem, R.day, R.s_time_lect, R.e_time_lect, s_time_round,' +
    ' e_time_round , L.quota, status, priority_score, rank_pref, s_username FROM Register R, LectureSlots L,' +
    ' Modules M WHERE (L.mod_code = M.mod_code AND L.mod_code = R.mod_code AND M.mod_code = R.mod_code AND L.sem =' +
    ' R.sem AND L.day = R.day AND L.s_time_lect = R.s_time_lect AND L.e_time_lect = R.e_time_lect AND s_username = $1)',
  update_register: 'UPDATE Register SET status = $1 WHERE (mod_code = $2 AND sem = $3 AND day = $4 AND' +
    ' s_time_lect = $5 AND e_time_lect = $6 AND s_username = $7)',

  load_prev_takes: 'SELECT * FROM Takes WHERE grade <> "IP" AND s_username = $1 ORDER BY mod_code ASC',
  load_current_takes: 'SELECT * FROM Takes WHERE has_completed = FALSE AND s_username = $1 ORDER BY mod_code ASC',
  add_takes: 'INSERT INTO Takes (s_username, mod_code) VALUES ($1, $2)'
};

module.exports = sql;