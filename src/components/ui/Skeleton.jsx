import { cn } from "../../utils/cn";

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-ink-100 animate-shimmer",
        className
      )}
    />
  );
}

/** A skeleton placeholder shaped like a data table. */
export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
      <div className="flex gap-4 border-b border-ink-100 bg-ink-25 px-5 py-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-ink-50 px-5 py-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn("h-4 flex-1", c === 0 && "max-w-[40%]")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-9 w-32" />
      <Skeleton className="mt-3 h-3 w-20" />
    </div>
  );
}

export default Skeleton;
