import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { User, LogOut, ChevronDown, Mail, ArrowLeft, Pencil, Check, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ProfileMenu() {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("menu"); // "menu" | "profile" | "edit"
  const containerRef = useRef(null);

  // edit-profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

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

  function openEdit() {
    setFirstName(user.firstName || user.name?.split(" ")[0] || "");
    setLastName(user.lastName || user.name?.split(" ").slice(1).join(" ") || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setEditError("");
    setEditSuccess("");
    setView("edit");
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");

    const wantsPasswordChange = currentPassword || newPassword || confirmNewPassword;

    if (wantsPasswordChange) {
      if (!currentPassword) {
        setEditError("Enter your current password to set a new one");
        return;
      }
      if (newPassword.length < 8) {
        setEditError("New password must be at least 8 characters");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setEditError("New passwords do not match");
        return;
      }
    }

    setSaving(true);
    try {
      await updateProfile({ firstName, lastName });

      if (wantsPasswordChange) {
        await changePassword({ currentPassword, newPassword });
      }

      setEditSuccess("Profile updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => setView("profile"), 900);
    } catch (err) {
      setEditError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
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

  const firstNameDisplay =
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
          {firstNameDisplay.charAt(0).toUpperCase()}
        </span>
        <span>Hello, {firstNameDisplay}!</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          >
            {view === "menu" && (
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
            )}

            {view === "profile" && (
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    onClick={() => setView("menu")}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
                  >
                    <ArrowLeft size={13} />
                    Back
                  </button>
                  <button
                    onClick={openEdit}
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 text-xl font-bold text-white">
                    {firstNameDisplay.charAt(0).toUpperCase()}
                  </span>
                  <p className="text-sm font-semibold text-slate-900">{user.name || firstNameDisplay}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail size={12} />
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            {view === "edit" && (
              <div className="p-4">
                <button
                  onClick={() => setView("profile")}
                  className="mb-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  <ArrowLeft size={13} />
                  Back
                </button>

                <form onSubmit={handleSaveEdit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                    />
                  </div>

                  <div className="pt-1">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Change password (optional)
                    </p>
                    <div className="space-y-2">
                      <input
                        type="password"
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                      />
                    </div>
                  </div>

                  {editError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {editError}
                    </div>
                  )}
                  {editSuccess && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                      <Check size={13} />
                      {editSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#312e81] via-[#7c3aed] to-[#0e7490] text-xs font-semibold text-white shadow disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}