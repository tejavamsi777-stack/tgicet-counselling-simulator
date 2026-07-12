import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ABOUT_TEXT } from "./Footer";
import Logo from "./Logo";

const NAV_LINKS = [
  { key: "predict", to: "/predictor", label: "Predict" },
  { key: "results", href: "#results", label: "Results" },
  { key: "mock", to: "/mock-counselling", label: "Mock Counselling" },
];

export default function Navbar() {
  const [showAbout, setShowAbout] = useState(false);
  const [hovered, setHovered] = useState(null);

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
      </div>
    </header>
  );
}