const db = require("../config/db");

/** GET /api/feedback/targets — faculty/subjects this student can review, with status */
exports.getTargets = (req, res) => {
  const studentId = req.user.profileId;
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(studentId);
  if (!student) return res.status(404).json({ success: false, message: "Student profile not found." });

  const period = db
    .prepare("SELECT * FROM feedback_periods WHERE is_open = 1 ORDER BY id DESC LIMIT 1")
    .get();

  const subjects = db
    .prepare(
      `SELECT s.id AS subject_id, s.subject_name, s.subject_code,
              f.id AS faculty_id, u.name AS faculty_name, f.designation
       FROM subjects s
       JOIN faculty f ON f.id = s.faculty_id
       JOIN users u ON u.id = f.user_id
       WHERE s.department = ? AND s.semester = ?
       ORDER BY s.subject_name`
    )
    .all(student.department, student.semester);

  const submitted = period
    ? new Set(
        db
          .prepare(
            `SELECT faculty_id || '-' || subject_id AS k FROM feedback
             WHERE student_id = ? AND period_id = ?`
          )
          .all(studentId, period.id)
          .map((r) => r.k)
      )
    : new Set();

  const targets = subjects.map((s) => ({
    ...s,
    submitted: submitted.has(`${s.faculty_id}-${s.subject_id}`),
  }));

  res.json({
    success: true,
    data: {
      periodOpen: !!period,
      period,
      allowEditing: period ? !!period.allow_editing : false,
      targets,
    },
  });
};

/** GET /api/criteria — active evaluation criteria for the feedback form */
exports.getCriteria = (req, res) => {
  const criteria = db
    .prepare("SELECT id, name, weight FROM criteria WHERE is_active = 1 ORDER BY sort_order ASC, id ASC")
    .all();
  res.json({ success: true, data: criteria });
};

/** POST /api/feedback — submit feedback for one faculty/subject */
exports.submitFeedback = (req, res) => {
  const studentId = req.user.profileId;
  const { facultyId, subjectId, ratings, comments } = req.body;

  if (!facultyId || !subjectId || !Array.isArray(ratings) || ratings.length === 0) {
    return res.status(400).json({ success: false, message: "facultyId, subjectId and ratings are required." });
  }
  for (const r of ratings) {
    if (!r.criterionId || !Number.isInteger(r.rating) || r.rating < 1 || r.rating > 5) {
      return res.status(400).json({ success: false, message: "Each rating must include criterionId and an integer rating from 1 to 5." });
    }
  }

  const period = db.prepare("SELECT * FROM feedback_periods WHERE is_open = 1 ORDER BY id DESC LIMIT 1").get();
  if (!period) {
    return res.status(400).json({ success: false, message: "Feedback collection is currently closed." });
  }

  const subject = db.prepare("SELECT * FROM subjects WHERE id = ?").get(subjectId);
  if (!subject || subject.faculty_id !== facultyId) {
    return res.status(400).json({ success: false, message: "Invalid faculty/subject combination." });
  }

  const existing = db
    .prepare(
      `SELECT id FROM feedback WHERE student_id = ? AND faculty_id = ? AND subject_id = ? AND period_id = ?`
    )
    .get(studentId, facultyId, subjectId, period.id);

  if (existing && !period.allow_editing) {
    return res.status(409).json({ success: false, message: "You have already submitted feedback for this faculty member." });
  }

  const tx = db.transaction(() => {
    let feedbackId;
    if (existing) {
      db.prepare("UPDATE feedback SET comments = ?, submitted_at = datetime('now') WHERE id = ?").run(
        comments || null,
        existing.id
      );
      feedbackId = existing.id;
      db.prepare("DELETE FROM feedback_ratings WHERE feedback_id = ?").run(feedbackId);
    } else {
      const info = db
        .prepare(
          `INSERT INTO feedback (student_id, faculty_id, subject_id, period_id, semester, academic_year, comments)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(studentId, facultyId, subjectId, period.id, period.semester, period.academic_year, comments || null);
      feedbackId = info.lastInsertRowid;
    }

    const insertRating = db.prepare(
      "INSERT INTO feedback_ratings (feedback_id, criterion_id, rating) VALUES (?, ?, ?)"
    );
    for (const r of ratings) insertRating.run(feedbackId, r.criterionId, r.rating);

    return feedbackId;
  });

  try {
    const feedbackId = tx();
    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully. Thank you for contributing to academic improvement.",
      data: { feedbackId },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not save feedback due to a server error." });
  }
};

/** GET /api/feedback/status — overall completion status for the logged-in student */
exports.getStatus = (req, res) => {
  const studentId = req.user.profileId;
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(studentId);
  const totalSubjects = db
    .prepare("SELECT COUNT(*) c FROM subjects WHERE department = ? AND semester = ?")
    .get(student.department, student.semester).c;

  const period = db.prepare("SELECT * FROM feedback_periods WHERE is_open = 1 ORDER BY id DESC LIMIT 1").get();
  const completed = period
    ? db.prepare("SELECT COUNT(*) c FROM feedback WHERE student_id = ? AND period_id = ?").get(studentId, period.id).c
    : 0;

  res.json({
    success: true,
    data: {
      totalSubjects,
      completed,
      percentage: totalSubjects ? Math.round((completed / totalSubjects) * 100) : 0,
      periodOpen: !!period,
    },
  });
};
