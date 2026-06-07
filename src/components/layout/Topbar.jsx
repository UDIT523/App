import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../ui/Toast";
import { initialsOf, roleLabel } from "../../utils/format";
import { cn } from "../../utils/cn";

export default function Topbar({ title, onMenu }) {
  const { profile, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/login");
  };

  const name = profile?.full_name || user?.username || "User";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-ink-100 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-xl p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold tracking-tight text-ink-900">
          {title}
        </h1>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-ink-100"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-white">
            {initialsOf(name) || "U"}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-sm font-semibold text-ink-900">
              {name}
            </span>
            <span className="block text-xs text-ink-400">
              {roleLabel(profile?.role)}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-ink-400 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-ink-100 bg-white p-1.5 shadow-[var(--shadow-lift)] animate-fade-in">
            <div className="border-b border-ink-50 px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-ink-900">{name}</p>
              <p className="truncate text-xs text-ink-400">
                @{user?.username} · {roleLabel(profile?.role)}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger-soft"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
