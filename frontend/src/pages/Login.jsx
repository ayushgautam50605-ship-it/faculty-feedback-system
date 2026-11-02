import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookMarked, Loader2, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, register, error, loading, setError } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "register"

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Student registration form state
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    rollNumber: "",
    department: "Information Technology",
    semester: 5,
    section: "A",
    password: "",
  });

  async function handleLoginSubmit(e) {
    e.preventDefault();
    try {
      const user = await login(email, password);
      navigate(`/${user.role}`);
    } catch {
      // error handled in context
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    try {
      const user = await register(regForm);
      navigate(`/${user.role}`);
    } catch {
      // error handled in context
    }
  }

  return (
    <div className="min-h-screen bg-ink-800 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-gold-500 flex items-center justify-center mb-3">
            <BookMarked size={24} className="text-ink-800" />
          </div>
          <h1 className="text-2xl text-ivory text-center font-serif">Faculty Feedback &amp; Appraisal System</h1>
          <p className="text-ink-300 text-sm mt-1 text-center">
            {mode === "login"
              ? "Sign in to submit feedback, review performance, or manage analytics."
              : "Register as a student to provide semester feedback."}
          </p>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex rounded-lg bg-ink-900/60 p-1 mb-5 border border-ink-700">
          <button
            type="button"
            onClick={() => {
              setError("");
              setMode("login");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "login"
                ? "bg-gold-500 text-ink-900 shadow-sm"
                : "text-ink-300 hover:text-white"
            }`}
          >
            <LogIn size={15} /> Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setError("");
              setMode("register");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "register"
                ? "bg-gold-500 text-ink-900 shadow-sm"
                : "text-ink-300 hover:text-white"
            }`}
          >
            <UserPlus size={15} /> Student Registration
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="card p-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                className="input"
                placeholder="you@skit.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-rust bg-rust/5 border border-rust/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Loader2 size={16} className="animate-spin mr-2" />}
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="card p-6 space-y-3.5">
            <div>
              <label className="label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                required
                className="input"
                placeholder="Student Name"
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="reg-email">College Email</label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  className="input"
                  placeholder="b24xxxx@skit.ac.in"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="reg-roll">Roll Number</label>
                <input
                  id="reg-roll"
                  type="text"
                  required
                  className="input"
                  placeholder="24ESKIT000"
                  value={regForm.rollNumber}
                  onChange={(e) => setRegForm({ ...regForm, rollNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="label" htmlFor="reg-dept">Department</label>
                <input
                  id="reg-dept"
                  type="text"
                  required
                  className="input text-xs"
                  value={regForm.department}
                  onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="reg-sem">Semester</label>
                <select
                  id="reg-sem"
                  className="input"
                  value={regForm.semester}
                  onChange={(e) => setRegForm({ ...regForm, semester: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Sem {s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="reg-sec">Section</label>
                <input
                  id="reg-sec"
                  type="text"
                  maxLength={2}
                  className="input"
                  value={regForm.section}
                  onChange={(e) => setRegForm({ ...regForm, section: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                required
                className="input"
                placeholder="Choose a password"
                value={regForm.password}
                onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
              />
            </div>

            {error && (
              <p className="text-sm text-rust bg-rust/5 border border-rust/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading && <Loader2 size={16} className="animate-spin mr-2" />}
              Create Student Account &amp; Sign In
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <p className="text-xs text-ink-400">
            HOD Login: <span className="text-gold-400">hod@college.edu</span> | Password: <span className="text-gold-400">Password@123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
