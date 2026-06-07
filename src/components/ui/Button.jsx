import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

const VARIANTS = {
  primary:
    "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950 shadow-[var(--shadow-soft)]",
  secondary:
    "bg-white text-ink-900 border border-ink-200 hover:bg-ink-50 active:bg-ink-100",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200",
  danger:
    "bg-danger text-white hover:brightness-110 active:brightness-95 shadow-[var(--shadow-soft)]",
  dangerGhost:
    "bg-transparent text-danger border border-transparent hover:bg-danger-soft",
};

const SIZES = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  icon: "h-10 w-10 justify-center",
};

const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    className,
    children,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex select-none items-center justify-center rounded-xl font-semibold",
        "transition-all duration-150 ease-[var(--ease-out-soft)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "active:scale-[0.98]",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

export default Button;
