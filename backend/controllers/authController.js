const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { JWT_SECRET } = require("../middleware/auth");

function signToken(user, profileId) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      profileId, // students.id or faculty.id, null for HOD
    },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
}

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }

  let profileId = null;
  if (user.role === "student") {
    profileId = db.prepare("SELECT id FROM students WHERE user_id = ?").get(user.id)?.id;
  } else if (user.role === "faculty") {
    profileId = db.prepare("SELECT id FROM faculty WHERE user_id = ?").get(user.id)?.id;
  }

  const token = signToken(user, profileId);
  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        profileId,
      },
    },
  });
};

exports.register = (req, res) => {
  const { name, email, password, department, semester, section, rollNumber } = req.body;
  if (!name || !email || !password || !department || !semester) {
    return res.status(400).json({ success: false, message: "Name, email, password, department and semester are required." });
  }

  const cleanEmail = email.toLowerCase().trim();
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(cleanEmail);
  if (exists) {
    return res.status(409).json({ success: false, message: "A user with this email already exists." });
  }

  const tx = db.transaction(() => {
    const hash = bcrypt.hashSync(password, 10);
    const userRes = db
      .prepare("INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, 'student', ?)")
      .run(name.trim(), cleanEmail, hash, department.trim());
    const stuRes = db
      .prepare("INSERT INTO students (user_id, department, semester, section, roll_number) VALUES (?, ?, ?, ?, ?)")
      .run(userRes.lastInsertRowid, department.trim(), Number(semester), section || "A", rollNumber ? rollNumber.trim() : null);

    return {
      userId: userRes.lastInsertRowid,
      studentId: stuRes.lastInsertRowid,
    };
  });

  const { userId, studentId } = tx();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  const token = signToken(user, studentId);

  res.status(201).json({
    success: true,
    message: "Registration successful!",
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        profileId: studentId,
      },
    },
  });
};

exports.me = (req, res) => {
  res.json({ success: true, data: req.user });
};

