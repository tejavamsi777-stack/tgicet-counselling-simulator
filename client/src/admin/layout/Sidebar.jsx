import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, Building2, BookOpen, MapPin, Tags,
  FileSpreadsheet, Settings, ShieldCheck, X,
} from "lucide-react";
import { cn } from "../../utils/cn"; // Keeps original relative path[cite: 18]

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/colleges", label: "Colleges", icon: Building2 },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/districts", label: "Districts", icon: MapPin },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/import", label: "Excel Import", icon: FileSpreadsheet },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function NavItems({ onNavigate }) {
  return (
    <nav className="flex-1 space-y-1.5 px-4 py-6">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3.5 rounded-xl px-4 py-3 text-[14px] font-medium transition-all duration-300 relative overflow-hidden",
                isActive
                  ? "bg-brand-500/10 text-white border border-brand-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                  : "text-slate-400 border border-transparent hover:bg-white/[0.04] hover:text-white"
              )
            }
          >
            {/* Liquid highlight line on active items */}
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r-md bg-brand-400" />
                )}
                <Icon size={18} className="transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-blue-500 text-white shadow-lg shadow-brand-500/20">
        <ShieldCheck size={20} />
      </div>
      <span className="text-md font-bold tracking-tight text-white">
        Admin Panel
      </span>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/[0.06] bg-slate-950/40 backdrop-blur-2xl md:flex">
        <Brand />
        <NavItems />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md md:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-slate-950/80 backdrop-blur-2xl md:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-5">
                <span className="text-md font-bold tracking-tight text-white">
                  Admin Panel
                </span>
                <button
                  onClick={onCloseMobile}
                  aria-label="Close menu"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>
              <NavItems onNavigate={onCloseMobile} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}