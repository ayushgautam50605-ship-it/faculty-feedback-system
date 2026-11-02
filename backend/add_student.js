require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./config/db");

const studentData = {
  name: "Ayush Gautam",
  email: "b240881@skit.ac.in".toLowerCase().trim(),
  password: "Password@123",
  department: "Information Technology",
  semester: 5,
  section: "A",
  rollNumber: "B240881",
};

function insertStudent() {
  console.log("Adding student...");

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(studentData.email);

  if (existing) {
    console.log(`Student with email ${studentData.email} already exists.`);
    return;
  }

  const tx = db.transaction(() => {
    const hash = bcrypt.hashSync(studentData.password, 10);
    const userRes = db
      .prepare("INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, 'student', ?)")
      .run(studentData.name, studentData.email, hash, studentData.department);

    const stuRes = db
      .prepare("INSERT INTO students (user_id, department, semester, section, roll_number) VALUES (?, ?, ?, ?, ?)")
      .run(userRes.lastInsertRowid, studentData.department, studentData.semester, studentData.section, studentData.rollNumber);

    return { userId: userRes.lastInsertRowid, studentId: stuRes.lastInsertRowid };
  });

  const ids = tx();
  console.log(`Student ${studentData.name} created successfully! (User ID: ${ids.userId}, Student ID: ${ids.studentId})`);
}

insertStudent();
