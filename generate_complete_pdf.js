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
      const lineNum = String(idx + 1).padStart(4, " ");
      return `<span class="line-num">${lineNum}</span>  ${escapeHtml(line)}`;
    })
    .join("\n");
}

const chapters = [
  {
    chapterTitle: "CHAPTER 1: ARCHITECTURE & SYSTEM SPECIFICATION",
    files: [
      {
        title: "System Architecture & Design Document",
        filePath: "ARCHITECTURE.md",
        category: "System Design",
        desc: "Architecture diagrams, entity relationships, database schema specifications, appraisal mathematical formulation, and API contracts.",
      },
      {
        title: "Project Readme & Operational Guide",
        filePath: "README.md",
        category: "Documentation",
        desc: "Quickstart commands, system requirements, demo user credentials, and walkthrough guide.",
      },
    ],
  },
  {
    chapterTitle: "CHAPTER 2: DATABASE LAYER & INITIALIZATION",
    files: [
      {
        title: "Database Configuration & 8-Table Normalized Schema",
        filePath: "backend/config/db.js",
        category: "Database Layer",
        desc: "SQLite connection initialization, foreign key pragma, table schemas (users, students, faculty, subjects, criteria, feedback_periods, feedback, feedback_ratings, appraisal_config, appraisal) and indexing.",
      },
    ],
  },
  {
    chapterTitle: "CHAPTER 3: CORE APPRAISAL ENGINE & SECURITY MIDDLEWARE",
    files: [
      {
        title: "Appraisal Scoring & Mathematical Grade Engine",
        filePath: "backend/utils/appraisal.js",
        category: "Business Logic",
        desc: "Mathematical scoring engine calculating criterion-wise averages, weighted ratings, 0-100 normalized performance percentages, and grade thresholds.",
      },
      {
        title: "JWT Authentication & Role Authorization Middleware",
        filePath: "backend/middleware/auth.js",
        category: "Security / RBAC",
        desc: "JSON Web Token verification, session integrity, and role-based route gating (Student, Faculty, HOD).",
      },
      {
        title: "Express Server Entrypoint & API Dispatcher",
        filePath: "backend/server.js",
        category: "Server Core",
        desc: "Express server bootstrap, CORS configuration, JSON body parsing, route mounts, and global error handling.",
      },
    ],
  },
  {
    chapterTitle: "CHAPTER 4: BACKEND CONTROLLERS (BUSINESS LOGIC)",
    files: [
      {
        title: "Authentication & Student Self-Registration Controller",
        filePath: "backend/controllers/authController.js",
        category: "Controller",
        desc: "User login authentication, bcrypt password matching, JWT issuance, and student registration.",
      },
      {
        title: "Feedback Submission & Validation Controller",
        filePath: "backend/controllers/feedbackController.js",
        category: "Controller",
        desc: "Student feedback validation, multi-criterion ratings transactions, duplicate submission guard, and progress tracking.",
      },
      {
        title: "Analytics & KPI Aggregation Controller",
        filePath: "backend/controllers/analyticsController.js",
        category: "Controller",
        desc: "Real-time analytics computation, department completion rates, ratings distribution, and radar chart metrics.",
      },
      {
        title: "Faculty Dashboard Performance Controller",
        filePath: "backend/controllers/facultyController.js",
        category: "Controller",
        desc: "Per-faculty performance summaries, semester appraisal retrieval, criteria breakdowns, and anonymous student comments.",
      },
      {
        title: "Appraisal Management Controller",
        filePath: "backend/controllers/appraisalController.js",
        category: "Controller",
        desc: "HOD appraisal calculation triggers, faculty ranking reports, and configuration controls.",
      },
      {
        title: "System Administration Controller",
        filePath: "backend/controllers/adminController.js",
        category: "Controller",
        desc: "CRUD operations for faculty accounts, student rosters, subject-teacher assignments, criteria weights, and feedback period toggles.",
      },
    ],
  },
  {
    chapterTitle: "CHAPTER 5: BACKEND ROUTE DEFINITIONS",
    files: [
      { title: "Authentication Routes", filePath: "backend/routes/authRoutes.js", category: "API Routes", desc: "Routes for /api/auth (login, register, me)" },
      { title: "Feedback Routes", filePath: "backend/routes/feedbackRoutes.js", category: "API Routes", desc: "Routes for /api/feedback (criteria, targets, status, submit)" },
      { title: "Faculty Routes", filePath: "backend/routes/facultyRoutes.js", category: "API Routes", desc: "Routes for /api/faculty (dashboard, performance, comments)" },
      { title: "Analytics Routes", filePath: "backend/routes/analyticsRoutes.js", category: "API Routes", desc: "Routes for /api/analytics (dashboard, comparison, trends)" },
      { title: "Appraisal Routes", filePath: "backend/routes/appraisalRoutes.js", category: "API Routes", desc: "Routes for /api/appraisal (generate, list, export)" },
      { title: "Admin Management Routes", filePath: "backend/routes/adminRoutes.js", category: "API Routes", desc: "Routes for /api/admin (students, faculty, subjects, criteria, periods, CSV reports)" },
    ],
  },
  {
    chapterTitle: "CHAPTER 6: DATA SEEDING & DEPLOYMENT SCRIPTS",
    files: [
      { title: "IT Faculty & Subjects Provisioning", filePath: "backend/add_faculty.js", category: "Scripts", desc: "Auto-creates the 5 Information Technology faculty accounts with assigned semester 5 subjects." },
      { title: "IT Student Cohort Registration", filePath: "backend/add_students.js", category: "Scripts", desc: "Registers the IT semester 5 student cohort with secure default credentials." },
      { title: "Database Reset & Clean Utility", filePath: "backend/clean.js", category: "Scripts", desc: "Wipes demo data while establishing clean tables and the default HOD administrator." },
      { title: "Mock Data Seeder", filePath: "backend/seed.js", category: "Scripts", desc: "Generates realistic evaluation spread, criteria ratings, and appraisals for demo walkthroughs." },
    ],
  },
  {
    chapterTitle: "CHAPTER 7: FRONTEND APPLICATION CORE & STATE",
    files: [
      { title: "Vite HTML Entrypoint", filePath: "frontend/index.html", category: "Frontend Core", desc: "Single Page Application root HTML template." },
      { title: "React Root Mount", filePath: "frontend/src/main.jsx", category: "Frontend Core", desc: "Mounts the React root into the DOM with BrowserRouter and AuthProvider." },
      { title: "Application Routes & Role Protection", filePath: "frontend/src/App.jsx", category: "Frontend Core", desc: "React Router setup mapping paths to Student, Faculty, and HOD dashboards with route guard protection." },
      { title: "Axios HTTP Client & Auth Interceptor", filePath: "frontend/src/api/client.js", category: "Frontend Core", desc: "Centralized API client automatically injecting JWT tokens into request headers." },
      { title: "Global Authentication Context", filePath: "frontend/src/context/AuthContext.jsx", category: "Frontend Core", desc: "React Context managing login, registration, logout, and token synchronization." },
      { title: "Tailwind CSS Global Styles", filePath: "frontend/src/index.css", category: "Frontend Core", desc: "Custom color palette (ink, ivory, gold, leaf, rust) and reusable utility classes." },
    ],
  },
  {
    chapterTitle: "CHAPTER 8: FRONTEND REUSABLE COMPONENTS",
    files: [
      { title: "App Layout & Navigation Sidebar", filePath: "frontend/src/components/Layout.jsx", category: "UI Component", desc: "Responsive layout with header, active user badge, sidebar navigation, and logout action." },
      { title: "KPI Card Display", filePath: "frontend/src/components/KPICard.jsx", category: "UI Component", desc: "Card widget for rendering metric statistics, trends, and change badges." },
      { title: "Star & Numeric Rating Input", filePath: "frontend/src/components/RatingInput.jsx", category: "UI Component", desc: "Interactive 1 to 5 star rating picker with hover previews and accessibility labels." },
      { title: "Protected Route Barrier", filePath: "frontend/src/components/ProtectedRoute.jsx", category: "UI Component", desc: "Higher-Order Component guarding routes by role and redirecting unauthorized users." },
      { title: "Empty State Widget", filePath: "frontend/src/components/EmptyState.jsx", category: "UI Component", desc: "Placeholder component rendered when queries return zero results." },
      { title: "Toast Notification Widget", filePath: "frontend/src/components/Toast.jsx", category: "UI Component", desc: "Non-intrusive floating alert messages for action confirmations." },
    ],
  },
  {
    chapterTitle: "CHAPTER 9: STUDENT PORTAL PAGES",
    files: [
      { title: "Student Dashboard", filePath: "frontend/src/pages/student/StudentDashboard.jsx", category: "Student Page", desc: "Displays assigned semester subjects, pending feedback cards, and overall submission progress." },
      { title: "Interactive Feedback Submission Form", filePath: "frontend/src/pages/student/FeedbackForm.jsx", category: "Student Page", desc: "Dynamic questionnaire form rendering all active evaluation criteria, star pickers, comments, and submission handler." },
    ],
  },
  {
    chapterTitle: "CHAPTER 10: FACULTY PORTAL PAGES",
    files: [
      { title: "Faculty Analytics & Appraisal Dashboard", filePath: "frontend/src/pages/faculty/FacultyDashboard.jsx", category: "Faculty Page", desc: "Visualizes the faculty member's appraisal score, performance grade, criterion-by-criterion bar breakdown, and student comments." },
    ],
  },
  {
    chapterTitle: "CHAPTER 11: HOD & ADMINISTRATION PAGES",
    files: [
      { title: "HOD Executive Analytics Dashboard", filePath: "frontend/src/pages/hod/HodDashboard.jsx", category: "HOD Page", desc: "Department-wide overview featuring feedback completion gauges, faculty ranking table, and performance charts." },
      { title: "Faculty Roster & Assignment Page", filePath: "frontend/src/pages/hod/HodFacultyPage.jsx", category: "HOD Page", desc: "HOD view to add new faculty members, inspect current faculty list, and assign subjects." },
      { title: "Student Roster Management Page", filePath: "frontend/src/pages/hod/HodStudentsPage.jsx", category: "HOD Page", desc: "Enrolled student management interface for viewing student lists and manual registrations." },
      { title: "Faculty Appraisals & Scoring Engine Page", filePath: "frontend/src/pages/hod/HodAppraisalsPage.jsx", category: "HOD Page", desc: "Appraisal generation panel to trigger calculations, review rankings, and inspect scores." },
      { title: "Feedback Period & Criteria Settings", filePath: "frontend/src/pages/hod/HodSettingsPage.jsx", category: "HOD Page", desc: "Controls active criteria, relative appraisal weights, and opening/closing semester feedback periods." },
      { title: "Reports & CSV Export Page", filePath: "frontend/src/pages/hod/HodReportsPage.jsx", category: "HOD Page", desc: "Export interface generating downloadable CSV appraisal reports for audits and college reviews." },
      { title: "Unified Login & Student Self-Registration Page", filePath: "frontend/src/pages/Login.jsx", category: "Auth Page", desc: "Tabbed portal allowing HOD, faculty, and students to log in, and new students to register." },
    ],
  },
  {
    chapterTitle: "CHAPTER 12: BUILD & DEPENDENCY CONFIGURATION",
    files: [
      { title: "Root Workspace Package Config", filePath: "package.json", category: "Config", desc: "Monorepo script definitions for concurrently running backend and frontend." },
      { title: "Backend Package & Dependencies", filePath: "backend/package.json", category: "Config", desc: "Backend runtime dependencies (better-sqlite3, express, bcryptjs, jsonwebtoken, cors)." },
      { title: "Frontend Package & Dependencies", filePath: "frontend/package.json", category: "Config", desc: "Frontend build dependencies (react, vite, tailwindcss, recharts, lucide-react)." },
      { title: "Vite Bundler Configuration", filePath: "frontend/vite.config.js", category: "Config", desc: "Vite build settings and React plugin configuration." },
      { title: "Tailwind CSS Design System Config", filePath: "frontend/tailwind.config.js", category: "Config", desc: "Tailwind CSS theme extensions, typography settings, and custom color definitions." },
    ],
  },
];

const workspaceRoot = path.resolve(__dirname);

let totalFileCount = 0;
let sectionsHtml = "";
let tocHtml = "";

chapters.forEach((ch, chIdx) => {
  tocHtml += `
    <div class="toc-chapter-header">${ch.chapterTitle}</div>
    <ul class="toc-list">
  `;

  ch.files.forEach((item) => {
    totalFileCount++;
    const fullPath = path.join(workspaceRoot, item.filePath);
    let content = "";
    if (fs.existsSync(fullPath)) {
      content = fs.readFileSync(fullPath, "utf-8");
    } else {
      content = `// File not found at: ${item.filePath}`;
    }

    const sectionId = `sec-${totalFileCount}`;
    tocHtml += `
      <li class="toc-item">
        <a href="#${sectionId}">
          <span class="toc-num">${totalFileCount}.</span>
          <span class="toc-title">${item.title}</span>
          <span class="toc-tag">${item.category}</span>
        </a>
        <span class="toc-path">${item.filePath}</span>
      </li>
    `;

    sectionsHtml += `
      <section class="code-section" id="${sectionId}">
        <div class="section-header">
          <div class="chapter-crumb">${ch.chapterTitle}</div>
          <div class="section-tag">${item.category}</div>
          <h2 class="section-title">${totalFileCount}. ${item.title}</h2>
          <div class="file-path">📁 Source File: <code>${item.filePath}</code></div>
          <p class="section-desc">${item.desc}</p>
        </div>
        <pre class="code-block"><code>${formatCode(content)}</code></pre>
      </section>
    `;
  });

  tocHtml += `</ul>`;
});

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Faculty Feedback &amp; Appraisal System - Complete Codebase</title>
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
      border: 3px double #0f172a;
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
      letter-spacing: 1.2px;
      margin-bottom: 20px;
    }

    h1.project-title {
      font-size: 27pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
      margin-bottom: 10px;
    }

    p.subtitle {
      font-size: 13.5pt;
      color: #475569;
      font-weight: 400;
      margin-bottom: 18px;
    }

    .meta-box {
      background: #f1f5f9;
      border-left: 4px solid #2563eb;
      padding: 16px 20px;
      margin-top: 20px;
      border-radius: 0 6px 6px 0;
    }

    .meta-row {
      display: flex;
      margin-bottom: 7px;
      font-size: 9.5pt;
    }
    .meta-row:last-child {
      margin-bottom: 0;
    }
    .meta-label {
      width: 145px;
      font-weight: 700;
      color: #334155;
    }
    .meta-value {
      color: #0f172a;
      font-family: monospace;
      font-size: 9.5pt;
    }

    .cover-summary {
      margin-top: 25px;
    }

    .summary-heading {
      font-size: 10.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-text {
      color: #475569;
      font-size: 9.5pt;
      line-height: 1.6;
    }

    .tech-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin-top: 14px;
    }

    .tech-pill {
      background: #e2e8f0;
      color: #0f172a;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 8pt;
      font-weight: 600;
    }

    .cover-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
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
      border-bottom: 2px solid #0f172a;
      padding-bottom: 10px;
      margin-bottom: 18px;
    }

    .toc-chapter-header {
      font-size: 10pt;
      font-weight: 700;
      color: #1e40af;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      background: #eff6ff;
      padding: 6px 10px;
      border-radius: 4px;
      margin-top: 14px;
      margin-bottom: 6px;
      border-left: 3px solid #3b82f6;
    }

    .toc-list {
      list-style: none;
      margin-bottom: 10px;
    }

    .toc-item {
      padding: 6px 0;
      border-bottom: 1px dotted #cbd5e1;
      display: flex;
      flex-direction: column;
    }

    .toc-item a {
      text-decoration: none;
      color: #0f172a;
      font-weight: 600;
      font-size: 9pt;
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
      font-size: 7pt;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: auto;
      font-weight: 500;
    }

    .toc-path {
      font-family: "Consolas", monospace;
      font-size: 7.5pt;
      color: #64748b;
      margin-left: 28px;
      margin-top: 1px;
    }

    /* Code Section */
    .code-section {
      page-break-before: always;
      padding-top: 5px;
    }

    .chapter-crumb {
      font-size: 7pt;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 2px;
    }

    .section-header {
      margin-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
    }

    .section-tag {
      display: inline-block;
      font-size: 7pt;
      font-weight: 700;
      color: #2563eb;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 3px;
    }

    .section-title {
      font-size: 13pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 3px;
    }

    .file-path {
      font-size: 8pt;
      color: #334155;
      margin-bottom: 4px;
    }

    .file-path code {
      font-family: "Consolas", monospace;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 3px;
    }

    .section-desc {
      font-size: 8pt;
      color: #64748b;
      line-height: 1.4;
    }

    /* Code Blocks */
    .code-block {
      background: #0f172a;
      color: #f8fafc;
      padding: 12px 14px;
      border-radius: 6px;
      font-family: "Consolas", "Courier New", monospace;
      font-size: 6.8pt;
      line-height: 1.40;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
      border: 1px solid #1e293b;
    }

    .line-num {
      color: #64748b;
      user-select: none;
      display: inline-block;
      width: 28px;
      text-align: right;
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="cover">
    <div class="cover-top">
      <div class="badge">Comprehensive Source Code Document</div>
      <h1 class="project-title">Faculty Feedback &amp; Appraisal System</h1>
      <p class="subtitle">Complete Production Source Codebase — Backend, Database &amp; Frontend</p>

      <div class="meta-box">
        <div class="meta-row">
          <span class="meta-label">GitHub Repository:</span>
          <span class="meta-value">https://github.com/ayushgautam50605-ship-it/faculty-feedback-system</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Default Branch:</span>
          <span class="meta-value">main</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Architecture:</span>
          <span class="meta-value">Node.js, Express REST API, SQLite (better-sqlite3), React 18, Vite, Tailwind CSS</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Department / Cohort:</span>
          <span class="meta-value">Information Technology (Semester 5)</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Total Modules:</span>
          <span class="meta-value">${totalFileCount} Source Files</span>
        </div>
      </div>
    </div>

    <div class="cover-summary">
      <div class="summary-heading">System Purpose &amp; Methodology</div>
      <p class="summary-text">
        This document provides the full, unabridged source code for the Faculty Feedback &amp; Appraisal System. The platform digitizes institutional course-end surveys, replaces manual evaluation forms, ensures anonymous student submissions, and calculates transparent weighted faculty appraisal scores across 10 evaluation criteria. It equips Heads of Department (HOD) with real-time academic analytics, completion gauges, faculty rankings, and report exports.
      </p>

      <div class="tech-badges">
        <span class="tech-pill">Express.js API</span>
        <span class="tech-pill">better-sqlite3</span>
        <span class="tech-pill">JWT &amp; Bcrypt RBAC</span>
        <span class="tech-pill">React 18 SPA</span>
        <span class="tech-pill">Tailwind CSS</span>
        <span class="tech-pill">Recharts Data Visualizations</span>
        <span class="tech-pill">Self-Registration</span>
      </div>
    </div>

    <div class="cover-footer">
      <span>Faculty Feedback System &bull; Project Codebook</span>
      <span>Page 1</span>
    </div>
  </div>

  <!-- Table of Contents -->
  <div class="toc-container">
    <h2 class="toc-heading">Table of Contents (${totalFileCount} Source Files)</h2>
    ${tocHtml}
  </div>

  <!-- Code Sections -->
  ${sectionsHtml}

</body>
</html>`;

const outputPath = path.join(workspaceRoot, "complete_code_document.html");
fs.writeFileSync(outputPath, htmlContent, "utf-8");
console.log("HTML compiled at:", outputPath);

const pdfOutputPath = path.join(workspaceRoot, "Faculty_Feedback_System_Complete_Code.pdf");
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

console.log("Generating Complete PDF via Microsoft Edge...");
try {
  const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfOutputPath}" "${outputPath}"`;
  execSync(cmd, { stdio: "inherit" });
  if (fs.existsSync(pdfOutputPath)) {
    const stats = fs.statSync(pdfOutputPath);
    console.log(`SUCCESS! Complete Codebase PDF created at: ${pdfOutputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.error("PDF was not created.");
  }
} catch (err) {
  console.error("Error generating PDF:", err);
}
