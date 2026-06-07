export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-ink-500">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
      )}
    </div>
  );
}
