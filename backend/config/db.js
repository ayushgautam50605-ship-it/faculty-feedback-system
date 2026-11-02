/**
 * Database configuration.
 *
 * Uses better-sqlite3 for a zero-config, file-based relational database.
 * This keeps the project trivially runnable for a college demo / viva
 * (no external DB server needed) while still using real SQL, foreign keys,
 * transactions and normalized tables — the same schema maps 1:1 onto
 * MySQL/Postgres if you want to swap engines later.
 */
const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data", "app.db");

const fs = require("fs");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL CHECK (role IN ('student','faculty','hod')),
      department    TEXT NOT NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS students (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      department   TEXT NOT NULL,
      semester     INTEGER NOT NULL,
      section      TEXT NOT NULL DEFAULT 'A',
      roll_number  TEXT
    );

    CREATE TABLE IF NOT EXISTS faculty (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      department   TEXT NOT NULL,
      designation  TEXT NOT NULL DEFAULT 'Assistant Professor'
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_name  TEXT NOT NULL,
      subject_code  TEXT,
      faculty_id    INTEGER NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
      department    TEXT NOT NULL,
      semester      INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS criteria (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL UNIQUE,
      weight      REAL NOT NULL DEFAULT 1.0,   -- relative weight used in appraisal formula
      is_active   INTEGER NOT NULL DEFAULT 1,
      sort_order  INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS feedback_periods (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      academic_year  TEXT NOT NULL,
      semester       INTEGER NOT NULL,
      is_open        INTEGER NOT NULL DEFAULT 1,
      allow_editing  INTEGER NOT NULL DEFAULT 0,
      opened_at      TEXT NOT NULL DEFAULT (datetime('now')),
      closed_at      TEXT
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id     INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      faculty_id     INTEGER NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
      subject_id     INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      period_id      INTEGER NOT NULL REFERENCES feedback_periods(id) ON DELETE CASCADE,
      semester       INTEGER NOT NULL,
      academic_year  TEXT NOT NULL,
      comments       TEXT,
      submitted_at   TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(student_id, faculty_id, subject_id, period_id)
    );

    CREATE TABLE IF NOT EXISTS feedback_ratings (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      feedback_id  INTEGER NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
      criterion_id INTEGER NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
      rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      UNIQUE(feedback_id, criterion_id)
    );

    CREATE TABLE IF NOT EXISTS appraisal_config (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      scale_max          REAL NOT NULL DEFAULT 5,
      pass_threshold      REAL NOT NULL DEFAULT 3.0,   -- min avg rating considered "satisfactory"
      excellent_threshold REAL NOT NULL DEFAULT 4.5,
      formula_notes       TEXT NOT NULL DEFAULT 'appraisal_percent = (weighted_average_rating / scale_max) * 100'
    );

    CREATE TABLE IF NOT EXISTS appraisal (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      faculty_id       INTEGER NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
      semester         INTEGER NOT NULL,
      academic_year    TEXT NOT NULL,
      total_responses  INTEGER NOT NULL,
      average_rating   REAL NOT NULL,
      appraisal_score  REAL NOT NULL,
      grade            TEXT NOT NULL,
      generated_at     TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(faculty_id, semester, academic_year)
    );

    CREATE INDEX IF NOT EXISTS idx_feedback_faculty ON feedback(faculty_id);
    CREATE INDEX IF NOT EXISTS idx_feedback_student ON feedback(student_id);
    CREATE INDEX IF NOT EXISTS idx_subjects_faculty ON subjects(faculty_id);
  `);

  const cfgCount = db.prepare("SELECT COUNT(*) c FROM appraisal_config").get().c;
  if (cfgCount === 0) {
    db.prepare("INSERT INTO appraisal_config DEFAULT VALUES").run();
  }
}

initSchema();

module.exports = db;
