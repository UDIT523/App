import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

const SIZES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className={cn(
              "relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-[var(--shadow-lift)] sm:rounded-3xl",
              SIZES[size]
            )}
          >
            {(title || onClose) && (
              <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5">
                <div className="min-w-0">
                  {title && (
                    <h2 className="text-lg font-semibold tracking-tight text-ink-900">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-ink-500">{description}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="-mr-1.5 -mt-1.5 shrink-0 rounded-xl p-2 text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-900"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-ink-100 bg-ink-25 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
