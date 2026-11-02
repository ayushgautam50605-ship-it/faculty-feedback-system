const db = require("../config/db");
const { generateAppraisal } = require("../utils/appraisal");

exports.listFaculty = (req, res) => {
  const { department, semester } = req.query;
  let sql = `
    SELECT f.id, u.name, u.email, f.department, f.designation
    FROM faculty f JOIN users u ON u.id = f.user_id WHERE 1=1`;
  const params = [];
  if (department) {
    sql += " AND f.department = ?";
    params.push(department);
  }
  sql += " ORDER BY u.name";
  const rows = db.prepare(sql).all(...params);
  res.json({ success: true, data: rows });
};

exports.getFacultyById = (req, res) => {
  const row = db
    .prepare(
      `SELECT f.id, u.name, u.email, f.department, f.designation
       FROM faculty f JOIN users u ON u.id = f.user_id WHERE f.id = ?`
    )
    .get(req.params.id);
  if (!row) return res.status(404).json({ success: false, message: "Faculty not found." });

  const subjects = db
    .prepare("SELECT id, subject_name, subject_code, semester FROM subjects WHERE faculty_id = ?")
    .all(req.params.id);

  res.json({ success: true, data: { ...row, subjects } });
};

/** GET /api/faculty/:id/performance?semester=&academicYear= */
exports.getPerformance = (req, res) => {
  const facultyId = Number(req.params.id);

  // Faculty may only view their own performance
  if (req.user.role === "faculty" && req.user.profileId !== facultyId) {
    return res.status(403).json({ success: false, message: "You can only view your own performance data." });
  }

  const facultyRow = db
    .prepare(`SELECT f.id, u.name, f.department, f.designation FROM faculty f JOIN users u ON u.id = f.user_id WHERE f.id = ?`)
    .get(facultyId);
  if (!facultyRow) return res.status(404).json({ success: false, message: "Faculty not found." });

  const latestPeriod = db.prepare("SELECT * FROM feedback_periods ORDER BY is_open DESC, id DESC LIMIT 1").get();
  const semester = Number(req.query.semester) || latestPeriod?.semester;
  const academicYear = req.query.academicYear || latestPeriod?.academic_year;

  const appraisal = semester && academicYear ? generateAppraisal(facultyId, semester, academicYear) : null;

  // Semester-wise trend (all historical appraisal rows for this faculty)
  const trend = db
    .prepare(
      `SELECT semester, academic_year, average_rating, appraisal_score, total_responses
       FROM appraisal WHERE faculty_id = ? ORDER BY academic_year, semester`
    )
    .all(facultyId);

  // Rating distribution (count of each 1-5 rating across all criteria, current period)
  const distribution = db
    .prepare(
      `SELECT fr.rating, COUNT(*) c
       FROM feedback_ratings fr JOIN feedback f ON f.id = fr.feedback_id
       WHERE f.faculty_id = ? AND f.semester = ? AND f.academic_year = ?
       GROUP BY fr.rating ORDER BY fr.rating`
    )
    .all(facultyId, semester, academicYear);

  // Aggregated (anonymous) comments — no student identity attached
  const comments = db
    .prepare(
      `SELECT comments FROM feedback
       WHERE faculty_id = ? AND semester = ? AND academic_year = ? AND comments IS NOT NULL AND TRIM(comments) != ''
       ORDER BY submitted_at DESC LIMIT 50`
    )
    .all(facultyId, semester, academicYear)
    .map((r) => r.comments);

  res.json({
    success: true,
    data: {
      faculty: facultyRow,
      semester,
      academicYear,
      appraisal,
      trend,
      ratingDistribution: distribution,
      comments,
    },
  });
};
