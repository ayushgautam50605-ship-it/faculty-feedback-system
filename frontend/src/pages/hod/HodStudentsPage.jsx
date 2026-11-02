import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import api from "../../api/client";
import Layout from "../../components/Layout";

export default function HodStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "Password@123", department: "", semester: 3, section: "A", rollNumber: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api.get("/admin/students").then((res) => {
      setStudents(res.data.data);
      setLoading(false);
    });
  }
  useEffect(load, []);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/admin/students", { ...form, semester: Number(form.semester) });
      setShowAdd(false);
      setForm({ name: "", email: "", password: "Password@123", department: "", semester: 3, section: "A", rollNumber: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add student.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Remove ${name}? This cannot be undone.`)) return;
    await api.delete(`/admin/students/${id}`);
    load();
  }

  return (
    <Layout title="Students" subtitle="Manage enrolled students">
      <div className="flex justify-end mb-5">
        <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus size={16} /> Add Student</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-ink-400">
          <Loader2 className="animate-spin mr-2" size={18} /> Loading students…
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-ink-400">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Roll No.</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Semester</th>
                <th className="px-4 py-3 font-medium">Section</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-ink-50/50">
                  <td className="px-4 py-3 text-ink-700">{s.name}</td>
                  <td className="px-4 py-3 text-ink-500">{s.roll_number || "—"}</td>
                  <td className="px-4 py-3 text-ink-500">{s.department}</td>
                  <td className="px-4 py-3 text-ink-500">{s.semester}</td>
                  <td className="px-4 py-3 text-ink-500">{s.section}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(s.id, s.name)} className="text-ink-300 hover:text-rust p-1"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-ink-900/40 flex items-center justify-center px-4 z-50">
          <div className="card w-full max-w-md p-6 bg-ivory">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-ink-800">Add Student</h3>
              <button onClick={() => setShowAdd(false)} className="text-ink-300 hover:text-ink-500"><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <div><label className="label">Full name</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">Email</label><input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="label">Roll number</label><input className="input" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} /></div>
              <div><label className="label">Department</label><input required className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Semester</label><input required type="number" min="1" max="8" className="input" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} /></div>
                <div><label className="label">Section</label><input className="input" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></div>
              </div>
              {error && <p className="text-sm text-rust">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving && <Loader2 size={16} className="animate-spin" />} Add Student</button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
