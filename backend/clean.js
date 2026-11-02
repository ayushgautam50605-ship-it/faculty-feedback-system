require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./config/db");

const DEFAULT_PASSWORD = "Password@123";

function clean() {
  console.log("Cleaning database: removing all demo records...");

  // Wipe all operational and demo data
  db.exec(`
    DELETE FROM feedback_ratings;
    DELETE FROM feedback;
    DELETE FROM appraisal;
    DELETE FROM subjects;
    DELETE FROM faculty;
    DELETE FROM students;
    DELETE FROM users;
    DELETE FROM feedback_periods;
    DELETE FROM criteria;
    DELETE FROM appraisal_config;
  `);

  // Reinitialize default appraisal config
  db.prepare("INSERT INTO appraisal_config (scale_max, pass_threshold, excellent_threshold) VALUES (5, 3.0, 4.5)").run();

  // Reinitialize standard feedback criteria
  const CRITERIA = [
    "Subject Knowledge",
    "Teaching Effectiveness",
    "Communication Skills",
    "Clarity of Explanation",
    "Classroom Management",
    "Punctuality",
    "Use of Teaching Methods",
    "Interaction with Students",
    "Availability and Support",
    "Overall Teaching Performance",
  ];
  const insertCriterion = db.prepare("INSERT INTO criteria (name, weight, sort_order) VALUES (?, 1.0, ?)");
  CRITERIA.forEach((name, i) => insertCriterion.run(name, i));

  // Create clean master HOD account so user can log in and enter everything
  const hash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);
  db.prepare("INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, 'hod', ?)")
    .run("Department HOD", "hod@college.edu", hash, "Computer Science");

  // Create an initial open feedback period
  db.prepare("INSERT INTO feedback_periods (academic_year, semester, is_open, allow_editing) VALUES ('2025-26', 1, 1, 0)").run();

  console.log("Clean complete! All dummy students, faculty, subjects, and feedbacks removed.");
}

clean();
