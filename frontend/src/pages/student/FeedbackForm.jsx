import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import api from "../../api/client";
import Layout from "../../components/Layout";
import RatingInput from "../../components/RatingInput";

export default function FeedbackForm({ target, onDone, onCancel }) {
  const [criteria, setCriteria] = useState([]);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/feedback/criteria").then((res) => {
      setCriteria(res.data.data);
      setLoading(false);
    });
  }, []);

  const allRated = criteria.length > 0 && criteria.every((c) => ratings[c.id]);

  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    try {
      await api.post("/feedback", {
        facultyId: target.faculty_id,
        subjectId: target.subject_id,
        ratings: criteria.map((c) => ({ criterionId: c.id, rating: ratings[c.id] })),
        comments: comments.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong while submitting your feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Layout title="Give Feedback">
        <div className="card flex flex-col items-center justify-center text-center py-20 px-6">
          <div className="h-14 w-14 rounded-full bg-leaf/10 flex items-center justify-center text-leaf mb-5">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="text-xl text-ink-800">Feedback submitted successfully</h2>
          <p className="mt-2 text-sm text-ink-400 max-w-sm">
            Thank you for contributing to academic improvement.
          </p>
          <button onClick={onDone} className="btn-primary mt-6">Back to my subjects</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={target.subject_name} subtitle={`Feedback for ${target.faculty_name} · ${target.designation}`}>
      <button onClick={onCancel} className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-600 mb-5">
        <ArrowLeft size={15} /> Back to my subjects
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-ink-400">
          <Loader2 className="animate-spin mr-2" size={18} /> Loading feedback form…
        </div>
      ) : (
        <div className="card p-6">
          <p className="text-sm text-ink-500 mb-6">
            Rate each criterion from 1 (Poor) to 5 (Excellent). Your responses are aggregated and never shown to faculty individually.
          </p>

          <div className="space-y-5 divide-y divide-ink-100">
            {criteria.map((c) => (
              <div key={c.id} className="pt-5 first:pt-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm font-medium text-ink-700">{c.name}</p>
                <RatingInput value={ratings[c.id] || 0} onChange={(v) => setRatings((r) => ({ ...r, [c.id]: v }))} />
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label className="label" htmlFor="comments">Additional comments (optional)</label>
            <textarea
              id="comments"
              className="input min-h-[100px] resize-y"
              placeholder="Share any specific feedback that could help this faculty member improve…"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              maxLength={1000}
            />
          </div>

          {error && (
            <p className="mt-4 text-sm text-rust bg-rust/5 border border-rust/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button onClick={handleSubmit} disabled={!allRated || submitting} className="btn-primary">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Submit Feedback
            </button>
            {!allRated && <p className="text-xs text-ink-400">Please rate every criterion to continue.</p>}
          </div>
        </div>
      )}
    </Layout>
  );
}
