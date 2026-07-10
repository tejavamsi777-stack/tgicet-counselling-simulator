import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { ABOUT_TEXT } from "./Footer";

export default function Navbar() {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/60 backdrop-blur-lg backdrop-saturate-150 will-change-transform">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <TrendingUp size={18} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            TG ICET Counselling
          </span>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#predict" className="transition-colors hover:text-slate-900">
            Predict
          </a>
          <a href="#results" className="transition-colors hover:text-slate-900">
            Results
          </a>

          <div className="relative">
            <button
              onClick={() => setShowAbout((v) => !v)}
              className="transition-colors hover:text-slate-900"
            >
              About
            </button>

            <AnimatePresence>
              {showAbout && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowAbout(false)}
                  />
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
                </>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>
    </header>
  );
}