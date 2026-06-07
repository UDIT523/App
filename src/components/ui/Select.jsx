import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

const Select = forwardRef(function Select(
  { label, error, hint, className, id, required, children, ...props },
  ref
) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-ink-700">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border bg-white px-3.5 pr-10 text-sm text-ink-900",
            "transition-all duration-150 ease-[var(--ease-out-soft)]",
            "focus:outline-none focus:ring-2",
            "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400",
            error
              ? "border-danger focus:border-danger focus:ring-danger/20"
              : "border-ink-200 focus:border-ink-900 focus:ring-ink-900/10",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      </div>
      {error ? (
        <p className="text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
});

export default Select;
