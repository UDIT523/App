import { cn } from "../../utils/cn";
import { Skeleton } from "./Skeleton";

export default function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  loading = false,
  emphasis = false,
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 transition-all duration-200 hover:shadow-[var(--shadow-soft)]",
        emphasis
          ? "border-transparent bg-ink-900 text-white"
          : "border-ink-100 bg-white text-ink-900"
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-medium uppercase tracking-wide",
            emphasis ? "text-ink-300" : "text-ink-500"
          )}
        >
          {label}
        </span>
        {Icon && (
          <Icon
            className={cn(
              "h-4 w-4",
              emphasis ? "text-ink-300" : "text-ink-400"
            )}
          />
        )}
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-20" />
      ) : (
        <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">
          {value}
        </p>
      )}
      {hint && (
        <p
          className={cn(
            "mt-1 text-xs",
            emphasis ? "text-ink-400" : "text-ink-400"
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
