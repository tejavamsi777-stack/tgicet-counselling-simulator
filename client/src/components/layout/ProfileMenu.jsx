import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { User, LogOut, ChevronDown, Mail, ArrowLeft, Pencil, Check, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { GlassButton } from "../ui/glass-button";

export default function ProfileMenu() {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("menu");
  const containerRef = useRef(null);

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
      <GlassButton
        size="sm"
        onClick={() => navigate("/login")}
      >
        Sign In
      </GlassButton>
    );
  }

  const firstNameDisplay =
    user.firstName ||
    user.name?.split(" ")[0] ||
    user.email.split("@")[0];

  return (
    <div className="relative" ref={containerRef}>
      <GlassButton
        size="sm"
        onClick={() => setOpen((o) => !o)}
        contentClassName="flex items-center gap-2"
      >
        <span className="glass-button-wrap relative inline-flex">
          <span className="glass-button flex h-6 w-6 items-center justify-center rounded-full border border-white/30 bg-gradient-to-br from-white/25 via-white/10 to-white/5 text-[11px] font-bold text-purple-300 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
            {firstNameDisplay.charAt(0).toUpperCase()}
          </span>
          <span className="glass-button-shadow rounded-full"></span>
        </span>
        <span>Hello, {firstNameDisplay}!</span>
        <ChevronDown size={14} className={`text-white/80 transition-transform ${open ? "rotate-180" : ""}`} />
      </GlassButton>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-3xl border border-white/20 bg-[#0a0814]/85 p-3 text-white shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.25)] backdrop-blur-3xl"
          >
            {view === "menu" && (
              <div className="space-y-2 p-1">
                <GlassButton
                  size="sm"
                  className="w-full"
                  contentClassName="flex items-center gap-3 text-white font-semibold"
                  onClick={() => setView("profile")}
                >
                  <User size={16} className="text-purple-300" />
                  <span className="text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Profile</span>
                </GlassButton>

                <GlassButton
                  size="sm"
                  className="w-full"
                  contentClassName="flex items-center gap-3 text-red-200 font-semibold"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="text-red-400" />
                  <span className="text-red-300 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Logout</span>
                </GlassButton>
              </div>
            )}

            {view === "profile" && (
              <div className="p-3">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    onClick={() => setView("menu")}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white"
                  >
                    <ArrowLeft size={13} />
                    Back
                  </button>
                  <GlassButton
                    size="sm"
                    onClick={openEdit}
                    contentClassName="flex items-center gap-1.5 font-bold"
                  >
                    <Pencil size={11} />
                    Edit
                  </GlassButton>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="glass-button-wrap relative mb-2 inline-flex">
                    <div className="glass-button flex h-13 w-13 items-center justify-center rounded-full border border-white/30 bg-gradient-to-br from-white/25 via-white/10 to-white/5 text-lg font-bold text-purple-300 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
                      {firstNameDisplay.charAt(0).toUpperCase()}
                    </div>
                    <div className="glass-button-shadow rounded-full"></div>
                  </div>
                  <p className="text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{user.name || firstNameDisplay}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-300">
                    <Mail size={12} />
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            {view === "edit" && (
              <div className="p-3">
                <button
                  onClick={() => setView("profile")}
                  className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white"
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
                      className="h-9 w-full rounded-xl border border-white/20 bg-white/10 px-3 text-xs text-white placeholder-gray-400 outline-none focus:border-white/40"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-9 w-full rounded-xl border border-white/20 bg-white/10 px-3 text-xs text-white placeholder-gray-400 outline-none focus:border-white/40"
                    />
                  </div>

                  <div className="pt-1">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-300">
                      Change password (optional)
                    </p>
                    <div className="space-y-2">
                      <input
                        type="password"
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="h-9 w-full rounded-xl border border-white/20 bg-white/10 px-3 text-xs text-white placeholder-gray-400 outline-none focus:border-white/40"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-9 w-full rounded-xl border border-white/20 bg-white/10 px-3 text-xs text-white placeholder-gray-400 outline-none focus:border-white/40"
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="h-9 w-full rounded-xl border border-white/20 bg-white/10 px-3 text-xs text-white placeholder-gray-400 outline-none focus:border-white/40"
                      />
                    </div>
                  </div>

                  {editError && (
                    <div className="rounded-xl border border-red-500/40 bg-red-500/20 px-3 py-2 text-xs text-red-200">
                      {editError}
                    </div>
                  )}
                  {editSuccess && (
                    <div className="flex items-center gap-1.5 rounded-xl border border-green-500/40 bg-green-500/20 px-3 py-2 text-xs text-green-200">
                      <Check size={13} />
                      {editSuccess}
                    </div>
                  )}

                  <GlassButton
                    type="submit"
                    disabled={saving}
                    size="sm"
                    className="w-full"
                    contentClassName="flex items-center justify-center gap-1.5 text-xs font-bold"
                  >
                    {saving ? <Loader2 size={13} className="animate-spin text-white" /> : null}
                    <span>{saving ? "Saving…" : "Save changes"}</span>
                  </GlassButton>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}