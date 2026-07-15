import { Menu, LogOut } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext"; // Ensure path to context is correct[cite: 19]

export default function Topbar({ onOpenMobileNav }) {
  const { admin, logout } = useAdminAuth(); //[cite: 19]

  return (
    <header className="sticky top-4 z-40 mx-6 my-4 flex h-16 items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 shadow-xl backdrop-blur-xl transition-all dark:border-slate-800/40 dark:bg-slate-950/20[cite: 19]">
      <button
        onClick={onOpenMobileNav}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-slate-300 transition-all hover:bg-white/10 hover:text-white md:hidden[cite: 19]"
      >
        <Menu size={18} />
      </button>

      <div className="hidden md:block[cite: 19]" />

      <div className="flex items-center gap-4[cite: 19]">
        {/* User Card inside Topbar[cite: 19] */}
        <div className="hidden text-right sm:block[cite: 19]">
          <p className="text-sm font-semibold tracking-tight text-white">
            {admin?.name || admin?.email}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {admin?.role}
          </p>
        </div>

        {/* Premium Profile Badge Glow[cite: 19] */}
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent shadow-inner[cite: 19]">
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[#070913][cite: 19]" />
          <span className="text-sm font-bold text-white">
            {(admin?.name || admin?.email || "A").charAt(0).toUpperCase()}
          </span>
        </div>

        <span className="h-6 w-px bg-white/10[cite: 19]" />

        {/* Power Off Logout Action[cite: 19] */}
        <button
          onClick={logout}
          aria-label="Logout"
          className="group flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/10 bg-red-500/5 text-red-400 transition-all duration-300 hover:scale-105 hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-300[cite: 19]"
        >
          <LogOut size={16} className="transition-transform group-hover:rotate-12[cite: 19]" />
        </button>
      </div>
    </header>
  );
}