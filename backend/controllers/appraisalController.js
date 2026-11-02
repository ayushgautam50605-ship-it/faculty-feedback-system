const db = require("../config/db");
const { generateAppraisal, getConfig } = require("../utils/appraisal");

/** GET /api/appraisal/:facultyId?semester=&academicYear= */
exports.getAppraisal = (req, res) => {
  const facultyId = Number(req.params.facultyId);
  if (req.user.role === "faculty" && req.user.profileId !== facultyId) {
    return res.status(403).json({ success: false, message: "You can only view your own appraisal." });
  }
  const period = db.prepare("SELECT * FROM feedback_periods ORDER BY is_open DESC, id DESC LIMIT 1").get();
  const semester = Number(req.query.semester) || period?.semester;
  const academicYear = req.query.academicYear || period?.academic_year;

  const result = generateAppraisal(facultyId, semester, academicYear);
  res.json({ success: true, data: result });
};

/** POST /api/appraisal/generate  { facultyId?, semester, academicYear } — HOD/Admin only.
 *  If facultyId omitted, regenerates for ALL faculty. */
exports.generateForFacultyOrAll = (req, res) => {
  const { facultyId, semester, academicYear } = req.body;
  if (!semester || !academicYear) {
    return res.status(400).json({ success: false, message: "semester and academicYear are required." });
  }

  if (facultyId) {
    const result = generateAppraisal(facultyId, semester, academicYear);
    return res.json({ success: true, data: [result] });
  }

  const allFaculty = db.prepare("SELECT id FROM faculty").all();
  const results = allFaculty.map((f) => generateAppraisal(f.id, semester, academicYear));
  res.json({ success: true, message: `Appraisal generated for ${results.length} faculty member(s).`, data: results });
};

/** GET /api/appraisal-config — view current formula configuration */
exports.getAppraisalConfig = (req, res) => {
  res.json({ success: true, data: getConfig() });
};

/** PUT /api/appraisal-config — HOD/Admin updates the formula thresholds */
exports.updateAppraisalConfig = (req, res) => {
  const { scaleMax, passThreshold, excellentThreshold } = req.body;
  const current = getConfig();
  db.prepare(
    `UPDATE appraisal_config SET scale_max = ?, pass_threshold = ?, excellent_threshold = ? WHERE id = ?`
  ).run(
    scaleMax ?? current.scale_max,
    passThreshold ?? current.pass_threshold,
    excellentThreshold ?? current.excellent_threshold,
    current.id
  );
  res.json({ success: true, data: getConfig() });
};
