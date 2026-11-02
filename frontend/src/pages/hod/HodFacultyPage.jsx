import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Loader2, Plus, Trash2, X } from "lucide-react";
import api from "../../api/client";
import Layout from "../../components/Layout";
import FacultyDashboard from "../faculty/FacultyDashboard";

export default function HodFacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "Password@123", department: "", designation: "Assistant Professor" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api.get("/faculty").then((res) => {
      setFaculty(res.data.data);
      setLoading(false);
    });
  }

  useEffect(load, []);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/admin/faculty", form);
      setShowAdd(false);
      setForm({ name: "", email: "", password: "Password@123", department: "", designation: "Assistant Professor" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add faculty member.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Remove ${name} from the system? This cannot be undone.`)) return;
    await api.delete(`/admin/faculty/${id}`);
    load();
  }

  if (selected) {
    return (
      <div>
        <div className="px-5 md:px-8 pt-6">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-600"
          >
            <ArrowLeft size={15} /> Back to faculty list
          </button>
        </div>
        <FacultyDashboard facultyIdOverride={selected} />
      </div>
    );
  }

  return (
    <Layout title="Faculty" subtitle="Manage faculty and drill into individual performance">
      <div className="flex justify-end mb-5">
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus size={16} /> Add Faculty
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-ink-400">
          <Loader2 className="animate-spin mr-2" size={18} /> Loading faculty…
        </div>
      ) : (
        <div className="card divide-y divide-ink-100">
          {faculty.map((f) => (
            <div key={f.id} className="p-4 flex items-center justify-between gap-3 hover:bg-ink-50/50 transition-colors">
              <button onClick={() => setSelected(f.id)} className="flex-1 flex items-center justify-between text-left min-w-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-700 truncate">{f.name}</p>
                  <p className="text-xs text-ink-400 truncate">{f.department} · {f.designation}</p>
                </div>
                <ChevronRight size={18} className="text-ink-300 shrink-0" />
              </button>
              <button onClick={() => handleDelete(f.id, f.name)} className="text-ink-300 hover:text-rust p-1.5 shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-ink-900/40 flex items-center justify-center px-4 z-50">
          <div className="card w-full max-w-md p-6 bg-ivory">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-ink-800">Add Faculty Member</h3>
              <button onClick={() => setShowAdd(false)} className="text-ink-300 hover:text-ink-500"><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="label">Full name</label>
                <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Email</label>
                <input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Department</label>
                <input required className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div>
                <label className="label">Designation</label>
                <input className="input" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
              </div>
              {error && <p className="text-sm text-rust">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving && <Loader2 size={16} className="animate-spin" />} Add Faculty
                </button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
