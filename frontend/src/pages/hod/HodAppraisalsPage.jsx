import { useEffect, useState } from "react";
import { Award, Loader2, RefreshCcw } from "lucide-react";
import api from "../../api/client";
import Layout from "../../components/Layout";

const GRADE_STYLES = {
  Excellent: "bg-leaf/10 text-leaf",
  Satisfactory: "bg-gold-100 text-gold-700",
  "Needs Improvement": "bg-rust/10 text-rust",
};

export default function HodAppraisalsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [semester, setSemester] = useState(3);
  const [academicYear, setAcademicYear] = useState("2025-26");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const facRes = await api.get("/faculty");
    const results = await Promise.all(
      facRes.data.data.map((f) =>
        api.get(`/appraisal/${f.id}`, { params: { semester, academicYear } }).then((r) => ({ ...r.data.data, facultyName: f.name, department: f.department }))
      )
    );
    setRows(results.sort((a, b) => b.appraisalScore - a.appraisalScore));
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [semester, academicYear]);

  async function handleGenerate() {
    setGenerating(true);
    setMessage("");
    try {
      const res = await api.post("/appraisal/generate", { semester: Number(semester), academicYear });
      setMessage(res.data.message);
      load();
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Layout title="Appraisals" subtitle="Generated automatically from submitted feedback using the configured formula">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input className="input w-auto" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="Academic Year" />
        <input className="input w-24" type="number" value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="Sem" />
        <button onClick={handleGenerate} disabled={generating} className="btn-primary">
          {generating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
          Regenerate Appraisals
        </button>
        {message && <span className="text-sm text-leaf">{message}</span>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-ink-400">
          <Loader2 className="animate-spin mr-2" size={18} /> Loading appraisals…
        </div>
      ) : rows.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <Award size={28} className="text-ink-300 mb-3" />
          <p className="text-ink-600">No appraisal data for this period yet</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-ink-400">
                <th className="px-4 py-3 font-medium">Faculty</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Responses</th>
                <th className="px-4 py-3 font-medium">Avg. Rating</th>
                <th className="px-4 py-3 font-medium">Appraisal Score</th>
                <th className="px-4 py-3 font-medium">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((r) => (
                <tr key={r.facultyId} className="hover:bg-ink-50/50">
                  <td className="px-4 py-3 text-ink-700 font-medium">{r.facultyName}</td>
                  <td className="px-4 py-3 text-ink-500">{r.department}</td>
                  <td className="px-4 py-3 text-ink-500">{r.totalResponses}</td>
                  <td className="px-4 py-3 text-ink-500">{r.weightedAverageRating} / {r.scaleMax}</td>
                  <td className="px-4 py-3 text-ink-700 font-medium">{r.appraisalScore}%</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${GRADE_STYLES[r.grade]}`}>{r.grade}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
