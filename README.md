# Faculty Feedback & Appraisal System

A full-stack academic analytics platform that digitizes semester-end faculty
feedback, automatically computes faculty appraisal scores, and gives the
HOD a real analytics dashboard — built as a college project, structured
like production software.

- **Backend:** Node.js, Express, SQLite (via `better-sqlite3`), JWT auth
- **Frontend:** React (Vite), Tailwind CSS, Recharts, React Router
- See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for schema, API design, appraisal methodology, and the full viva-ready project writeup.

> **Why SQLite instead of MongoDB?** The brief suggested MongoDB, but a
> normalized relational schema (users → students/faculty → subjects →
> feedback → ratings) is a much more natural fit for this data, and
> SQLite needs zero setup — no server to install or connection string to
> configure. The schema is fully normalized SQL and maps directly onto
> MySQL or PostgreSQL if you'd rather run a client-server database; only
> `backend/config/db.js` would need to change.

---

## 1. Quick Start

### Prerequisites
- Node.js 18+ (tested and compatible with **Node v22** and **Node v24**) and npm

### Quick Start (from root)

```bash
# 1. Seed demo database
npm run seed

# 2. Run backend (terminal 1)
npm run start:backend     # runs on http://localhost:5000

# 3. Run frontend (terminal 2)
npm run start:frontend    # runs on http://localhost:5173
```

Alternatively, you can run them from each directory:

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed      # creates & populates the database with demo data
npm start         # runs on http://localhost:5000
```

### Frontend (in a second terminal)

```bash
cd frontend
npm install
npm run dev        # runs on http://localhost:5173
```

Open **http://localhost:5173** and sign in with any demo account below.

### Demo accounts (password for all: `Password@123`)

| Role       | Email                  |
|------------|-------------------------|
| HOD/Admin  | `hod@college.edu`       |
| Faculty    | `faculty1@college.edu`  |
| Student    | `student1@college.edu`  |

Run `npm run seed` again at any time to reset the database to a clean demo state.

---

## 2. Project Structure

```
faculty-feedback-system/
├── backend/
│   ├── config/db.js          # SQLite connection + schema definition
│   ├── controllers/          # request handlers (business logic)
│   ├── routes/                # Express routers, one per resource
│   ├── middleware/auth.js    # JWT auth + role-based authorization
│   ├── utils/appraisal.js    # the appraisal scoring engine
│   ├── seed.js                # demo data generator
│   └── server.js              # app entrypoint
└── frontend/
    └── src/
        ├── api/client.js      # axios instance with auth interceptor
        ├── context/AuthContext.jsx
        ├── components/        # Layout, KPICard, RatingInput, etc.
        └── pages/
            ├── Login.jsx
            ├── student/        # feedback submission flow
            ├── faculty/        # performance dashboard
            └── hod/            # analytics, admin, appraisals, reports
```

## 3. Running a demo / viva walkthrough

1. **Student** (`student1@college.edu`) → Give Feedback → rate a subject → submit → see the confirmation screen and the completion progress bar update.
2. **Faculty** (`faculty1@college.edu`) → My Performance → see KPI cards, the radar chart of criteria, the semester trend line, rating distribution, and anonymized comments — with the exact appraisal formula shown on screen.
3. **HOD** (`hod@college.edu`) → Dashboard → filter by department, see faculty comparison, criterion radar, semester trend, and recent activity → Appraisals to regenerate/view scores → Reports to export a CSV → Settings to change the appraisal formula thresholds or open/close the feedback collection window.

## 4. Notes for production use

- Replace `JWT_SECRET` in `backend/.env` with a long random value.
- `better-sqlite3` is fine for a class project / single-server demo; for real concurrent multi-department use, swap in PostgreSQL (the SQL is already portable) and move to connection pooling.
- Add rate limiting and HTTPS termination (e.g. via a reverse proxy) before any real deployment.
