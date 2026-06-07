import { cn } from "../../utils/cn";

const VARIANTS = {
  neutral: "bg-ink-100 text-ink-700",
  solid: "bg-ink-900 text-white",
  outline: "border border-ink-200 text-ink-600",
  danger: "bg-danger-soft text-danger",
  success: "bg-ink-900 text-white",
};

export default function Badge({ variant = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
