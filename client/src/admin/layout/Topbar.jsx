import { Menu, LogOut } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function Topbar({ onOpenMobileNav }) {
  const { admin, logout } = useAdminAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      <button
        onClick={onOpenMobileNav}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
      >
        <Menu size={18} />
      </button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-3">

        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {admin?.name || admin?.email}
          </p>
          <p className="text-xs capitalize text-slate-500 dark:text-slate-400">{admin?.role}</p>
        </div>

        <button
          onClick={logout}
          aria-label="Logout"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}