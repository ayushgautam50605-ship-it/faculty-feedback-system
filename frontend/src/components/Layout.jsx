import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardList,
  BarChart3,
  Award,
  FileDown,
  Settings,
  LogOut,
  BookMarked,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV = {
  student: [
    { to: "/student", label: "Give Feedback", icon: ClipboardList, end: true },
  ],
  faculty: [
    { to: "/faculty", label: "My Performance", icon: BarChart3, end: true },
  ],
  hod: [
    { to: "/hod", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/hod/faculty", label: "Faculty", icon: GraduationCap },
    { to: "/hod/students", label: "Students", icon: Users },
    { to: "/hod/appraisals", label: "Appraisals", icon: Award },
    { to: "/hod/reports", label: "Reports", icon: FileDown },
    { to: "/hod/settings", label: "Settings", icon: Settings },
  ],
};

export default function Layout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV[user?.role] || [];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-paper">
      <aside className="hidden md:flex md:w-64 flex-col bg-ink-800 text-ivory shrink-0">
        <div className="flex items-center gap-2.5 px-6 py-6 border-b border-ink-700">
          <div className="h-9 w-9 rounded-lg bg-gold-500 flex items-center justify-center">
            <BookMarked size={18} className="text-ink-800" />
          </div>
          <div>
            <p className="font-serif text-base leading-tight text-ivory">Faculty Feedback</p>
            <p className="text-xs text-ink-300 leading-tight">&amp; Appraisal System</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-ink-700 text-ivory" : "text-ink-200 hover:bg-ink-700/60 hover:text-ivory"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-ink-700">
          <div className="mb-3">
            <p className="text-sm font-medium text-ivory truncate">{user?.name}</p>
            <p className="text-xs text-ink-300 truncate">{user?.department}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-200 hover:bg-ink-700/60 hover:text-ivory transition-colors"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-10 bg-paper/95 backdrop-blur border-b border-ink-100 px-5 md:px-8 py-4 flex items-center justify-between">
          <div>
            {title && <h1 className="text-xl md:text-2xl text-ink-800">{title}</h1>}
            {subtitle && <p className="text-sm text-ink-400 mt-0.5">{subtitle}</p>}
          </div>
          <div className="md:hidden flex items-center gap-3">
            <span className="text-sm text-ink-500">{user?.name}</span>
            <button onClick={handleLogout} className="text-ink-500">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 px-5 md:px-8 py-6 max-w-7xl w-full mx-auto">{children}</main>

        <nav className="md:hidden sticky bottom-0 bg-ink-800 border-t border-ink-700 flex justify-around py-2">
          {items.slice(0, 5).map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${
                  isActive ? "text-gold-500" : "text-ink-300"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
