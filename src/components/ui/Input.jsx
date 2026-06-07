import { forwardRef, useId } from "react";
import { cn } from "../../utils/cn";

const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, className, id, required, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-ink-700"
        >
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-xl border bg-white text-sm text-ink-900 placeholder:text-ink-400",
            "transition-all duration-150 ease-[var(--ease-out-soft)]",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400",
            Icon ? "pl-9 pr-3" : "px-3.5",
            error
              ? "border-danger focus:border-danger focus:ring-danger/20"
              : "border-ink-200 focus:border-ink-900 focus:ring-ink-900/10",
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;
