import { Star } from "lucide-react";

const LABELS = { 1: "Poor", 2: "Below Average", 3: "Average", 4: "Good", 5: "Excellent" };

export default function RatingInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} - ${LABELS[n]}`}
          className="p-0.5 focus-visible:rounded"
        >
          <Star
            size={26}
            className={n <= value ? "fill-gold-500 text-gold-500" : "text-ink-200"}
            strokeWidth={1.5}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-ink-400 w-28">{value ? LABELS[value] : "Not rated"}</span>
    </div>
  );
}
