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

  load_modules: 'SELECT mod_code FROM Modules ORDER BY mod_code ASC',
  add_module: 'INSERT INTO Modules (mod_code, mod_name, a_username) VALUES ($1, $2, $3)',
  delete_module: 'DELETE FROM Modules WHERE mod_code = $1',
  get_filtered_modules: 'SELECT mod_code, mod_name FROM Modules WHERE mod_code < $1 ORDER BY mod_code',

  load_lectures: 'SELECT day, s_time_lect, e_time_lect, sem, quota, mod_code FROM LectureSlots ORDER BY (mod_code, sem) ASC',
  add_lecture: 'INSERT INTO LectureSlots (day, s_time_lect, e_time_lect, sem, quota, mod_code) VALUES ($1, $2, $3, $4, $5, $6)',
  delete_lecture: 'DELETE FROM LectureSlots WHERE mod_code = $1 AND sem = $2 AND day = $3 AND s_time_lect = $4 AND e_time_lect = $5',

  load_rounds: 'SELECT s_time_round, e_time_round FROM Rounds ORDER BY (s_time_round, e_time_round) ASC',
  add_round: 'INSERT INTO Rounds (s_time_round, e_time_round) VALUES ($1, $2)',

  load_prereqs: 'SELECT parent, child FROM Prereq ORDER BY (parent, child) ASC',
  add_prereq: 'INSERT INTO Prereq (parent, child) VALUES ($1, $2)',
  delete_prereq: 'DELETE FROM Prereq WHERE parent = $1 AND child = $2',

  add_require: 'INSERT INTO Require (prog_name, mod_code) VALUES ($1, $2)',
  delete_require: 'DELETE FROM Require WHERE mod_code = $1'
};

module.exports = sql;