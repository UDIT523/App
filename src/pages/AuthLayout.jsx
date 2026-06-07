import { Boxes } from "lucide-react";

/** Split monochrome layout shared by Login and Register. */
export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-ink-950 p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-ink-950">
            <Boxes className="h-6 w-6" />
          </div>
          <span className="text-lg font-bold tracking-tight">SparePro</span>
        </div>
        <div className="relative">
          <h1 className="max-w-md text-4xl font-bold leading-[1.1] tracking-tight">
            Precision inventory for every spare part.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-300">
            Track stock across machines, issue parts in seconds, and never miss a
            reorder. Built for the factory floor.
          </p>
        </div>
        <div className="relative flex gap-8 text-sm">
          <div>
            <p className="text-2xl font-bold tabular-nums">Realtime</p>
            <p className="text-ink-400">stock sync</p>
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">Role-based</p>
            <p className="text-ink-400">access control</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Compact brand for mobile (left panel is hidden below lg) */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-white">
              <Boxes className="h-5 w-5" />
            </div>
            <span className="text-base font-bold tracking-tight text-ink-900">
              SparePro
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
