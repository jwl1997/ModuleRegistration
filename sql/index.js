const sql = {};

sql.query = {
  login: 'SELECT EXISTS (SELECT * FROM Users WHERE username = $1 AND password = $2)',
  add_user: 'INSERT INTO Users (username, password) VALUES ($1, $2)',
  add_student: 'INSERT INTO Students (s_username, seniority) VALUES ($1, $2)',
  add_admin: 'INSERT INTO Admins (a_username) VALUES ($1)',
  load_student_dashboard: 'SELECT * FROM DummyStudentDashboard',
  load_admin_dashboard: 'SELECT * FROM DummyAdminDashboard',
  add_module: 'INSERT INTO Modules (mod_code, mod_name, sem, a_username) VALUES ($1, $2, $3, $4)',
  add_lecture: 'INSERT INTO LectureSlots (day, s_time_lect, e_time_lect, quota, mod_code) VALUES ($1, $2, $3, $4, $5)',
  load_modules: 'SELECT mod_code, mod_name FROM Modules ORDER BY mod_code ASC',
  add_program: 'INSERT INTO Programs (prog_name) VALUES ($1)',
  add_required_modules_to_program: 'INSERT INTO Require (prog_name, mod_code) VALUES ($1, $2)',
  load_programs: 'SELECT * FROM Programs'
};

module.exports = sql;