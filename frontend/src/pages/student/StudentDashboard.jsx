import { useEffect, useState } from "react";
import { CheckCircle2, Circle, ClipboardCheck, Loader2 } from "lucide-react";
import api from "../../api/client";
import Layout from "../../components/Layout";
import EmptyState from "../../components/EmptyState";
import FeedbackForm from "./FeedbackForm";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(null);
  const [activeTarget, setActiveTarget] = useState(null);

  async function load() {
    setLoading(true);
    const [targetsRes, statusRes] = await Promise.all([
      api.get("/feedback/targets"),
      api.get("/feedback/status"),
    ]);
    setData(targetsRes.data.data);
    setStatus(statusRes.data.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <Layout title="Give Feedback">
        <div className="flex items-center justify-center py-24 text-ink-400">
          <Loader2 className="animate-spin mr-2" size={18} /> Loading your subjects…
        </div>
      </Layout>
    );
  }

  if (activeTarget) {
    return (
      <FeedbackForm
        target={activeTarget}
        allowEditing={data.allowEditing}
        onDone={() => {
          setActiveTarget(null);
          load();
        }}
        onCancel={() => setActiveTarget(null)}
      />
    );
  }

  return (
    <Layout
      title="Give Feedback"
      subtitle={data.periodOpen ? `Feedback collection is open for ${data.period.academic_year}, Semester ${data.period.semester}` : undefined}
    >
      {!data.periodOpen ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Feedback collection is currently closed"
          description="Your department has not opened a feedback window for this semester yet. Please check back later."
        />
      ) : (
        <>
          <div className="card p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-ink-600">Your completion progress</p>
              <p className="text-sm text-ink-400">{status.completed} of {status.totalSubjects} completed</p>
            </div>
            <div className="h-2.5 rounded-full bg-ink-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gold-500 transition-all duration-500"
                style={{ width: `${status.percentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {data.targets.map((t) => (
              <div key={`${t.faculty_id}-${t.subject_id}`} className="card p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {t.submitted ? (
                    <CheckCircle2 size={20} className="text-leaf shrink-0" />
                  ) : (
                    <Circle size={20} className="text-ink-200 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-700 truncate">{t.subject_name}</p>
                    <p className="text-xs text-ink-400 truncate">{t.faculty_name} · {t.designation}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTarget(t)}
                  disabled={t.submitted && !data.allowEditing}
                  className={t.submitted ? "btn-secondary shrink-0" : "btn-primary shrink-0"}
                >
                  {t.submitted ? (data.allowEditing ? "Edit" : "Submitted") : "Give Feedback"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}
