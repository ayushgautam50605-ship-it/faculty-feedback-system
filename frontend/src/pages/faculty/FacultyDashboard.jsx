import { useEffect, useState } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import { Award, MessageSquareText, Star, TrendingUp, Loader2, Info } from "lucide-react";
import api from "../../api/client";
import Layout from "../../components/Layout";
import KPICard from "../../components/KPICard";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../context/AuthContext";

const GRADE_TONE = {
  Excellent: "good",
  Satisfactory: "default",
  "Needs Improvement": "bad",
};

export default function FacultyDashboard({ facultyIdOverride }) {
  const { user } = useAuth();
  const facultyId = facultyIdOverride || user.profileId;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/faculty/${facultyId}/performance`).then((res) => {
      setData(res.data.data);
      setLoading(false);
    });
  }, [facultyId]);

  if (loading) {
    return (
      <Layout title="My Performance">
        <div className="flex items-center justify-center py-24 text-ink-400">
          <Loader2 className="animate-spin mr-2" size={18} /> Loading performance data…
        </div>
      </Layout>
    );
  }

  const { faculty, appraisal, trend, ratingDistribution, comments } = data;

  if (!appraisal || appraisal.totalResponses === 0) {
    return (
      <Layout title="My Performance" subtitle={`${faculty.name} · ${faculty.department}`}>
        <EmptyState
          icon={Info}
          title="No feedback received yet"
          description="Once students submit feedback for this semester, your performance summary, appraisal score and charts will appear here."
        />
      </Layout>
    );
  }

  const radarData = appraisal.criterionAverages.map((c) => ({ criterion: c.name.replace(/ /g, "\n"), rating: c.averageRating }));
  const distData = [1, 2, 3, 4, 5].map((n) => ({
    rating: `${n}`,
    count: ratingDistribution.find((r) => r.rating === n)?.c || 0,
  }));
  const trendData = trend.map((t) => ({ label: `${t.academic_year} S${t.semester}`, rating: t.average_rating }));

  return (
    <Layout title="My Performance" subtitle={`${faculty.name} · ${faculty.department} · ${faculty.designation}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Overall Rating" value={`${appraisal.weightedAverageRating} / ${appraisal.scaleMax}`} icon={Star} />
        <KPICard
          label="Appraisal Score"
          value={`${appraisal.appraisalScore}%`}
          sublabel={appraisal.grade}
          tone={GRADE_TONE[appraisal.grade]}
          icon={Award}
        />
        <KPICard label="Responses" value={appraisal.totalResponses} icon={MessageSquareText} />
        <KPICard
          label="Semester"
          value={`Sem ${appraisal.semester}`}
          sublabel={appraisal.academicYear}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h3 className="text-base text-ink-700 mb-1">Criterion-wise Performance</h3>
          <p className="text-xs text-ink-400 mb-4">Average rating (1–5) across each evaluation criterion</p>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid stroke="#D9E0EC" />
              <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 10, fill: "#4C6291" }} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9, fill: "#7E92B8" }} />
              <Radar dataKey="rating" stroke="#C08A28" fill="#C08A28" fillOpacity={0.35} strokeWidth={2} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="text-base text-ink-700 mb-1">Semester Performance Trend</h3>
          <p className="text-xs text-ink-400 mb-4">Average rating across academic terms</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} margin={{ left: -10 }}>
              <CartesianGrid stroke="#EEF1F7" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#4C6291" }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#4C6291" }} />
              <Tooltip />
              <Line type="monotone" dataKey="rating" stroke="#2F4373" strokeWidth={2.5} dot={{ r: 4, fill: "#2F4373" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h3 className="text-base text-ink-700 mb-1">Rating Distribution</h3>
          <p className="text-xs text-ink-400 mb-4">How many individual ratings fell at each score, this semester</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={distData} margin={{ left: -10 }}>
              <CartesianGrid stroke="#EEF1F7" vertical={false} />
              <XAxis dataKey="rating" tick={{ fontSize: 11, fill: "#4C6291" }} />
              <YAxis tick={{ fontSize: 11, fill: "#4C6291" }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {distData.map((d, i) => (
                  <Cell key={i} fill={["#B4483B", "#C08A28", "#DDB165", "#3F7D5C", "#2F4373"][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="text-base text-ink-700 mb-1">How your score is calculated</h3>
          <p className="text-xs text-ink-400 mb-4">Transparent appraisal methodology</p>
          <ol className="space-y-3 text-sm text-ink-600">
            <li className="flex gap-2.5">
              <span className="shrink-0 h-5 w-5 rounded-full bg-ink-50 text-ink-500 text-xs flex items-center justify-center font-medium">1</span>
              Each criterion's average is the mean of all student ratings for that criterion.
            </li>
            <li className="flex gap-2.5">
              <span className="shrink-0 h-5 w-5 rounded-full bg-ink-50 text-ink-500 text-xs flex items-center justify-center font-medium">2</span>
              Criterion averages are combined into one weighted average rating (currently equal weights).
            </li>
            <li className="flex gap-2.5">
              <span className="shrink-0 h-5 w-5 rounded-full bg-ink-50 text-ink-500 text-xs flex items-center justify-center font-medium">3</span>
              That average is scaled to a 0–100 appraisal score: (average ÷ {appraisal.scaleMax}) × 100.
            </li>
          </ol>
          <div className="mt-5 pt-4 border-t border-ink-100 flex items-center justify-between text-sm">
            <span className="text-ink-500">Satisfactory threshold</span>
            <span className="text-ink-700 font-medium">{appraisal.methodology.thresholds.satisfactory} / 5</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1.5">
            <span className="text-ink-500">Excellent threshold</span>
            <span className="text-ink-700 font-medium">{appraisal.methodology.thresholds.excellent} / 5</span>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-base text-ink-700 mb-1">Aggregated Student Comments</h3>
        <p className="text-xs text-ink-400 mb-4">Shown without any identifying information</p>
        {comments.length === 0 ? (
          <p className="text-sm text-ink-400 py-6 text-center">No written comments were submitted this semester.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {comments.map((c, i) => (
              <div key={i} className="bg-ink-50 rounded-lg px-4 py-3 text-sm text-ink-600">
                “{c}”
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
