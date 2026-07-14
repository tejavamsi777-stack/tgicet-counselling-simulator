import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { User, LogOut, ChevronDown, Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("menu"); // "menu" | "profile"
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setView("menu");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setOpen(false);
    setView("menu");
  }

  if (!user) {
    return (
      <button
        onClick={() => navigate("/login")}
        className="rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.03] active:scale-[0.98]"
      >
        Sign In
      </button>
    );
  }

  const firstName =
  user.firstName ||
  user.name?.split(" ")[0] ||
  user.email.split("@")[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 py-1 pl-1 pr-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition-colors hover:bg-white"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 text-xs font-bold text-white">
          {firstName.charAt(0).toUpperCase()}
        </span>
        <span>Hello, {firstName}!</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          >
            {view === "menu" ? (
              <div className="p-2">
                <button
                  onClick={() => setView("profile")}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <User size={16} className="text-slate-400" />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="p-4">
                <button
                  onClick={() => setView("menu")}
                  className="mb-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  <ArrowLeft size={13} />
                  Back
                </button>
                <div className="flex flex-col items-center text-center">
                  <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 text-xl font-bold text-white">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                  <p className="text-sm font-semibold text-slate-900">{user.name || firstName}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail size={12} />
                    {user.email}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}