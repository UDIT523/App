import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "../../utils/cn";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      const id = ++idCounter;
      const entry = { id, type: "info", duration: 4000, ...toast };
      setToasts((prev) => [...prev, entry]);
      if (entry.duration) {
        setTimeout(() => dismiss(id), entry.duration);
      }
      return id;
    },
    [dismiss]
  );

  const toast = {
    show: push,
    success: (title, description) => push({ type: "success", title, description }),
    error: (title, description) =>
      push({ type: "error", title, description, duration: 6000 }),
    warning: (title, description) => push({ type: "warning", title, description }),
    info: (title, description) => push({ type: "info", title, description }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] || Info;
            const isError = t.type === "error" || t.type === "warning";
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-[var(--shadow-lift)]"
              >
                <Icon
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    isError ? "text-danger" : "text-ink-900"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{t.title}</p>
                  {t.description && (
                    <p className="mt-0.5 text-sm text-ink-500">{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 rounded-lg p-1 text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-900"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
