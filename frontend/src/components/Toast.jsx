import { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const isError = toast.type === "error";

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-[fadeIn_0.2s_ease-out]">
      <div
        className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 shadow-lg max-w-sm ${
          isError ? "bg-rust/5 border-rust/20" : "bg-leaf/5 border-leaf/20"
        }`}
      >
        {isError ? (
          <XCircle size={20} className="text-rust shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 size={20} className="text-leaf shrink-0 mt-0.5" />
        )}
        <p className="text-sm text-ink-700">{toast.message}</p>
        <button onClick={onClose} className="ml-auto text-ink-300 hover:text-ink-500">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
