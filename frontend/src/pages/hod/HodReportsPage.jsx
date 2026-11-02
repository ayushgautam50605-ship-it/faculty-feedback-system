import { useState } from "react";
import { FileDown } from "lucide-react";
import Layout from "../../components/Layout";

export default function HodReportsPage() {
  const [semester, setSemester] = useState(3);
  const [academicYear, setAcademicYear] = useState("2025-26");

  function handleDownload() {
    const token = localStorage.getItem("ffas_token");
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    // Use a temporary link with the token as a query fallback isn't supported by our API (header-only auth),
    // so we fetch and trigger a blob download instead of a plain navigation.
    fetch(`${base}/admin/reports/appraisal.csv?semester=${semester}&academicYear=${encodeURIComponent(academicYear)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `appraisal_report_${academicYear}_sem${semester}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      });
  }

  return (
    <Layout title="Reports" subtitle="Export faculty appraisal reports for a semester">
      <div className="card p-6 max-w-lg">
        <h3 className="text-base text-ink-700 mb-4">Faculty Appraisal Report (CSV)</h3>
        <p className="text-sm text-ink-500 mb-5">
          Includes faculty details, department, total responses, average rating, final appraisal score and grade for every faculty member.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="label">Academic Year</label>
            <input className="input" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
          </div>
          <div>
            <label className="label">Semester</label>
            <input type="number" className="input" value={semester} onChange={(e) => setSemester(e.target.value)} />
          </div>
        </div>
        <button onClick={handleDownload} className="btn-primary">
          <FileDown size={16} /> Download CSV Report
        </button>
      </div>
    </Layout>
  );
}
