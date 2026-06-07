import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  PackageMinus,
   History,
  Users,
  X,
  Boxes,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/cn";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/issue", label: "Issue Part", icon: PackageMinus },
  { to: "/transactions", label: "Transactions", icon: History },
  { to: "/users", label: "Users", icon: Users, perm: "users:manage" },
];

function NavItems({ onNavigate }) {
  const { can } = useAuth();
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV.filter((i) => !i.perm || can(i.perm)).map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-ink-900 text-white shadow-[var(--shadow-soft)]"
                  : "text-ink-500 hover:bg-ink-100 hover:text-ink-900"
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-white">
        <Boxes className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold tracking-tight text-ink-900">SparePro</p>
        <p className="text-[11px] font-medium text-ink-400">Inventory Suite</p>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-ink-100 bg-white lg:flex lg:flex-col">
        <Brand />
        <NavItems />
        <div className="px-5 py-4">
          <p className="text-[11px] text-ink-300">v1.0 · Monochrome edition</p>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[80] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-[var(--shadow-lift)]"
            >
              <div className="flex items-center justify-between pr-3">
                <Brand />
                <button
                  onClick={onClose}
                  className="rounded-xl p-2 text-ink-400 hover:bg-ink-50 hover:text-ink-900"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavItems onNavigate={onClose} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
