import { Boxes, Terminal } from "lucide-react";

/** Shown when Supabase env vars are missing — keeps the app from crashing. */
export default function SetupRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-25 p-6">
      <div className="w-full max-w-lg rounded-3xl border border-ink-100 bg-white p-8 shadow-[var(--shadow-soft)] animate-fade-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-white">
          <Boxes className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-bold tracking-tight text-ink-900">
          Connect your Supabase project
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          SparePro needs a Supabase backend. Create a project, then add your
          credentials to a <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">.env</code> file
          in the project root:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-ink-950 p-4 text-xs leading-relaxed text-ink-100">
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...`}
        </pre>
        <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-ink-50 p-3.5 text-sm text-ink-600">
          <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
          <span>
            Run the SQL in{" "}
            <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">
              supabase/migrations/0001_init.sql
            </code>{" "}
            in the Supabase SQL editor, then restart the dev server. See{" "}
            <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">README.md</code>.
          </span>
        </div>
      </div>
    </div>
  );
}
