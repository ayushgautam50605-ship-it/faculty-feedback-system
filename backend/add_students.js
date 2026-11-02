require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./config/db");

const students = [
  {
    name: "Ayush Gautam",
    email: "b240881@skit.ac.in",
    rollNumber: "24ESKIT038",
  },
  {
    name: "Devashish Sharma",
    email: "b240983@skit.ac.in",
    rollNumber: "24ESKIT051",
  },
  {
    name: "Abdud Daiyan",
    email: "b240720@skit.ac.in",
    rollNumber: "24ESKIT002",
  },
];

const DEFAULT_PASSWORD = "password@123";
const DEPARTMENT = "Information Technology";
const SEMESTER = 5;
const SECTION = "A";

function insertStudents() {
  console.log("Inserting students...");
  const hash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

  for (const s of students) {
    const cleanEmail = s.email.toLowerCase().trim();
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(cleanEmail);

    if (existing) {
      console.log(`Student with email ${cleanEmail} already exists, skipping.`);
      continue;
    }

    const tx = db.transaction(() => {
      const userRes = db
        .prepare("INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, 'student', ?)")
        .run(s.name, cleanEmail, hash, DEPARTMENT);

      const stuRes = db
        .prepare("INSERT INTO students (user_id, department, semester, section, roll_number) VALUES (?, ?, ?, ?, ?)")
        .run(userRes.lastInsertRowid, DEPARTMENT, SEMESTER, SECTION, s.rollNumber);

      return { userId: userRes.lastInsertRowid, studentId: stuRes.lastInsertRowid };
    });

    const res = tx();
    console.log(`Added student: ${s.name} (${cleanEmail}, Roll: ${s.rollNumber})`);
  }

  console.log("\nAll students inserted successfully!");
}

insertStudents();
