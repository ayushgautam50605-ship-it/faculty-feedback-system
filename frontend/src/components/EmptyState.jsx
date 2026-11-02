export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="h-12 w-12 rounded-full bg-ink-50 flex items-center justify-center text-ink-400 mb-4">
          <Icon size={22} />
        </div>
      )}
      <h3 className="text-lg text-ink-700">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-ink-400 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
