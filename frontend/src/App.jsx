import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import StudentDashboard from "./pages/student/StudentDashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import HodDashboard from "./pages/hod/HodDashboard";
import HodFacultyPage from "./pages/hod/HodFacultyPage";
import HodStudentsPage from "./pages/hod/HodStudentsPage";
import HodAppraisalsPage from "./pages/hod/HodAppraisalsPage";
import HodReportsPage from "./pages/hod/HodReportsPage";
import HodSettingsPage from "./pages/hod/HodSettingsPage";

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} replace /> : <Login />} />

      <Route path="/student" element={<ProtectedRoute roles={["student"]}><StudentDashboard /></ProtectedRoute>} />

      <Route path="/faculty" element={<ProtectedRoute roles={["faculty"]}><FacultyDashboard /></ProtectedRoute>} />

      <Route path="/hod" element={<ProtectedRoute roles={["hod"]}><HodDashboard /></ProtectedRoute>} />
      <Route path="/hod/faculty" element={<ProtectedRoute roles={["hod"]}><HodFacultyPage /></ProtectedRoute>} />
      <Route path="/hod/students" element={<ProtectedRoute roles={["hod"]}><HodStudentsPage /></ProtectedRoute>} />
      <Route path="/hod/appraisals" element={<ProtectedRoute roles={["hod"]}><HodAppraisalsPage /></ProtectedRoute>} />
      <Route path="/hod/reports" element={<ProtectedRoute roles={["hod"]}><HodReportsPage /></ProtectedRoute>} />
      <Route path="/hod/settings" element={<ProtectedRoute roles={["hod"]}><HodSettingsPage /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to={user ? `/${user.role}` : "/login"} replace />} />
      <Route path="*" element={<Navigate to={user ? `/${user.role}` : "/login"} replace />} />
    </Routes>
  );
}
