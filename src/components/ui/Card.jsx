import { cn } from "../../utils/cn";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-100 bg-white shadow-[var(--shadow-soft)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 border-b border-ink-100 px-6 py-5", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }) {
  return (
    <h3 className={cn("text-base font-semibold tracking-tight text-ink-900", className)}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export default Card;
