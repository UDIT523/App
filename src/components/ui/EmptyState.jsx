import { Inbox } from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-50 text-ink-400">
        <Icon className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <h3 className="mt-5 text-base font-semibold text-ink-900">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-ink-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
