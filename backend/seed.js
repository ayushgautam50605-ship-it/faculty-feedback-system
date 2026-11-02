/**
 * Seed script — wipes and repopulates the database with realistic demo data:
 * an HOD, 6 faculty across 2 departments, 24 students, subjects, an open
 * feedback period, and randomized-but-plausible feedback so every chart
 * and the appraisal engine has real data to show on first run.
 *
 * Run with: npm run seed
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./config/db");

const DEFAULT_PASSWORD = "Password@123";

function wipe() {
  db.exec(`
    DELETE FROM feedback_ratings;
    DELETE FROM feedback;
    DELETE FROM appraisal;
    DELETE FROM feedback_periods;
    DELETE FROM subjects;
    DELETE FROM criteria;
    DELETE FROM faculty;
    DELETE FROM students;
    DELETE FROM users;
    DELETE FROM appraisal_config;
  `);
}

function seed() {
  wipe();
  const hash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

  db.prepare("INSERT INTO appraisal_config (scale_max, pass_threshold, excellent_threshold) VALUES (5, 3.0, 4.5)").run();

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
  const criteriaIds = CRITERIA.map((name, i) => insertCriterion.run(name, i).lastInsertRowid);

  // ---- HOD ----
  const hodUser = db
    .prepare("INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, 'hod', ?)")
    .run("Dr. Anjali Mehta", "hod@college.edu", hash, "Computer Science");

  // ---- Departments & Faculty ----
  const departments = ["Computer Science", "Electronics & Communication"];
  const facultyNames = {
    "Computer Science": [
      ["Dr. Ramesh Iyer", "Professor"],
      ["Prof. Sunita Rao", "Associate Professor"],
      ["Dr. Vikram Nair", "Assistant Professor"],
    ],
    "Electronics & Communication": [
      ["Dr. Kavita Sharma", "Professor"],
      ["Prof. Arjun Desai", "Associate Professor"],
      ["Dr. Neha Kulkarni", "Assistant Professor"],
    ],
  };

  const subjectPool = {
    "Computer Science": ["Data Structures", "Operating Systems", "Database Systems", "Computer Networks", "Software Engineering", "Artificial Intelligence"],
    "Electronics & Communication": ["Digital Electronics", "Signals & Systems", "Microprocessors", "Communication Systems", "VLSI Design", "Control Systems"],
  };

  const facultyIds = {}; // name -> id
  const subjectsByDept = {};

  let emailCounter = 1;
  for (const dept of departments) {
    subjectsByDept[dept] = [];
    facultyNames[dept].forEach(([name, designation], idx) => {
      const email = `faculty${emailCounter++}@college.edu`;
      const userInfo = db
        .prepare("INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, 'faculty', ?)")
        .run(name, email, hash, dept);
      const facInfo = db
        .prepare("INSERT INTO faculty (user_id, department, designation) VALUES (?, ?, ?)")
        .run(userInfo.lastInsertRowid, dept, designation);
      facultyIds[name] = { id: facInfo.lastInsertRowid, email };

      // assign 2 subjects per faculty, semester 3 for demo simplicity
      const subs = subjectPool[dept].slice(idx * 2, idx * 2 + 2);
      subs.forEach((subjectName) => {
        const subInfo = db
          .prepare("INSERT INTO subjects (subject_name, subject_code, faculty_id, department, semester) VALUES (?, ?, ?, ?, ?)")
          .run(subjectName, subjectName.slice(0, 3).toUpperCase() + "301", facInfo.lastInsertRowid, dept, 3);
        subjectsByDept[dept].push({ id: subInfo.lastInsertRowid, facultyId: facInfo.lastInsertRowid });
      });
    });
  }

  // ---- Feedback period (open) ----
  const periodInfo = db
    .prepare("INSERT INTO feedback_periods (academic_year, semester, is_open, allow_editing) VALUES ('2025-26', 3, 1, 0)")
    .run();
  const periodId = periodInfo.lastInsertRowid;

  // A closed prior-semester period, so the semester trend chart has 2 points
  const prevPeriodInfo = db
    .prepare("INSERT INTO feedback_periods (academic_year, semester, is_open, allow_editing, closed_at) VALUES ('2024-25', 2, 0, 0, datetime('now','-6 months'))")
    .run();

  // ---- Students ----
  const studentIdsByDept = {};
  let studentEmailCounter = 1;
  for (const dept of departments) {
    studentIdsByDept[dept] = [];
    for (let i = 1; i <= 12; i++) {
      const name = `Student ${dept === "Computer Science" ? "CS" : "EC"}-${i}`;
      const email = `student${studentEmailCounter++}@college.edu`;
      const userInfo = db
        .prepare("INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, 'student', ?)")
        .run(name, email, hash, dept);
      const stuInfo = db
        .prepare("INSERT INTO students (user_id, department, semester, section, roll_number) VALUES (?, ?, 3, 'A', ?)")
        .run(userInfo.lastInsertRowid, dept, `${dept === "Computer Science" ? "CS" : "EC"}25${String(i).padStart(3, "0")}`);
      studentIdsByDept[dept].push({ id: stuInfo.lastInsertRowid, email });
    }
  }

  // ---- Feedback + ratings (current period, with plausible spread) ----
  const sampleComments = [
    "Explains concepts very clearly with good examples.",
    "Classes are engaging and well-paced.",
    "Could use more real-world examples.",
    "Very approachable during office hours.",
    "Sometimes goes too fast through difficult topics.",
    "Great use of practical demonstrations.",
    "Encourages questions and discussion in class.",
    "Notes and slides are well organized.",
    "",
    "",
  ];

  const insertFeedback = db.prepare(
    `INSERT INTO feedback (student_id, faculty_id, subject_id, period_id, semester, academic_year, comments) VALUES (?, ?, ?, ?, 3, '2025-26', ?)`
  );
  const insertRating = db.prepare("INSERT INTO feedback_ratings (feedback_id, criterion_id, rating) VALUES (?, ?, ?)");

  function randomRatingAround(base) {
    // base ~3.5-4.7, add noise, clamp 1-5
    const r = Math.round(base + (Math.random() - 0.5) * 2);
    return Math.max(1, Math.min(5, r));
  }

  for (const dept of departments) {
    const subs = subjectsByDept[dept];
    const students = studentIdsByDept[dept];
    subs.forEach((sub, subIdx) => {
      // Give each faculty a slightly different "quality baseline" so charts look realistic
      const baseline = 3.4 + ((sub.facultyId * 7) % 10) / 10 + subIdx * 0.05;
      students.forEach((student, sIdx) => {
        // ~85% response rate
        if (Math.random() > 0.85) return;
        const comment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        const fbInfo = insertFeedback.run(student.id, sub.facultyId, sub.id, periodId, comment || null);
        const feedbackId = fbInfo.lastInsertRowid;
        criteriaIds.forEach((critId) => {
          insertRating.run(feedbackId, critId, randomRatingAround(baseline));
        });
      });
    });
  }

  // ---- Also seed a small set of PRIOR semester appraisal rows directly (for trend chart) ----
  const insertAppraisal = db.prepare(
    `INSERT INTO appraisal (faculty_id, semester, academic_year, total_responses, average_rating, appraisal_score, grade) VALUES (?, 2, '2024-25', ?, ?, ?, ?)`
  );
  Object.values(facultyIds).forEach((f) => {
    const avg = Number((3.5 + Math.random() * 1.2).toFixed(2));
    const score = Number(((avg / 5) * 100).toFixed(2));
    const grade = avg >= 4.5 ? "Excellent" : avg >= 3.0 ? "Satisfactory" : "Needs Improvement";
    insertAppraisal.run(f.id, 20 + Math.floor(Math.random() * 10), avg, score, grade);
  });

  // ---- Generate current-period appraisal for every faculty ----
  const { generateAppraisal } = require("./utils/appraisal");
  Object.values(facultyIds).forEach((f) => generateAppraisal(f.id, 3, "2025-26"));

  console.log("\n✅ Database seeded successfully!\n");
  console.log("Demo login credentials (password for ALL accounts): " + DEFAULT_PASSWORD);
  console.log("----------------------------------------------------");
  console.log("HOD / Admin : hod@college.edu");
  console.log("Faculty     :", Object.values(facultyIds).map((f) => f.email).join(", "));
  console.log("Students    :", studentIdsByDept["Computer Science"].slice(0, 2).map((s) => s.email).join(", "), "... (24 total)");
  console.log("----------------------------------------------------\n");
}

seed();
