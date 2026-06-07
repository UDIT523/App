import { useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const TITLES = {
  "/": "Dashboard",
  "/inventory": "Inventory",
  "/issue": "Issue Part",
  "/transactions": "Transactions",
  "/users": "Users",
};

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const outlet = useOutlet();

  const title =
    TITLES[location.pathname] ||
    (location.pathname.startsWith("/inventory") ? "Inventory" : "SparePro");

  return (
    <div className="flex h-screen overflow-hidden bg-ink-25">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {outlet}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
