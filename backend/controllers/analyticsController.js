const db = require("../config/db");

function currentPeriod() {
  return db.prepare("SELECT * FROM feedback_periods WHERE is_open = 1 ORDER BY id DESC LIMIT 1").get()
    || db.prepare("SELECT * FROM feedback_periods ORDER BY is_open DESC, id DESC LIMIT 1").get();
}

/** GET /api/analytics/dashboard — HOD overview KPIs */
exports.getDashboard = (req, res) => {
  const { department, semester, academicYear } = req.query;
  const period = currentPeriod();
  const sem = semester || period?.semester;
  const year = academicYear || period?.academic_year;

  const deptFilter = department ? "AND u.department = ?" : "";
  const deptParam = department ? [department] : [];

  const totalStudents = db
    .prepare(`SELECT COUNT(*) c FROM students s JOIN users u ON u.id = s.user_id WHERE 1=1 ${deptFilter}`)
    .get(...deptParam).c;

  const totalFaculty = db
    .prepare(`SELECT COUNT(*) c FROM faculty f JOIN users u ON u.id = f.user_id WHERE 1=1 ${deptFilter}`)
    .get(...deptParam).c;

  const fbDeptFilter = department ? "AND f.department = ?" : "";
  const totalFeedback = db
    .prepare(
      `SELECT COUNT(*) c FROM feedback fb JOIN faculty f ON f.id = fb.faculty_id
       WHERE fb.semester = ? AND fb.academic_year = ? ${fbDeptFilter}`
    )
    .get(sem, year, ...deptParam).c;

  const expectedResponses = db
    .prepare(
      `SELECT COUNT(*) c FROM students s JOIN users u ON u.id = s.user_id
       JOIN subjects sub ON sub.department = s.department AND sub.semester = s.semester
       WHERE s.semester = ? ${deptFilter}`
    )
    .get(sem, ...deptParam).c;

  const avgRatingRow = db
    .prepare(
      `SELECT AVG(fr.rating) a FROM feedback_ratings fr
       JOIN feedback fb ON fb.id = fr.feedback_id
       JOIN faculty f ON f.id = fb.faculty_id
       WHERE fb.semester = ? AND fb.academic_year = ? ${fbDeptFilter}`
    )
    .get(sem, year, ...deptParam);

  res.json({
    success: true,
    data: {
      semester: sem,
      academicYear: year,
      totalStudents,
      totalFaculty,
      totalFeedback,
      completionPercentage: expectedResponses ? Math.round((totalFeedback / expectedResponses) * 100) : 0,
      departmentAverageRating: avgRatingRow.a ? Number(avgRatingRow.a.toFixed(2)) : 0,
    },
  });
};

/** GET /api/analytics/faculty — faculty-wise average rating (for bar chart / comparison) */
exports.getFacultyComparison = (req, res) => {
  const { department, semester, academicYear } = req.query;
  const period = currentPeriod();
  const sem = semester || period?.semester;
  const year = academicYear || period?.academic_year;
  const deptFilter = department ? "AND f.department = ?" : "";
  const deptParam = department ? [department] : [];

  const rows = db
    .prepare(
      `SELECT f.id AS faculty_id, u.name, f.department,
              AVG(fr.rating) AS avg_rating, COUNT(DISTINCT fb.id) AS responses
       FROM faculty f
       JOIN users u ON u.id = f.user_id
       LEFT JOIN feedback fb ON fb.faculty_id = f.id AND fb.semester = ? AND fb.academic_year = ?
       LEFT JOIN feedback_ratings fr ON fr.feedback_id = fb.id
       WHERE 1=1 ${deptFilter}
       GROUP BY f.id
       ORDER BY avg_rating DESC`
    )
    .all(sem, year, ...deptParam)
    .map((r) => ({
      facultyId: r.faculty_id,
      name: r.name,
      department: r.department,
      averageRating: r.avg_rating ? Number(r.avg_rating.toFixed(2)) : 0,
      responses: r.responses,
    }));

  res.json({ success: true, data: rows });
};

/** GET /api/analytics/criteria — criterion-wise average across department (radar chart) */
exports.getCriteriaBreakdown = (req, res) => {
  const { department, semester, academicYear, facultyId } = req.query;
  const period = currentPeriod();
  const sem = semester || period?.semester;
  const year = academicYear || period?.academic_year;

  let fbFilter = "fb.semester = ? AND fb.academic_year = ?";
  const params = [sem, year];
  let facultyFilter = "1=1";
  if (department) {
    facultyFilter += " AND f.department = ?";
    params.push(department);
  }
  if (facultyId) {
    facultyFilter += " AND f.id = ?";
    params.push(facultyId);
  }

  // Filters are applied inside the LEFT JOIN conditions (not WHERE) so that
  // criteria with zero matching ratings still appear in the result with avg_rating = 0,
  // instead of being dropped from the radar chart entirely.
  const rows = db
    .prepare(
      `SELECT c.name,
              AVG(CASE WHEN f.id IS NOT NULL THEN fr.rating END) avg_rating
       FROM criteria c
       LEFT JOIN feedback_ratings fr ON fr.criterion_id = c.id
       LEFT JOIN feedback fb ON fb.id = fr.feedback_id AND ${fbFilter}
       LEFT JOIN faculty f ON f.id = fb.faculty_id AND ${facultyFilter}
       WHERE c.is_active = 1
       GROUP BY c.id ORDER BY c.sort_order`
    )
    .all(sem, year, ...(department ? [department] : []), ...(facultyId ? [facultyId] : []));

  res.json({
    success: true,
    data: rows.map((r) => ({ criterion: r.name, averageRating: r.avg_rating ? Number(r.avg_rating.toFixed(2)) : 0 })),
  });
};

/** GET /api/analytics/trend — semester-wise trend of department average rating */
exports.getSemesterTrend = (req, res) => {
  const { department } = req.query;
  const deptFilter = department ? "WHERE f.department = ?" : "";
  const deptParam = department ? [department] : [];

  const rows = db
    .prepare(
      `SELECT a.academic_year, a.semester, AVG(a.average_rating) avg_rating, SUM(a.total_responses) responses
       FROM appraisal a JOIN faculty f ON f.id = a.faculty_id
       ${deptFilter}
       GROUP BY a.academic_year, a.semester
       ORDER BY a.academic_year, a.semester`
    )
    .all(...deptParam);

  res.json({
    success: true,
    data: rows.map((r) => ({
      label: `${r.academic_year} · Sem ${r.semester}`,
      averageRating: r.avg_rating ? Number(r.avg_rating.toFixed(2)) : 0,
      responses: r.responses,
    })),
  });
};

/** GET /api/analytics/recent-activity */
exports.getRecentActivity = (req, res) => {
  const rows = db
    .prepare(
      `SELECT fb.submitted_at, u.name AS faculty_name, s.subject_name
       FROM feedback fb
       JOIN faculty f ON f.id = fb.faculty_id
       JOIN users u ON u.id = f.user_id
       JOIN subjects s ON s.id = fb.subject_id
       ORDER BY fb.submitted_at DESC LIMIT 15`
    )
    .all();
  res.json({ success: true, data: rows });
};

/** GET /api/analytics/filters — distinct departments/semesters/faculty/subjects for filter dropdowns */
exports.getFilterOptions = (req, res) => {
  const departments = db.prepare("SELECT DISTINCT department FROM users ORDER BY department").all().map((r) => r.department);
  const semesters = db.prepare("SELECT DISTINCT semester FROM students ORDER BY semester").all().map((r) => r.semester);
  const academicYears = db.prepare("SELECT DISTINCT academic_year FROM feedback_periods ORDER BY academic_year").all().map((r) => r.academic_year);
  const faculty = db
    .prepare("SELECT f.id, u.name FROM faculty f JOIN users u ON u.id = f.user_id ORDER BY u.name")
    .all();
  const criteria = db.prepare("SELECT id, name FROM criteria WHERE is_active = 1 ORDER BY sort_order").all();
  res.json({ success: true, data: { departments, semesters, academicYears, faculty, criteria } });
};
