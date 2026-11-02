require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./config/db");

const facultyData = [
  {
    name: "Shalini Singhal",
    email: "shalinisinghal506@gmail.com",
    department: "Information Technology",
    designation: "Assistant Professor",
    password: "password@123",
    subjectName: "MERN",
    subjectCode: "IT501",
    semester: 5,
  },
  {
    name: "Nikhar Bhatnagar",
    email: "nikharbhatnagar@gmail.com",
    department: "Information Technology",
    designation: "Assistant Professor",
    password: "password@123",
    subjectName: "DAA",
    subjectCode: "IT502",
    semester: 5,
  },
  {
    name: "Jagendra Chaudhary",
    email: "jagendrachaudhary@gmail.com",
    department: "Information Technology",
    designation: "Assistant Professor",
    password: "password@123",
    subjectName: "Cloud Computing",
    subjectCode: "IT503",
    semester: 5,
  },
  {
    name: "Praveen Kumar Yadav",
    email: "praveenkumaryadav@gmail.com",
    department: "Information Technology",
    designation: "Assistant Professor",
    password: "password@123",
    subjectName: "Compiler",
    subjectCode: "IT504",
    semester: 5,
  },
  {
    name: "Manju Chaudhary",
    email: "manjuchaudhary@gmail.com",
    department: "Information Technology",
    designation: "Assistant Professor",
    password: "password@123",
    subjectName: "Operating System",
    subjectCode: "IT505",
    semester: 5,
  },
];

function insertFaculty() {
  console.log("Inserting faculty and subjects...");

  // Update HOD department to Information Technology so it matches
  db.prepare("UPDATE users SET department = 'Information Technology' WHERE role = 'hod'").run();

  // Ensure active feedback period for semester 5 exists
  const existingPeriod = db.prepare("SELECT id FROM feedback_periods WHERE semester = 5 AND is_open = 1").get();
  if (!existingPeriod) {
    db.prepare("UPDATE feedback_periods SET semester = 5 WHERE is_open = 1").run();
  }

  for (const f of facultyData) {
    const email = f.email.toLowerCase().trim();
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);

    let userId;
    let facultyId;

    if (existing) {
      userId = existing.id;
      const fac = db.prepare("SELECT id FROM faculty WHERE user_id = ?").get(userId);
      facultyId = fac ? fac.id : null;
      console.log(`User ${f.name} (${email}) already exists.`);
    } else {
      const hash = bcrypt.hashSync(f.password, 10);
      const userRes = db
        .prepare("INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, 'faculty', ?)")
        .run(f.name, email, hash, f.department);
      userId = userRes.lastInsertRowid;

      const facRes = db
        .prepare("INSERT INTO faculty (user_id, department, designation) VALUES (?, ?, ?)")
        .run(userId, f.department, f.designation);
      facultyId = facRes.lastInsertRowid;
      console.log(`Added Faculty: ${f.name} (ID: ${facultyId})`);
    }

    if (facultyId && f.subjectName) {
      const existingSubject = db
        .prepare("SELECT id FROM subjects WHERE faculty_id = ? AND subject_name = ?")
        .get(facultyId, f.subjectName);

      if (!existingSubject) {
        db.prepare(
          "INSERT INTO subjects (subject_name, subject_code, faculty_id, department, semester) VALUES (?, ?, ?, ?, ?)"
        ).run(f.subjectName, f.subjectCode, facultyId, f.department, f.semester);
        console.log(`  Assigned Subject: ${f.subjectName} (${f.subjectCode})`);
      }
    }
  }

  console.log("\nAll 5 faculty members and subjects added successfully!");
}

insertFaculty();
