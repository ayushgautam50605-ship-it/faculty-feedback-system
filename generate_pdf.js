const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatCode(content) {
  const lines = content.split(/\r?\n/);
  return lines
    .map((line, idx) => {
      const lineNum = String(idx + 1).padStart(3, " ");
      return `<span class="line-num">${lineNum}</span>  ${escapeHtml(line)}`;
    })
    .join("\n");
}

const filesToInclude = [
  {
    title: "1. Database Schema & Configuration",
    filePath: "backend/config/db.js",
    category: "Backend / Database",
    description: "SQLite database setup via better-sqlite3 with foreign key enforcement and 8 normalized tables (users, students, faculty, subjects, criteria, feedback_periods, feedback, feedback_ratings, appraisal_config, appraisal).",
  },
  {
    title: "2. Appraisal Scoring Engine",
    filePath: "backend/utils/appraisal.js",
    category: "Backend / Core Logic",
    description: "The mathematical appraisal engine that computes criterion averages, weighted ratings, normalized 0–100 appraisal percentages, performance grades, and upserts faculty appraisals.",
  },
  {
    title: "3. JWT Authentication & Role Authorization Middleware",
    filePath: "backend/middleware/auth.js",
    category: "Backend / Security",
    description: "Bearer token verification and role-based access control (RBAC) ensuring students, faculty, and HOD can only access their authorized endpoints.",
  },
  {
    title: "4. Auth Controller & Student Self-Registration",
    filePath: "backend/controllers/authController.js",
    category: "Backend / Controllers",
    description: "Handles user login, token signing, and self-registration for new students enrolling into the system with hashed passwords.",
  },
  {
    title: "5. Feedback Controller",
    filePath: "backend/controllers/feedbackController.js",
    category: "Backend / Controllers",
    description: "Validates criterion ratings (1-5), prevents duplicate feedback per period, manages atomic transaction commits for multi-criterion ratings, and tracks student progress.",
  },
  {
    title: "6. Analytics & Performance Aggregation Controller",
    filePath: "backend/controllers/analyticsController.js",
    category: "Backend / Controllers",
    description: "Aggregates student feedback into real-time KPIs, department-wide rating averages, faculty rankings, and radar/bar chart datasets for the HOD dashboard.",
  },
  {
    title: "7. Express API Server Entrypoint",
    filePath: "backend/server.js",
    category: "Backend / Entrypoint",
    description: "Main Express application configuration, CORS handling, JSON body parsing, route registration, and centralized error handling.",
  },
  {
    title: "8. Faculty & Subject Population Script",
    filePath: "backend/add_faculty.js",
    category: "Backend / Scripts",
    description: "Automated provisioning script that registers Information Technology faculty members and links them to their respective semester 5 subjects.",
  },
  {
    title: "9. Student Population Script",
    filePath: "backend/add_students.js",
    category: "Backend / Scripts",
    description: "Registers initial student cohort in the Information Technology department with secure bcrypt credentials.",
  },
  {
    title: "10. Global Authentication Context",
    filePath: "frontend/src/context/AuthContext.jsx",
    category: "Frontend / State",
    description: "React Context managing global user state, token persistence in localStorage, student registration dispatch, and login/logout lifecycles.",
  },
  {
    title: "11. Student Feedback Submission Component",
    filePath: "frontend/src/pages/student/FeedbackForm.jsx",
    category: "Frontend / Pages",
    description: "Interactive student feedback interface featuring 1–5 rating inputs for every active criterion, optional qualitative comments, and submission confirmation.",
  },
  {
    title: "12. Student Dashboard",
    filePath: "frontend/src/pages/student/StudentDashboard.jsx",
    category: "Frontend / Pages",
    description: "Student overview showing pending and completed subject reviews, completion progress bar, and academic semester status.",
  },
  {
    title: "13. Faculty Performance Dashboard",
    filePath: "frontend/src/pages/faculty/FacultyDashboard.jsx",
    category: "Frontend / Pages",
    description: "Faculty dashboard displaying calculated appraisal score, overall rating, criteria-by-criteria breakdown charts, and anonymous student comments.",
  },
  {
    title: "14. HOD Analytics & Appraisal Dashboard",
    filePath: "frontend/src/pages/hod/HodDashboard.jsx",
    category: "Frontend / Pages",
    description: "Comprehensive administration dashboard featuring response completion rates, department rankings, semester comparison trends, and faculty scores.",
  },
];

const workspaceRoot = path.resolve(__dirname, "..");

let sectionsHtml = "";
let tocHtml = "";

filesToInclude.forEach((item, index) => {
  const fullPath = path.join(workspaceRoot, item.filePath);
  let content = "";
  if (fs.existsSync(fullPath)) {
    content = fs.readFileSync(fullPath, "utf-8");
  } else {
    content = `// File not found at: ${item.filePath}`;
  }

  const sectionId = `sec-${index + 1}`;
  tocHtml += `
    <li class="toc-item">
      <a href="#${sectionId}">
        <span class="toc-num">${index + 1}.</span>
        <span class="toc-title">${item.title.replace(/^\d+\.\s*/, "")}</span>
        <span class="toc-tag">${item.category}</span>
      </a>
      <span class="toc-path">${item.filePath}</span>
    </li>
  `;

  sectionsHtml += `
    <section class="code-section" id="${sectionId}">
      <div class="section-header">
        <div class="section-tag">${item.category}</div>
        <h2 class="section-title">${item.title}</h2>
        <div class="file-path">📁 <code>${item.filePath}</code></div>
        <p class="section-desc">${item.description}</p>
      </div>
      <pre class="code-block"><code>${formatCode(content)}</code></pre>
    </section>
  `;
});

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Faculty Feedback & Appraisal System - Core Code Document</title>
  <style>
    @page {
      size: A4;
      margin: 12mm 15mm 15mm 15mm;
      @bottom-right {
        content: counter(page);
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.45;
      font-size: 11pt;
    }

    /* Cover Page */
    .cover {
      min-height: 94vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 3px double #cbd5e1;
      padding: 45px;
      page-break-after: always;
      background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
    }

    .cover-top {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 25px;
    }

    .badge {
      display: inline-block;
      background: #0f172a;
      color: #f8fafc;
      padding: 6px 14px;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }

    h1.project-title {
      font-size: 28pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
      margin-bottom: 12px;
    }

    p.subtitle {
      font-size: 14pt;
      color: #475569;
      font-weight: 400;
      margin-bottom: 20px;
    }

    .meta-box {
      background: #f1f5f9;
      border-left: 4px solid #3b82f6;
      padding: 16px 20px;
      margin-top: 25px;
      border-radius: 0 6px 6px 0;
    }

    .meta-row {
      display: flex;
      margin-bottom: 8px;
      font-size: 10pt;
    }
    .meta-row:last-child {
      margin-bottom: 0;
    }
    .meta-label {
      width: 140px;
      font-weight: 700;
      color: #334155;
    }
    .meta-value {
      color: #0f172a;
      font-family: monospace;
      font-size: 9.5pt;
    }

    .cover-summary {
      margin-top: 30px;
    }

    .summary-heading {
      font-size: 11pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-text {
      color: #475569;
      font-size: 10pt;
      line-height: 1.6;
    }

    .tech-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 15px;
    }

    .tech-pill {
      background: #e2e8f0;
      color: #1e293b;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 8.5pt;
      font-weight: 600;
    }

    .cover-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 18px;
      display: flex;
      justify-content: space-between;
      font-size: 9pt;
      color: #64748b;
    }

    /* Table of Contents */
    .toc-container {
      page-break-after: always;
      padding-top: 10px;
    }

    .toc-heading {
      font-size: 18pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }

    .toc-list {
      list-style: none;
    }

    .toc-item {
      padding: 9px 0;
      border-bottom: 1px dotted #cbd5e1;
      display: flex;
      flex-direction: column;
    }

    .toc-item a {
      text-decoration: none;
      color: #0f172a;
      font-weight: 600;
      font-size: 10pt;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .toc-num {
      color: #2563eb;
      font-weight: 700;
      min-width: 24px;
    }

    .toc-tag {
      background: #f1f5f9;
      color: #475569;
      font-size: 7.5pt;
      padding: 2px 7px;
      border-radius: 4px;
      margin-left: auto;
      font-weight: 500;
    }

    .toc-path {
      font-family: "Consolas", monospace;
      font-size: 8pt;
      color: #64748b;
      margin-left: 28px;
      margin-top: 2px;
    }

    /* Code Section */
    .code-section {
      page-break-before: always;
      padding-top: 5px;
    }

    .section-header {
      margin-bottom: 12px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 10px;
    }

    .section-tag {
      display: inline-block;
      font-size: 7.5pt;
      font-weight: 700;
      color: #2563eb;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
    }

    .section-title {
      font-size: 14pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .file-path {
      font-size: 8.5pt;
      color: #334155;
      margin-bottom: 6px;
    }

    .file-path code {
      font-family: "Consolas", monospace;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 3px;
    }

    .section-desc {
      font-size: 8.5pt;
      color: #64748b;
      line-height: 1.4;
    }

    /* Code Blocks */
    .code-block {
      background: #0f172a;
      color: #f8fafc;
      padding: 14px 16px;
      border-radius: 6px;
      font-family: "Consolas", "Courier New", monospace;
      font-size: 7pt;
      line-height: 1.42;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
      border: 1px solid #1e293b;
    }

    .line-num {
      color: #64748b;
      user-select: none;
      display: inline-block;
      width: 25px;
      text-align: right;
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="cover">
    <div class="cover-top">
      <div class="badge">Official Source Code Documentation</div>
      <h1 class="project-title">Faculty Feedback &amp; Appraisal System</h1>
      <p class="subtitle">Complete Core Architecture, Scoring Engine, API &amp; UI Codebase</p>

      <div class="meta-box">
        <div class="meta-row">
          <span class="meta-label">GitHub Repo:</span>
          <span class="meta-value">https://github.com/ayushgautam50605-ship-it/faculty-feedback-system</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Branch:</span>
          <span class="meta-value">main</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Target Stack:</span>
          <span class="meta-value">Node.js, Express, SQLite, React (Vite), Tailwind CSS</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Department:</span>
          <span class="meta-value">Information Technology (Semester 5)</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Generated Date:</span>
          <span class="meta-value">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </div>
    </div>

    <div class="cover-summary">
      <div class="summary-heading">Project Architectural Summary</div>
      <p class="summary-text">
        The Faculty Feedback &amp; Appraisal System is an end-to-end academic analytics platform that streamlines semester-end faculty evaluations. It replaces manual paper forms with an automated, transparent appraisal scoring pipeline. The system enforces strict role-based access control (HOD, Faculty, Student), prevents duplicate submissions, protects student anonymity, and computes weighted multi-criteria appraisal grades (Satisfactory, Needs Improvement, Excellent) with real-time analytics.
      </p>

      <div class="tech-badges">
        <span class="tech-pill">Express REST API</span>
        <span class="tech-pill">SQLite + better-sqlite3</span>
        <span class="tech-pill">JWT + Bcrypt Auth</span>
        <span class="tech-pill">React 18 + Vite</span>
        <span class="tech-pill">Tailwind CSS</span>
        <span class="tech-pill">Lucide Icons</span>
        <span class="tech-pill">Recharts Analytics</span>
      </div>
    </div>

    <div class="cover-footer">
      <span>Project Code Reference Document</span>
      <span>Confidential &amp; Academic Use</span>
    </div>
  </div>

  <!-- Table of Contents -->
  <div class="toc-container">
    <h2 class="toc-heading">Table of Contents</h2>
    <ul class="toc-list">
      ${tocHtml}
    </ul>
  </div>

  <!-- Code Sections -->
  ${sectionsHtml}

</body>
</html>`;

const outputPath = path.join(workspaceRoot, "code_document.html");
fs.writeFileSync(outputPath, htmlContent, "utf-8");
console.log("HTML generated at:", outputPath);

const pdfOutputPath = path.join(workspaceRoot, "Faculty_Feedback_System_Code.pdf");
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

console.log("Generating PDF via Microsoft Edge...");
try {
  const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfOutputPath}" "${outputPath}"`;
  execSync(cmd, { stdio: "inherit" });
  if (fs.existsSync(pdfOutputPath)) {
    const stats = fs.statSync(pdfOutputPath);
    console.log(`SUCCESS! PDF created at: ${pdfOutputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.error("PDF file was not found after execution.");
  }
} catch (err) {
  console.error("Error generating PDF:", err);
}
