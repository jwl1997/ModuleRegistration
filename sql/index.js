const sql = {};

sql.query = {
  get_hash: 'SELECT password FROM Users WHERE username = $1',
  auth_user: 'SELECT EXISTS (SELECT * FROM Users WHERE username = $1)',
  auth_student: 'SELECT EXISTS (SELECT s_username FROM Students WHERE s_username = $1)',
  auth_admin: 'SELECT EXISTS (SELECT a_username FROM Admins WHERE a_username = $1)',
  add_user: 'INSERT INTO Users (username, password) VALUES ($1, $2)',
  add_student: 'INSERT INTO Students (s_username, seniority) VALUES ($1, $2)',
  add_admin: 'INSERT INTO Admins (a_username) VALUES ($1)',
  load_student_dashboard: 'SELECT * FROM DummyStudentDashboard',
  load_admin_dashboard: 'SELECT M.mod_code, M.mod_name, M.sem, S.day, S.s_time_lect, S.e_time_lect, S.quota FROM Modules M, LectureSlots S WHERE M.mod_code = S.mod_code AND M.a_username = $1',
  add_module: 'INSERT INTO Modules (mod_code, mod_name, sem, a_username) VALUES ($1, $2, $3, $4)',
  add_lecture: 'INSERT INTO LectureSlots (day, s_time_lect, e_time_lect, quota, mod_code) VALUES ($1, $2, $3, $4, $5)',
  add_round: 'INSERT INTO Rounds (s_time_round, e_time_round) VALUES ($1, $2)',
  load_modules_1: 'SELECT mod_code, mod_name FROM Modules ORDER BY mod_code ASC',
  load_modules_2: 'SELECT mod_code, mod_name, sem FROM Modules ORDER BY mod_code ASC',
  add_program: 'INSERT INTO Programs (prog_name) VALUES ($1)',
  add_required_modules_to_program: 'INSERT INTO Require (prog_name, mod_code) VALUES ($1, $2)',
  load_programs: 'SELECT prog_name FROM Programs',
  load_rounds: 'SELECT s_time_round, e_time_round FROM Rounds',
  load_lectures: 'SELECT * FROM LectureSlots',
  delete_program: 'DELETE FROM Programs WHERE prog_name = $1',
  delete_module: 'DELETE FROM Modules WHERE mod_code = $1',
  delete_require: 'DELETE FROM Require WHERE mod_code =$1'
};

module.exports = sql;