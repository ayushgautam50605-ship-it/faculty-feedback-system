const bcrypt = require("bcryptjs");
const db = require("../config/db");

/* ---------- Faculty management ---------- */
exports.createFaculty = (req, res) => {
  const { name, email, password, department, designation } = req.body;
  if (!name || !email || !password || !department) {
    return res.status(400).json({ success: false, message: "name, email, password and department are required." });
  }
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (exists) return res.status(409).json({ success: false, message: "A user with this email already exists." });

  const tx = db.transaction(() => {
    const hash = bcrypt.hashSync(password, 10);
    const userInfo = db
      .prepare("INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, 'faculty', ?)")
      .run(name, email.toLowerCase(), hash, department);
    const facInfo = db
      .prepare("INSERT INTO faculty (user_id, department, designation) VALUES (?, ?, ?)")
      .run(userInfo.lastInsertRowid, department, designation || "Assistant Professor");
    return facInfo.lastInsertRowid;
  });

  const facultyId = tx();
  res.status(201).json({ success: true, message: "Faculty member added.", data: { facultyId } });
};

exports.deleteFaculty = (req, res) => {
  const faculty = db.prepare("SELECT * FROM faculty WHERE id = ?").get(req.params.id);
  if (!faculty) return res.status(404).json({ success: false, message: "Faculty not found." });
  db.prepare("DELETE FROM users WHERE id = ?").run(faculty.user_id); // cascades
  res.json({ success: true, message: "Faculty member removed." });
};

/* ---------- Student management ---------- */
exports.createStudent = (req, res) => {
  const { name, email, password, department, semester, section, rollNumber } = req.body;
  if (!name || !email || !password || !department || !semester) {
    return res.status(400).json({ success: false, message: "name, email, password, department and semester are required." });
  }
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (exists) return res.status(409).json({ success: false, message: "A user with this email already exists." });

  const tx = db.transaction(() => {
    const hash = bcrypt.hashSync(password, 10);
    const userInfo = db
      .prepare("INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, 'student', ?)")
      .run(name, email.toLowerCase(), hash, department);
    const stuInfo = db
      .prepare("INSERT INTO students (user_id, department, semester, section, roll_number) VALUES (?, ?, ?, ?, ?)")
      .run(userInfo.lastInsertRowid, department, semester, section || "A", rollNumber || null);
    return stuInfo.lastInsertRowid;
  });

  const studentId = tx();
  res.status(201).json({ success: true, message: "Student added.", data: { studentId } });
};

exports.deleteStudent = (req, res) => {
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: "Student not found." });
  db.prepare("DELETE FROM users WHERE id = ?").run(student.user_id);
  res.json({ success: true, message: "Student removed." });
};

exports.listStudents = (req, res) => {
  const rows = db
    .prepare(
      `SELECT s.id, u.name, u.email, s.department, s.semester, s.section, s.roll_number
       FROM students s JOIN users u ON u.id = s.user_id ORDER BY u.name`
    )
    .all();
  res.json({ success: true, data: rows });
};

/* ---------- Subject management (assign faculty to subjects) ---------- */
exports.createSubject = (req, res) => {
  const { subjectName, subjectCode, facultyId, department, semester } = req.body;
  if (!subjectName || !facultyId || !department || !semester) {
    return res.status(400).json({ success: false, message: "subjectName, facultyId, department and semester are required." });
  }
  const info = db
    .prepare("INSERT INTO subjects (subject_name, subject_code, faculty_id, department, semester) VALUES (?, ?, ?, ?, ?)")
    .run(subjectName, subjectCode || null, facultyId, department, semester);
  res.status(201).json({ success: true, message: "Subject created and assigned.", data: { subjectId: info.lastInsertRowid } });
};

exports.listSubjects = (req, res) => {
  const rows = db
    .prepare(
      `SELECT s.id, s.subject_name, s.subject_code, s.department, s.semester, f.id AS faculty_id, u.name AS faculty_name
       FROM subjects s JOIN faculty f ON f.id = s.faculty_id JOIN users u ON u.id = f.user_id
       ORDER BY s.department, s.semester, s.subject_name`
    )
    .all();
  res.json({ success: true, data: rows });
};

exports.deleteSubject = (req, res) => {
  db.prepare("DELETE FROM subjects WHERE id = ?").run(req.params.id);
  res.json({ success: true, message: "Subject removed." });
};

/* ---------- Evaluation criteria configuration ---------- */
exports.listCriteria = (req, res) => {
  res.json({ success: true, data: db.prepare("SELECT * FROM criteria ORDER BY sort_order").all() });
};

exports.createCriterion = (req, res) => {
  const { name, weight, sortOrder } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "name is required." });
  const info = db
    .prepare("INSERT INTO criteria (name, weight, sort_order) VALUES (?, ?, ?)")
    .run(name, weight ?? 1.0, sortOrder ?? 0);
  res.status(201).json({ success: true, data: { id: info.lastInsertRowid } });
};

exports.updateCriterion = (req, res) => {
  const { name, weight, isActive, sortOrder } = req.body;
  const current = db.prepare("SELECT * FROM criteria WHERE id = ?").get(req.params.id);
  if (!current) return res.status(404).json({ success: false, message: "Criterion not found." });
  db.prepare("UPDATE criteria SET name=?, weight=?, is_active=?, sort_order=? WHERE id=?").run(
    name ?? current.name,
    weight ?? current.weight,
    isActive === undefined ? current.is_active : (isActive ? 1 : 0),
    sortOrder ?? current.sort_order,
    req.params.id
  );
  res.json({ success: true, message: "Criterion updated." });
};

/* ---------- Feedback period control (start/stop collection) ---------- */
exports.listPeriods = (req, res) => {
  res.json({ success: true, data: db.prepare("SELECT * FROM feedback_periods ORDER BY id DESC").all() });
};

exports.openPeriod = (req, res) => {
  const { academicYear, semester, allowEditing } = req.body;
  if (!academicYear || !semester) {
    return res.status(400).json({ success: false, message: "academicYear and semester are required." });
  }
  db.prepare("UPDATE feedback_periods SET is_open = 0, closed_at = datetime('now') WHERE is_open = 1").run();
  const info = db
    .prepare("INSERT INTO feedback_periods (academic_year, semester, is_open, allow_editing) VALUES (?, ?, 1, ?)")
    .run(academicYear, semester, allowEditing ? 1 : 0);
  res.status(201).json({ success: true, message: "Feedback collection period opened.", data: { periodId: info.lastInsertRowid } });
};

exports.closePeriod = (req, res) => {
  db.prepare("UPDATE feedback_periods SET is_open = 0, closed_at = datetime('now') WHERE is_open = 1").run();
  res.json({ success: true, message: "Feedback collection closed." });
};

/* ---------- Report export (CSV) ---------- */
exports.exportAppraisalCsv = (req, res) => {
  const { semester, academicYear } = req.query;
  const period = db.prepare("SELECT * FROM feedback_periods ORDER BY is_open DESC, id DESC LIMIT 1").get();
  const sem = semester || period?.semester;
  const year = academicYear || period?.academic_year;

  const rows = db
    .prepare(
      `SELECT u.name AS faculty_name, f.department, f.designation,
              a.semester, a.academic_year, a.total_responses, a.average_rating, a.appraisal_score, a.grade
       FROM appraisal a
       JOIN faculty f ON f.id = a.faculty_id
       JOIN users u ON u.id = f.user_id
       WHERE a.semester = ? AND a.academic_year = ?
       ORDER BY a.appraisal_score DESC`
    )
    .all(sem, year);

  const header = "Faculty Name,Department,Designation,Semester,Academic Year,Total Responses,Average Rating,Appraisal Score,Grade";
  const csvRows = rows.map((r) =>
    [r.faculty_name, r.department, r.designation, r.semester, r.academic_year, r.total_responses, r.average_rating, r.appraisal_score, r.grade]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [header, ...csvRows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="appraisal_report_${year}_sem${sem}.csv"`);
  res.send(csv);
};
