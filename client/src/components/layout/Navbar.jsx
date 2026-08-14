import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, User, LogOut, ChevronDown, Mail, Pencil, Check, Loader2 } from "lucide-react";
import { ABOUT_TEXT } from "./Footer";
import Logo from "./Logo";
import ProfileMenu from "./ProfileMenu";
import { useAuth } from "../../context/AuthContext";

const NAV_LINKS = [
  { key: "exams", to: "/#exam-selection-heading", label: "Exams" },
  { key: "predict", to: "/tg-icet/predictor", label: "TG ICET Predictor" },
  { key: "mock", to: "/tg-icet/mock-counselling", label: "Mock Counselling" },
];

export default function Navbar() {
  const [showAbout, setShowAbout] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  return (
    <header className="sticky top-3 z-50 px-3 sm:px-6">
      {/* Apple Ultra-Transparent Liquid Glass Floating Capsule */}
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-white/25 bg-white/[0.03] px-4 sm:px-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.3)] backdrop-blur-3xl backdrop-saturate-200 text-white transition-all duration-300">
        
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5">
          <Logo size={28} />
          <span
            className="font-brand text-[15px] leading-none tracking-wide text-white translate-y-[7px] inline-flex items-center gap-2"
          >
            <span>TG</span>
            <span>Counselling</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-1 text-sm font-medium text-white/90 md:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {NAV_LINKS.map((link) => {
            const content = (
              <span className="relative z-10 px-1">{link.label}</span>
            );
            return (
              <div key={link.key} className="relative">
                {hovered === link.key && (
                  <motion.div
                    layoutId="nav-hover-pill"
                    className="absolute inset-0 rounded-full border border-white/25 bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)] backdrop-blur-md"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <Link
                  to={link.to}
                  onMouseEnter={() => setHovered(link.key)}
                  className="relative block rounded-full px-4 py-1.5 transition-colors hover:text-white"
                >
                  {content}
                </Link>
              </div>
            );
          })}

          {/* About Menu Dropdown */}
          <div className="relative" onMouseLeave={() => setShowAbout(false)}>
            <button
              onMouseEnter={() => setHovered("about")}
              onClick={() => setShowAbout((v) => !v)}
              className="relative rounded-full px-4 py-1.5 transition-colors hover:text-white"
            >
              {hovered === "about" && (
                <motion.div
                  layoutId="nav-hover-pill"
                  className="absolute inset-0 rounded-full border border-white/25 bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)] backdrop-blur-md"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-10">About</span>
            </button>

            <AnimatePresence>
              {showAbout && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-full z-50 mt-3 w-80 rounded-3xl border border-white/20 bg-black/40 p-5 text-left shadow-[0_16px_48px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.25)] backdrop-blur-3xl text-white"
                >
                  <h4 className="mb-2 text-sm font-semibold text-white">About</h4>
                  <p className="text-xs leading-relaxed text-gray-200">{ABOUT_TEXT}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* User Profile & Mobile Toggle */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ProfileMenu />
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Ultra-Transparent Liquid Glass Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-3 max-w-6xl overflow-hidden rounded-3xl border border-white/20 bg-black/50 shadow-[0_16px_48px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.25)] backdrop-blur-3xl md:hidden"
          >
            <MobileMenuList
              onClose={() => setMobileOpen(false)}
              mobileAboutOpen={mobileAboutOpen}
              setMobileAboutOpen={setMobileAboutOpen}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MobileMenuList({ onClose, mobileAboutOpen, setMobileAboutOpen }) {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileView, setProfileView] = useState("view");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  function openEdit() {
    setFirstName(user.firstName || user.name?.split(" ")[0] || "");
    setLastName(user.lastName || user.name?.split(" ").slice(1).join(" ") || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setEditError("");
    setEditSuccess("");
    setProfileView("edit");
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
      setTimeout(() => setProfileView("view"), 900);
    } catch (err) {
      setEditError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const firstNameDisplay =
    user?.firstName || user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "";

  return (
    <div className="flex flex-col text-sm font-medium text-gray-200">
      {user && (
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
          <div className="glass-button-wrap relative inline-flex">
            <div className="glass-button flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-gradient-to-br from-white/25 via-white/10 to-white/5 text-sm font-bold text-purple-300 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
              {firstNameDisplay.charAt(0).toUpperCase()}
            </div>
            <div className="glass-button-shadow rounded-full"></div>
          </div>
          <span className="text-base font-semibold text-white">Hello, {firstNameDisplay}!</span>
        </div>
      )}

      {user && (
        <div className="border-b border-white/10">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-3 text-left hover:bg-white/10"
          >
            <span className="flex items-center gap-3 text-white">
              <User size={16} className="text-gray-400" />
              Profile
            </span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden bg-white/5 px-6 py-4"
              >
                {profileView === "view" ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="glass-button-wrap relative mb-2 inline-flex">
                      <div className="glass-button flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-gradient-to-br from-white/25 via-white/10 to-white/5 text-lg font-bold text-purple-300 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
                        {firstNameDisplay.charAt(0).toUpperCase()}
                      </div>
                      <div className="glass-button-shadow rounded-full"></div>
                    </div>
                    <p className="text-sm font-semibold text-white">{user.name || firstNameDisplay}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                      <Mail size={12} />
                      {user.email}
                    </p>
                    <button
                      onClick={openEdit}
                      className="mt-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black shadow hover:bg-white/90"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSaveEdit} className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-9 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-xs text-white outline-none focus:border-white/30"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-9 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-xs text-white outline-none focus:border-white/30"
                      />
                    </div>

                    <p className="pt-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Change password (optional)
                    </p>
                    <input
                      type="password"
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-9 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-xs text-white outline-none focus:border-white/30"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-9 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-xs text-white outline-none focus:border-white/30"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="h-9 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-xs text-white outline-none focus:border-white/30"
                    />

                    {editError && (
                      <div className="rounded-lg border border-red-500/30 bg-red-500/15 px-3 py-2 text-xs text-red-200">
                        {editError}
                      </div>
                    )}
                    {editSuccess && (
                      <div className="flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/15 px-3 py-2 text-xs text-green-200">
                        <Check size={13} />
                        {editSuccess}
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setProfileView("view")}
                        className="h-9 flex-1 rounded-lg border border-white/15 bg-white/5 text-xs font-medium text-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-white text-xs font-semibold text-black disabled:opacity-50"
                      >
                        {saving ? <Loader2 size={13} className="animate-spin text-black" /> : null}
                        {saving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {!user && (
        <button
          onClick={() => {
            onClose();
            navigate("/login");
          }}
          className="border-b border-white/10 px-6 py-3 text-left font-medium text-white hover:bg-white/10"
        >
          Sign In
        </button>
      )}

      {NAV_LINKS.map((link) => (
        <Link
          key={link.key}
          to={link.to}
          onClick={onClose}
          className="border-b border-white/10 px-6 py-3 hover:bg-white/10 hover:text-white"
        >
          {link.label}
        </Link>
      ))}

      <button
        onClick={() => setMobileAboutOpen((v) => !v)}
        className="flex items-center justify-between border-b border-white/10 px-6 py-3 text-left hover:bg-white/10 hover:text-white"
      >
        About
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${mobileAboutOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {mobileAboutOpen && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-b border-white/10 bg-white/5 px-6 py-3 text-xs leading-relaxed text-gray-300"
          >
            {ABOUT_TEXT}
          </motion.p>
        )}
      </AnimatePresence>

      {user && (
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="flex items-center gap-3 px-6 py-3.5 text-left text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={16} />
          Logout
        </button>
      )}
    </div>
  );
}
