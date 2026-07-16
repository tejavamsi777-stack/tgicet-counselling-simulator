import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, User, LogOut, ChevronDown, Mail, Pencil, Check, Loader2 } from "lucide-react";
import { ABOUT_TEXT } from "./Footer";
import Logo from "./Logo";
import ProfileMenu from "./ProfileMenu";
import { useAuth } from "../../context/AuthContext";

const NAV_LINKS = [
  { key: "predict", to: "/predictor", label: "Predict" },
  { key: "results", href: "#results", label: "Results" },
  { key: "mock", to: "/mock-counselling", label: "Mock Counselling" },
];

export default function Navbar() {
  const [showAbout, setShowAbout] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/60 backdrop-blur-lg backdrop-saturate-150 will-change-transform">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo size={34} />
          <span
            className="text-[17px] font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="bg-gradient-to-r from-[#312e81] via-[#7c3aed] to-[#0e7490] bg-clip-text text-transparent">
              TG
            </span>{" "}
            <span className="text-slate-900">Counselling</span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 text-sm font-medium text-slate-600 md:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {NAV_LINKS.map((link) => {
            const content = (
              <span className="relative z-10 px-1">{link.label}</span>
            );
            const commonProps = {
              key: link.key,
              onMouseEnter: () => setHovered(link.key),
              className:
                "relative rounded-full px-4 py-2 transition-colors hover:text-slate-900",
            };
            return (
              <div key={link.key} className="relative">
                {hovered === link.key && (
                  <motion.div
                    layoutId="nav-hover-pill"
                    className="absolute inset-0 rounded-full bg-violet-100"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                {link.to ? (
                  <Link to={link.to} {...commonProps}>
                    {content}
                  </Link>
                ) : (
                  <a href={link.href} {...commonProps}>
                    {content}
                  </a>
                )}
              </div>
            );
          })}

          <div className="relative" onMouseLeave={() => setShowAbout(false)}>
            <button
              onMouseEnter={() => setHovered("about")}
              onClick={() => setShowAbout((v) => !v)}
              className="relative rounded-full px-4 py-2 transition-colors hover:text-slate-900"
            >
              {hovered === "about" && (
                <motion.div
                  layoutId="nav-hover-pill"
                  className="absolute inset-0 rounded-full bg-violet-100"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-10">About</span>
            </button>

            <AnimatePresence>
              {showAbout && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-full z-50 mt-3 w-80 rounded-2xl border border-white/60 bg-white/95 p-5 text-left shadow-xl backdrop-blur-2xl"
                >
                  <h4 className="mb-2 text-sm font-semibold text-slate-900">About</h4>
                  <p className="text-sm leading-relaxed text-slate-600">{ABOUT_TEXT}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ProfileMenu />
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/40 bg-white/95 backdrop-blur-xl md:hidden"
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

// Flat, non-overlapping mobile list — order: greeting, Profile (expands
// inline instead of floating over the links below it), nav links, About,
// Logout at the very end.
function MobileMenuList({ onClose, mobileAboutOpen, setMobileAboutOpen }) {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileView, setProfileView] = useState("view"); // "view" | "edit"

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
    <div className="flex flex-col text-sm font-medium text-slate-700">
      {/* 1. Greeting */}
      {user && (
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 text-sm font-bold text-white">
            {firstNameDisplay.charAt(0).toUpperCase()}
          </span>
          <span className="text-base font-semibold text-slate-900">Hello, {firstNameDisplay}!</span>
        </div>
      )}

      {/* 2. Profile — expands inline, doesn't float over items below */}
      {user && (
        <div className="border-b border-slate-100">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-3 text-left hover:bg-violet-50"
          >
            <span className="flex items-center gap-3">
              <User size={16} className="text-slate-400" />
              Profile
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden bg-slate-50 px-6 py-4"
              >
                {profileView === "view" ? (
                  <div className="flex flex-col items-center text-center">
                    <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 text-lg font-bold text-white">
                      {firstNameDisplay.charAt(0).toUpperCase()}
                    </span>
                    <p className="text-sm font-semibold text-slate-900">{user.name || firstNameDisplay}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <Mail size={12} />
                      {user.email}
                    </p>
                    <button
                      onClick={openEdit}
                      className="mt-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-brand-600 shadow-sm hover:bg-brand-50"
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

                    <p className="pt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Change password (optional)
                    </p>
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

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setProfileView("view")}
                        className="h-9 flex-1 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#312e81] via-[#7c3aed] to-[#0e7490] text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {saving ? <Loader2 size={13} className="animate-spin" /> : null}
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
          className="border-b border-slate-100 px-6 py-3 text-left text-brand-600 hover:bg-violet-50"
        >
          Sign In
        </button>
      )}

      {/* 3. Nav links */}
      {NAV_LINKS.map((link) =>
        link.to ? (
          <Link
            key={link.key}
            to={link.to}
            onClick={onClose}
            className="border-b border-slate-100 px-6 py-3 hover:bg-violet-50 hover:text-slate-900"
          >
            {link.label}
          </Link>
        ) : (
          <a
            key={link.key}
            href={link.href}
            onClick={onClose}
            className="border-b border-slate-100 px-6 py-3 hover:bg-violet-50 hover:text-slate-900"
          >
            {link.label}
          </a>
        )
      )}

      {/* About */}
      <button
        onClick={() => setMobileAboutOpen((v) => !v)}
        className="flex items-center justify-between border-b border-slate-100 px-6 py-3 text-left hover:bg-violet-50 hover:text-slate-900"
      >
        About
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${mobileAboutOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {mobileAboutOpen && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-b border-slate-100 bg-slate-50 px-6 py-3 text-xs leading-relaxed text-slate-500"
          >
            {ABOUT_TEXT}
          </motion.p>
        )}
      </AnimatePresence>

      {/* 4. Logout — last item */}
      {user && (
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="flex items-center gap-3 px-6 py-3.5 text-left text-red-600 hover:bg-red-50"
        >
          <LogOut size={16} />
          Logout
        </button>
      )}
    </div>
  );
}
