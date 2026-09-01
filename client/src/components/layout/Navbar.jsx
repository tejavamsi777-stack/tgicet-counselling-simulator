import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Mail,
  Pencil,
  Check,
  Loader2,
  GraduationCap,
  Target,
  ClipboardList,
  Sparkles,
  ArrowRight,
  Info,
  Star,
  Database,
} from "lucide-react";
import Logo from "./Logo";
import ProfileMenu from "./ProfileMenu";
import { ShareModal, ModernShareIcon } from "../shared/ShareModal";
import { ABOUT_TEXT } from "./Footer";
import { useAuth } from "../../context/AuthContext";
import ReviewModal from "../shared/ReviewModal";

const EXAM_MENU_ITEMS = [
  { slug: "ap-eapcet", name: "AP EAPCET", subtitle: "Engineering & Pharmacy", path: "/ap-eapcet", badge: "Live" },
  { slug: "tg-eapcet", name: "TG EAPCET", subtitle: "Engineering & Pharmacy", path: "/tg-eapcet", badge: "Live" },
  { slug: "tg-icet", name: "TG ICET", subtitle: "MBA & MCA Admissions", path: "/tg-icet", badge: "Live" },
  { slug: "tg-ecet", name: "TG ECET", subtitle: "Diploma Lateral Entry (B.Tech)", path: "/tg-ecet", badge: "Live" },
  { slug: "tg-polycet", name: "TG POLYCET", subtitle: "Polytechnic & Diploma", path: "/tg-polycet", badge: "Live" },
  { slug: "tg-pgecet", name: "TG PGECET", subtitle: "M.Tech, M.Pharm & Post-Grad", path: "/tg-pgecet", badge: "Live" },
];

const ALLOTMENT_MENU_ITEMS = [
  { name: "TG EAPCET Allotments", subtitle: "Engineering & Pharmacy Allotment Data", path: "/tg-eapcet/allotments" },
  { name: "AP EAPCET Allotments", subtitle: "Engineering & Pharmacy Allotment Data", path: "/ap-eapcet/allotments" },
  { name: "TG ICET Allotments", subtitle: "MBA & MCA Seat Allotment Data", path: "/tg-icet/allotments" },
  { name: "TG ECET Allotments", subtitle: "Diploma Lateral Entry Allotments", path: "/tg-ecet/allotments" },
  { name: "TG POLYCET Allotments", subtitle: "Polytechnic Seat Allotment Data", path: "/tg-polycet/allotments" },
  { name: "TG PGECET Allotments", subtitle: "Postgraduate M.Tech Allotments", path: "/tg-pgecet/allotments" },
];

const PREDICTOR_MENU_ITEMS = [
  { name: "AP EAPCET Predictor", subtitle: "Engineering & Pharmacy Cutoffs", path: "/ap-eapcet/predictor" },
  { name: "TG EAPCET Predictor", subtitle: "Engineering & Pharmacy Cutoffs", path: "/tg-eapcet/predictor" },
  { name: "TG ICET Predictor", subtitle: "MBA & MCA Cutoffs", path: "/tg-icet/predictor" },
  { name: "TG ECET Predictor", subtitle: "Lateral Entry 2nd Year Cutoffs", path: "/tg-ecet/predictor" },
  { name: "TG POLYCET Predictor", subtitle: "Polytechnic Diploma Cutoffs", path: "/tg-polycet/predictor" },
  { name: "TG PGECET Predictor", subtitle: "Postgraduate M.Tech Cutoffs", path: "/tg-pgecet/predictor" },
];

const COUNSELLING_MENU_ITEMS = [
  { name: "AP EAPCET Web Options", subtitle: "Branch & College Priority Simulator", path: "/ap-eapcet/mock-counselling" },
  { name: "TG EAPCET Web Options", subtitle: "Branch & College Priority Simulator", path: "/tg-eapcet/mock-counselling" },
  { name: "TG ICET Web Options", subtitle: "MBA & MCA Priority Simulator", path: "/tg-icet/mock-counselling" },
  { name: "TG ECET Web Options", subtitle: "Diploma Lateral Entry Simulator", path: "/tg-ecet/mock-counselling" },
  { name: "TG POLYCET Web Options", subtitle: "Polytechnic Preference Simulator", path: "/tg-polycet/mock-counselling" },
  { name: "TG PGECET Web Options", subtitle: "Postgraduate Branch Simulator", path: "/tg-pgecet/mock-counselling" },
];

export default function Navbar() {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const currentExamSlug = useMemo(() => {
    const p = (location.pathname || '').toLowerCase();
    if (p.includes('ap-eapcet')) return 'ap-eapcet';
    if (p.includes('tg-eapcet') || p.includes('/eapcet')) return 'tg-eapcet';
    if (p.includes('tg-icet') || p.includes('/icet')) return 'tg-icet';
    if (p.includes('tg-ecet') || p.includes('/ecet')) return 'tg-ecet';
    if (p.includes('tg-polycet') || p.includes('/polycet')) return 'tg-polycet';
    if (p.includes('tg-pgecet') || p.includes('/pgecet')) return 'tg-pgecet';
    return 'general';
  }, [location.pathname]);
  const navRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleMenuHover(menuKey) {
    setHovered(menuKey);
    setActiveDropdown(menuKey);
  }

  function handleNavLeave() {
    setHovered(null);
    setActiveDropdown(null);
  }

  return (
    <header className="sticky top-3 z-50 px-3 sm:px-6">
      {/* Ultra-Transparent Liquid Glass Floating Capsule */}
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between rounded-full border border-white/25 bg-white/[0.03] px-4 sm:px-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.3)] backdrop-blur-3xl backdrop-saturate-200 text-white transition-all duration-300">
        
        {/* Mobile Left Spacer to perfectly center the logo on mobile */}
        <div className="flex w-9 md:hidden items-center justify-start" aria-hidden="true" />

        {/* Brand Logo - Centered on Mobile, Left-aligned on Desktop */}
        <div className="flex-1 md:flex-initial flex items-center justify-center md:justify-start">
          <Link to="/" className="flex items-center group py-1" title="VuelaLearn">
            <img
              src="/vuela-logo-white.png"
              alt="VUELA"
              className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav
          ref={navRef}
          className="hidden items-center gap-1 text-sm font-medium text-white/90 md:flex"
          onMouseLeave={handleNavLeave}
        >
          {/* 1. Exams Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => handleMenuHover("exams")}
              onClick={() => setActiveDropdown(activeDropdown === "exams" ? null : "exams")}
              className="relative flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-colors hover:text-white"
            >
              {hovered === "exams" && (
                <motion.div
                  layoutId="nav-hover-pill"
                  className="absolute inset-0 rounded-full border border-white/25 bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)] backdrop-blur-md"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                Exams
                <ChevronDown size={13} className={`transition-transform duration-200 ${activeDropdown === "exams" ? "rotate-180 text-purple-300" : "text-gray-400"}`} />
              </span>
            </button>

            <AnimatePresence>
              {activeDropdown === "exams" && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-full z-50 mt-2 w-72 rounded-3xl border border-white/20 bg-[#120d1f]/95 p-3 text-left shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-2xl text-white"
                >
                  <div className="mb-2 px-3 pt-1 text-[11px] font-semibold uppercase tracking-wider text-purple-300">
                    Telangana & AP Entrance Exams
                  </div>
                  <div className="space-y-1">
                    {EXAM_MENU_ITEMS.map((item) => (
                      <Link
                        key={item.slug}
                        to={item.path}
                        onClick={() => setActiveDropdown(null)}
                        className="group flex items-center justify-between rounded-2xl px-3 py-2 transition hover:bg-white/10"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {item.subtitle}
                          </div>
                        </div>
                        <span className="rounded-full border border-purple-500/30 bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                          {item.badge}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2 border-t border-white/10 pt-2 px-1">
                    <Link
                      to="/#exam-selection-heading"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center justify-between rounded-xl px-2 py-1.5 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition"
                    >
                      <span>Explore All Exams</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. College Predictor Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => handleMenuHover("predictors")}
              onClick={() => setActiveDropdown(activeDropdown === "predictors" ? null : "predictors")}
              className="relative flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-colors hover:text-white"
            >
              {hovered === "predictors" && (
                <motion.div
                  layoutId="nav-hover-pill"
                  className="absolute inset-0 rounded-full border border-white/25 bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)] backdrop-blur-md"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                College Predictor
                <ChevronDown size={13} className={`transition-transform duration-200 ${activeDropdown === "predictors" ? "rotate-180 text-purple-300" : "text-gray-400"}`} />
              </span>
            </button>

            <AnimatePresence>
              {activeDropdown === "predictors" && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-full z-50 mt-2 w-80 rounded-3xl border border-white/20 bg-[#120d1f]/95 p-3 text-left shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-2xl text-white"
                >
                  <div className="mb-2 px-3 pt-1 text-[11px] font-semibold uppercase tracking-wider text-purple-300">
                    College Predictors by Rank
                  </div>
                  <div className="space-y-1">
                    {PREDICTOR_MENU_ITEMS.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setActiveDropdown(null)}
                        className="group flex items-start gap-2.5 rounded-2xl px-3 py-2 transition hover:bg-white/10"
                      >
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
                          <Target size={13} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {item.subtitle}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Seat Allotments Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => handleMenuHover("allotments")}
              onClick={() => setActiveDropdown(activeDropdown === "allotments" ? null : "allotments")}
              className="relative flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-colors hover:text-white"
            >
              {hovered === "allotments" && (
                <motion.div
                  layoutId="nav-hover-pill"
                  className="absolute inset-0 rounded-full border border-white/25 bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)] backdrop-blur-md"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                Seat Allotment
                <ChevronDown size={13} className={`transition-transform duration-200 ${activeDropdown === "allotments" ? "rotate-180 text-cyan-300" : "text-gray-400"}`} />
              </span>
            </button>

            <AnimatePresence>
              {activeDropdown === "allotments" && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-full z-50 mt-2 w-80 rounded-3xl border border-white/20 bg-[#120d1f]/95 p-3 text-left shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-2xl text-white"
                >
                  <div className="mb-2 px-3 pt-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                    Exam-Wise Seat Allotment Data
                  </div>
                  <div className="space-y-1">
                    {ALLOTMENT_MENU_ITEMS.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setActiveDropdown(null)}
                        className="group flex items-start gap-2.5 rounded-2xl px-3 py-2 transition hover:bg-white/10"
                      >
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
                          <Database size={13} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {item.subtitle}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Mock Counselling / Web Options Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => handleMenuHover("counselling")}
              onClick={() => setActiveDropdown(activeDropdown === "counselling" ? null : "counselling")}
              className="relative flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-colors hover:text-white"
            >
              {hovered === "counselling" && (
                <motion.div
                  layoutId="nav-hover-pill"
                  className="absolute inset-0 rounded-full border border-white/25 bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)] backdrop-blur-md"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                Mock Counselling
                <ChevronDown size={13} className={`transition-transform duration-200 ${activeDropdown === "counselling" ? "rotate-180 text-purple-300" : "text-gray-400"}`} />
              </span>
            </button>

            <AnimatePresence>
              {activeDropdown === "counselling" && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-full z-50 mt-2 w-80 rounded-3xl border border-white/20 bg-[#120d1f]/95 p-3 text-left shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-2xl text-white"
                >
                  <div className="mb-2 px-3 pt-1 text-[11px] font-semibold uppercase tracking-wider text-purple-300">
                    Web Options Simulators
                  </div>
                  <div className="space-y-1">
                    {COUNSELLING_MENU_ITEMS.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setActiveDropdown(null)}
                        className="group flex items-start gap-2.5 rounded-2xl px-3 py-2 transition hover:bg-white/10"
                      >
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                          <ClipboardList size={13} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {item.subtitle}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. About Link */}
          <Link
            to="/about"
            onMouseEnter={() => setHovered("about")}
            className="relative flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-colors hover:text-white"
          >
            {hovered === "about" && (
              <motion.div
                layoutId="nav-hover-pill"
                className="absolute inset-0 rounded-full border border-white/25 bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)] backdrop-blur-md"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <span className="relative z-10">About</span>
          </Link>
        </nav>

        {/* User Profile, Rate Us & Mobile Toggle */}
        <div className="flex items-center gap-2">
          {/* Rate Us Button (Desktop & Tablet) */}
          <button
            type="button"
            onClick={() => setReviewOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Rate & Review VuelaLearn"
          >
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span>Rate Us</span>
          </button>

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
            className="mx-auto mt-3 max-w-6xl overflow-hidden rounded-3xl border border-white/20 bg-[#100b1d]/95 shadow-[0_16px_48px_0_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-3xl md:hidden"
          >
            <MobileMenuList
              onClose={() => setMobileOpen(false)}
              onOpenReview={() => setReviewOpen(true)}
              onOpenShare={() => setShareOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        examSlug={currentExamSlug}
      />

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </header>
  );
}

function MobileMenuList({ onClose, onOpenReview, onOpenShare }) {
  const { user, logout, updateProfile, changePassword, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [expandedSection, setExpandedSection] = useState(null);
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

  function toggleSection(sec) {
    setExpandedSection(expandedSection === sec ? null : sec);
  }

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
              Profile Settings
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
                      className="mt-3 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-black shadow hover:bg-white/90"
                    >
                      <Pencil size={12} />
                      Edit Profile
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
            openAuthModal("login");
          }}
          className="border-b border-white/10 px-6 py-3.5 text-left font-semibold text-purple-300 hover:bg-white/10"
        >
          Sign In / Create Account
        </button>
      )}

      {/* Accordion 1: Exams */}
      <div className="border-b border-white/10">
        <button
          onClick={() => toggleSection("exams")}
          className="flex w-full items-center justify-between px-6 py-3 text-left font-medium text-white hover:bg-white/10"
        >
          <span className="flex items-center gap-2.5">
            <GraduationCap size={16} className="text-purple-300" />
            Exams
          </span>
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${expandedSection === "exams" ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {expandedSection === "exams" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-1 bg-white/5 px-6 py-2.5"
            >
              {EXAM_MENU_ITEMS.map((item) => (
                <Link
                  key={item.slug}
                  to={item.path}
                  onClick={onClose}
                  className="block rounded-lg py-1.5 text-xs text-gray-300 hover:text-white"
                >
                  <span className="font-semibold text-white">{item.name}</span> — {item.subtitle}
                </Link>
              ))}
              <Link
                to="/#exam-selection-heading"
                onClick={onClose}
                className="mt-1 block py-1 text-xs font-semibold text-purple-300"
              >
                View all entrance exams →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Accordion 2: Predictor */}
      <div className="border-b border-white/10">
        <button
          onClick={() => toggleSection("predictors")}
          className="flex w-full items-center justify-between px-6 py-3 text-left font-medium text-white hover:bg-white/10"
        >
          <span className="flex items-center gap-2.5">
            <Target size={16} className="text-purple-300" />
            College Predictor
          </span>
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${expandedSection === "predictors" ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {expandedSection === "predictors" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-1 bg-white/5 px-6 py-2.5"
            >
              {PREDICTOR_MENU_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className="block rounded-lg py-1.5 text-xs text-gray-300 hover:text-white"
                >
                  <span className="font-semibold text-white">{item.name}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Accordion: Seat Allotment */}
      <div className="border-b border-white/10">
        <button
          onClick={() => toggleSection("allotments")}
          className="flex w-full items-center justify-between px-6 py-3 text-left font-medium text-white hover:bg-white/10"
        >
          <span className="flex items-center gap-2.5">
            <Database size={16} className="text-cyan-300" />
            Seat Allotment
          </span>
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${expandedSection === "allotments" ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {expandedSection === "allotments" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-1 bg-white/5 px-6 py-2.5"
            >
              {ALLOTMENT_MENU_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className="block rounded-lg py-1.5 text-xs text-gray-300 hover:text-white"
                >
                  <span className="font-semibold text-white">{item.name}</span> — {item.subtitle}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Accordion 3: Mock Counselling */}
      <div className="border-b border-white/10">
        <button
          onClick={() => toggleSection("counselling")}
          className="flex w-full items-center justify-between px-6 py-3 text-left font-medium text-white hover:bg-white/10"
        >
          <span className="flex items-center gap-2.5">
            <ClipboardList size={16} className="text-indigo-300" />
            Mock Counselling
          </span>
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${expandedSection === "counselling" ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {expandedSection === "counselling" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-1 bg-white/5 px-6 py-2.5"
            >
              {COUNSELLING_MENU_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className="block rounded-lg py-1.5 text-xs text-gray-300 hover:text-white"
                >
                  <span className="font-semibold text-white">{item.name}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Item 4: About Us */}
      <div className="border-b border-white/10">
        <Link
          to="/about"
          onClick={onClose}
          className="flex w-full items-center justify-between px-6 py-3 text-left font-medium text-white hover:bg-white/10"
        >
          <span className="flex items-center gap-2.5">
            <Info size={16} className="text-purple-400" />
            About Us
          </span>
          <ChevronRight size={14} className="text-gray-400" />
        </Link>
      </div>

      {/* Rate & Review Button */}
      <div className="border-b border-white/10 px-4 py-2">
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onOpenReview) onOpenReview();
          }}
          className="flex w-full items-center justify-between rounded-2xl bg-amber-500/10 border border-amber-500/25 px-4 py-3 text-xs font-bold text-amber-300 hover:bg-amber-500/20 active:scale-95 transition cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <Star size={15} className="fill-amber-400 text-amber-400" />
            <span>Rate & Review Vuela Learn</span>
          </span>
          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-200">
            Feedback
          </span>
        </button>
      </div>

      {/* Share Portal Button */}
      <div className="border-b border-white/10 px-4 py-2">
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onOpenShare) onOpenShare();
          }}
          className="flex w-full items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          <ModernShareIcon size={16} />
          <span>Share Vuela Learn Portal</span>
        </button>
      </div>

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
