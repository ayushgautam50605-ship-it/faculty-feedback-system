/**
 * Appraisal Calculation Engine
 * ----------------------------
 * Transparent, configurable methodology:
 *
 * 1. For each criterion, compute the criterion average rating across all
 *    feedback submitted for a faculty member in a given semester/year:
 *
 *        criterionAvg = sum(ratings for criterion) / count(ratings for criterion)
 *
 * 2. Compute the WEIGHTED average rating across all criteria, using each
 *    criterion's configurable weight (defaults to 1.0 = equal weighting):
 *
 *        weightedAverage = sum(criterionAvg_i * weight_i) / sum(weight_i)
 *
 * 3. Normalize against the rating scale (default 1-5) into a 0-100 score:
 *
 *        appraisalScore = (weightedAverage / scaleMax) * 100
 *
 * 4. Assign a letter grade using configurable thresholds:
 *        >= excellentThreshold        -> "Excellent"
 *        >= passThreshold             -> "Satisfactory"
 *        <  passThreshold             -> "Needs Improvement"
 *
 * This whole method is intentionally simple linear math (no black box /
 * ML) so it can be explained in a viva and audited by the HOD.
 */
const db = require("../config/db");

function getConfig() {
  return db.prepare("SELECT * FROM appraisal_config ORDER BY id DESC LIMIT 1").get();
}

function computeCriterionAverages(facultyId, semester, academicYear) {
  // The feedback join carries the faculty/semester/year filter in its ON clause
  // (not WHERE), so every criterion row survives the LEFT JOIN even with zero
  // matches. We then use CASE WHEN f.id IS NOT NULL to only average/count the
  // ratings that actually matched — otherwise a LEFT JOIN silently counts every
  // rating for that criterion across ALL faculty and periods.
  const rows = db
    .prepare(
      `SELECT c.id AS criterion_id, c.name, c.weight,
              AVG(CASE WHEN f.id IS NOT NULL THEN fr.rating END) AS avg_rating,
              COUNT(CASE WHEN f.id IS NOT NULL THEN fr.rating END) AS rating_count
       FROM criteria c
       LEFT JOIN feedback_ratings fr ON fr.criterion_id = c.id
       LEFT JOIN feedback f ON f.id = fr.feedback_id
         AND f.faculty_id = ? AND f.semester = ? AND f.academic_year = ?
       WHERE c.is_active = 1
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.id ASC`
    )
    .all(facultyId, semester, academicYear);

  return rows.map((r) => ({
    criterionId: r.criterion_id,
    name: r.name,
    weight: r.weight,
    averageRating: r.avg_rating ? Number(r.avg_rating.toFixed(2)) : 0,
    ratingCount: r.rating_count || 0,
  }));
}

function gradeFor(weightedAverage, config) {
  if (weightedAverage >= config.excellent_threshold) return "Excellent";
  if (weightedAverage >= config.pass_threshold) return "Satisfactory";
  return "Needs Improvement";
}

/**
 * Computes and upserts the appraisal record for a faculty/semester/year.
 * Returns the full breakdown for transparency.
 */
function generateAppraisal(facultyId, semester, academicYear) {
  const config = getConfig();
  const criterionAverages = computeCriterionAverages(facultyId, semester, academicYear);

  const totalResponses = db
    .prepare(
      `SELECT COUNT(*) c FROM feedback WHERE faculty_id = ? AND semester = ? AND academic_year = ?`
    )
    .get(facultyId, semester, academicYear).c;

  const scored = criterionAverages.filter((c) => c.ratingCount > 0);
  const weightSum = scored.reduce((s, c) => s + c.weight, 0);
  const weightedAverage =
    weightSum > 0
      ? scored.reduce((s, c) => s + c.averageRating * c.weight, 0) / weightSum
      : 0;

  const appraisalScore = Number(((weightedAverage / config.scale_max) * 100).toFixed(2));
  const grade = gradeFor(weightedAverage, config);

  if (totalResponses > 0) {
    db.prepare(
      `INSERT INTO appraisal (faculty_id, semester, academic_year, total_responses, average_rating, appraisal_score, grade)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(faculty_id, semester, academic_year)
       DO UPDATE SET total_responses = excluded.total_responses,
                      average_rating = excluded.average_rating,
                      appraisal_score = excluded.appraisal_score,
                      grade = excluded.grade,
                      generated_at = datetime('now')`
    ).run(facultyId, semester, academicYear, totalResponses, Number(weightedAverage.toFixed(2)), appraisalScore, grade);
  }

  return {
    facultyId,
    semester,
    academicYear,
    totalResponses,
    criterionAverages,
    weightedAverageRating: Number(weightedAverage.toFixed(2)),
    scaleMax: config.scale_max,
    appraisalScore,
    grade,
    methodology: {
      step1: "criterionAvg = sum(ratings for criterion) / count(ratings for criterion)",
      step2: "weightedAverage = sum(criterionAvg_i * weight_i) / sum(weight_i)",
      step3: `appraisalScore = (weightedAverage / ${config.scale_max}) * 100`,
      thresholds: {
        excellent: config.excellent_threshold,
        satisfactory: config.pass_threshold,
      },
    },
  };
}

module.exports = { generateAppraisal, computeCriterionAverages, getConfig };
