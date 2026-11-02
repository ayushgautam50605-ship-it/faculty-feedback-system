import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line,
} from "recharts";
import { Users, GraduationCap, ClipboardCheck, Star, Loader2, Clock } from "lucide-react";
import api from "../../api/client";
import Layout from "../../components/Layout";
import KPICard from "../../components/KPICard";

function barColor(rating) {
  if (rating >= 4.5) return "#3F7D5C";
  if (rating >= 3) return "#C08A28";
  return "#B4483B";
}

export default function HodDashboard() {
  const [filters, setFilters] = useState(null);
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState(null);
  const [facultyComparison, setFacultyComparison] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [trend, setTrend] = useState([]);
  const [activity, setActivity] = useState([]);

  const loadAll = useCallback(async (dept) => {
    setLoading(true);
    const params = dept ? { department: dept } : {};
    const [dashRes, facRes, critRes, trendRes, actRes] = await Promise.all([
      api.get("/analytics/dashboard", { params }),
      api.get("/analytics/faculty", { params }),
      api.get("/analytics/criteria", { params }),
      api.get("/analytics/trend", { params }),
      api.get("/analytics/recent-activity"),
    ]);
    setKpi(dashRes.data.data);
    setFacultyComparison(facRes.data.data);
    setCriteria(critRes.data.data);
    setTrend(trendRes.data.data);
    setActivity(actRes.data.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    api.get("/analytics/filters").then((res) => setFilters(res.data.data));
    loadAll("");
  }, [loadAll]);

  function handleDeptChange(e) {
    const dept = e.target.value;
    setDepartment(dept);
    loadAll(dept);
  }

  return (
    <Layout title="Faculty Performance Overview" subtitle="Department-wide feedback and appraisal analytics">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select value={department} onChange={handleDeptChange} className="input w-auto min-w-[220px]">
          <option value="">All Departments</option>
          {filters?.departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {kpi && <span className="text-xs text-ink-400">Showing {kpi.academicYear} · Semester {kpi.semester}</span>}
      </div>

      {loading || !kpi ? (
        <div className="flex items-center justify-center py-24 text-ink-400">
          <Loader2 className="animate-spin mr-2" size={18} /> Loading analytics…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard label="Total Faculty" value={kpi.totalFaculty} icon={GraduationCap} />
            <KPICard label="Total Students" value={kpi.totalStudents} icon={Users} />
            <KPICard label="Feedback Completion" value={`${kpi.completionPercentage}%`} sublabel={`${kpi.totalFeedback} responses received`} icon={ClipboardCheck} />
            <KPICard label="Department Average" value={`${kpi.departmentAverageRating} / 5`} icon={Star} tone={kpi.departmentAverageRating >= 4 ? "good" : kpi.departmentAverageRating >= 3 ? "default" : "bad"} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card p-5">
              <h3 className="text-base text-ink-700 mb-1">Faculty Rating Comparison</h3>
              <p className="text-xs text-ink-400 mb-4">Average rating per faculty member, this semester</p>
              <ResponsiveContainer width="100%" height={Math.max(260, facultyComparison.length * 38)}>
                <BarChart data={facultyComparison} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid stroke="#EEF1F7" horizontal={false} />
                  <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: "#4C6291" }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: "#2F4373" }} />
                  <Tooltip />
                  <Bar dataKey="averageRating" radius={[0, 6, 6, 0]} barSize={18}>
                    {facultyComparison.map((f, i) => (
                      <Cell key={i} fill={barColor(f.averageRating)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="text-base text-ink-700 mb-1">Criterion-wise Performance</h3>
              <p className="text-xs text-ink-400 mb-4">Department average across evaluation criteria</p>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={criteria.map((c) => ({ criterion: c.criterion.replace(/ /g, "\n"), rating: c.averageRating }))} outerRadius="75%">
                  <PolarGrid stroke="#D9E0EC" />
                  <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 10, fill: "#4C6291" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9, fill: "#7E92B8" }} />
                  <Radar dataKey="rating" stroke="#2F4373" fill="#2F4373" fillOpacity={0.3} strokeWidth={2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-5 lg:col-span-2">
              <h3 className="text-base text-ink-700 mb-1">Semester Trend</h3>
              <p className="text-xs text-ink-400 mb-4">Average departmental rating over academic terms</p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trend.map((t) => ({ label: t.label, rating: t.averageRating }))} margin={{ left: -10 }}>
                  <CartesianGrid stroke="#EEF1F7" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#4C6291" }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#4C6291" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="rating" stroke="#C08A28" strokeWidth={2.5} dot={{ r: 4, fill: "#C08A28" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="text-base text-ink-700 mb-1">Recent Feedback Activity</h3>
              <p className="text-xs text-ink-400 mb-4">Latest submissions across the department</p>
              <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                {activity.length === 0 && <p className="text-sm text-ink-400">No activity yet.</p>}
                {activity.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    <Clock size={14} className="text-ink-300 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-ink-600 truncate">{a.faculty_name} · {a.subject_name}</p>
                      <p className="text-xs text-ink-400">{new Date(a.submitted_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
