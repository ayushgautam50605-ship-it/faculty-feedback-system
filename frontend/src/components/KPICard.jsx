export default function KPICard({ label, value, sublabel, tone = "default", icon: Icon }) {
  const toneClasses = {
    default: "text-ink-800",
    good: "text-leaf",
    warn: "text-gold-600",
    bad: "text-rust",
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-ink-400">{label}</p>
        {Icon && (
          <div className="h-8 w-8 rounded-lg bg-ink-50 flex items-center justify-center text-ink-500">
            <Icon size={16} />
          </div>
        )}
      </div>
      <p className={`mt-2 text-3xl font-serif ${toneClasses[tone]}`}>{value}</p>
      {sublabel && <p className="mt-1 text-xs text-ink-400">{sublabel}</p>}
    </div>
  );
}
