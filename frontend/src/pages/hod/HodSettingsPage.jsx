import { useEffect, useState } from "react";
import { Loader2, Play, Square } from "lucide-react";
import api from "../../api/client";
import Layout from "../../components/Layout";

export default function HodSettingsPage() {
  const [criteria, setCriteria] = useState([]);
  const [config, setConfig] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPeriod, setNewPeriod] = useState({ academicYear: "2025-26", semester: 3, allowEditing: false });
  const [savingConfig, setSavingConfig] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([
      api.get("/admin/criteria"),
      api.get("/appraisal/config"),
      api.get("/admin/periods"),
    ]).then(([c, cfg, p]) => {
      setCriteria(c.data.data);
      setConfig(cfg.data.data);
      setPeriods(p.data.data);
      setLoading(false);
    });
  }
  useEffect(load, []);

  async function toggleCriterion(c) {
    await api.put(`/admin/criteria/${c.id}`, { isActive: c.is_active ? 0 : 1 });
    load();
  }

  async function saveConfig(e) {
    e.preventDefault();
    setSavingConfig(true);
    await api.put("/appraisal/config", {
      scaleMax: Number(config.scale_max),
      passThreshold: Number(config.pass_threshold),
      excellentThreshold: Number(config.excellent_threshold),
    });
    setSavingConfig(false);
  }

  async function openPeriod(e) {
    e.preventDefault();
    await api.post("/admin/periods/open", newPeriod);
    load();
  }

  async function closePeriod() {
    if (!window.confirm("Close feedback collection for the current period?")) return;
    await api.post("/admin/periods/close");
    load();
  }

  const activePeriod = periods.find((p) => p.is_open);

  if (loading) {
    return (
      <Layout title="Settings">
        <div className="flex items-center justify-center py-24 text-ink-400">
          <Loader2 className="animate-spin mr-2" size={18} /> Loading settings…
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Settings" subtitle="Configure evaluation criteria, appraisal formula and feedback periods">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-base text-ink-700 mb-1">Feedback Collection Period</h3>
          <p className="text-xs text-ink-400 mb-4">Start or stop the current semester's feedback window</p>

          {activePeriod ? (
            <div className="mb-4 bg-leaf/5 border border-leaf/20 rounded-lg px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-700 font-medium">Currently open</p>
                <p className="text-xs text-ink-400">{activePeriod.academic_year} · Semester {activePeriod.semester}</p>
              </div>
              <button onClick={closePeriod} className="btn-danger"><Square size={14} /> Close</button>
            </div>
          ) : (
            <p className="mb-4 text-sm text-ink-400">No feedback period is currently open.</p>
          )}

          <form onSubmit={openPeriod} className="space-y-3 pt-3 border-t border-ink-100">
            <p className="text-sm font-medium text-ink-600">Open a new period</p>
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Academic Year" value={newPeriod.academicYear} onChange={(e) => setNewPeriod({ ...newPeriod, academicYear: e.target.value })} />
              <input className="input" type="number" placeholder="Semester" value={newPeriod.semester} onChange={(e) => setNewPeriod({ ...newPeriod, semester: Number(e.target.value) })} />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-600">
              <input type="checkbox" checked={newPeriod.allowEditing} onChange={(e) => setNewPeriod({ ...newPeriod, allowEditing: e.target.checked })} />
              Allow students to edit submitted feedback
            </label>
            <button type="submit" className="btn-secondary"><Play size={14} /> Open Period</button>
          </form>
        </div>

        <div className="card p-6">
          <h3 className="text-base text-ink-700 mb-1">Appraisal Formula</h3>
          <p className="text-xs text-ink-400 mb-4">appraisalScore = (weighted average rating ÷ scale max) × 100</p>
          <form onSubmit={saveConfig} className="space-y-3">
            <div>
              <label className="label">Rating scale maximum</label>
              <input type="number" step="0.1" className="input" value={config.scale_max} onChange={(e) => setConfig({ ...config, scale_max: e.target.value })} />
            </div>
            <div>
              <label className="label">Satisfactory threshold (avg. rating)</label>
              <input type="number" step="0.1" className="input" value={config.pass_threshold} onChange={(e) => setConfig({ ...config, pass_threshold: e.target.value })} />
            </div>
            <div>
              <label className="label">Excellent threshold (avg. rating)</label>
              <input type="number" step="0.1" className="input" value={config.excellent_threshold} onChange={(e) => setConfig({ ...config, excellent_threshold: e.target.value })} />
            </div>
            <button type="submit" disabled={savingConfig} className="btn-primary">
              {savingConfig && <Loader2 size={16} className="animate-spin" />} Save Formula
            </button>
          </form>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="text-base text-ink-700 mb-1">Evaluation Criteria</h3>
          <p className="text-xs text-ink-400 mb-4">Toggle which criteria appear on the student feedback form</p>
          <div className="divide-y divide-ink-100">
            {criteria.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <span className="text-sm text-ink-600">{c.name}</span>
                <button
                  onClick={() => toggleCriterion(c)}
                  className={`badge cursor-pointer ${c.is_active ? "bg-leaf/10 text-leaf" : "bg-ink-100 text-ink-400"}`}
                >
                  {c.is_active ? "Active" : "Disabled"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
