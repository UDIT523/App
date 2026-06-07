import { cn } from "../../utils/cn";

/** Thin styled table primitives for consistent data tables. */

export function Table({ className, children, minWidth }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-ink-100 bg-white">
      <table
        className={cn("w-full border-collapse text-left text-sm", className)}
        style={minWidth ? { minWidth } : undefined}
      >
        {children}
      </table>
    </div>
  );
}

export function THead({ children }) {
  return (
    <thead className="border-b border-ink-100 bg-ink-25">
      <tr>{children}</tr>
    </thead>
  );
}

export function TH({ className, children, ...props }) {
  return (
    <th
      className={cn(
        "whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-ink-500",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TR({ className, children, ...props }) {
  return (
    <tr
      className={cn(
        "border-b border-ink-50 transition-colors last:border-0 hover:bg-ink-25",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TD({ className, children, ...props }) {
  return (
    <td className={cn("px-5 py-3.5 align-middle text-ink-800", className)} {...props}>
      {children}
    </td>
  );
}
