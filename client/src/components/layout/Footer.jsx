import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo";

export const ABOUT_TEXT =
  "TG ICET Counselling gives TG ICET candidates two tools in one place. The College Predictor estimates which colleges you're likely eligible for, based on official previous-year cutoff ranks — enter your rank, category, gender, and course to instantly see matching colleges, categorized by admission chance. The Mock Counselling Simulator lets you practice the real counselling process end-to-end, including web options entry and simulated seat allotment, so you're prepared before the actual counselling begins.";

export const PRIVACY_TEXT =
  "This website does not collect, store, or share any personal information. Your rank and preferences are used only within your browser to calculate predictions and are never sent to or saved on any server.";

export default function Footer({ openPanel, setOpenPanel }) {
  return (
    <footer className="mt-24 border-t border-slate-200/60 bg-white/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 text-center md:flex-row">

        <div className="flex items-center gap-3">
          <Logo size={34} />

          <div>
            <h3
              className="text-[17px] font-bold tracking-tight text-slate-900"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="bg-gradient-to-r from-[#312e81] via-[#7c3aed] to-[#0e7490] bg-clip-text text-transparent">
                TG
              </span>{" "}
              Counselling
            </h3>

            <p className="text-sm text-slate-500">
              Predict colleges using previous years' cutoff data.
            </p>
          </div>
        </div>

        <div className="flex gap-8 text-sm text-slate-500">
          <button
            onClick={() => setOpenPanel("about")}
            className="transition hover:text-blue-600"
          >
            About
          </button>

          <button
            onClick={() => setOpenPanel("privacy")}
            className="transition hover:text-blue-600"
          >
            Privacy
          </button>
        </div>
      </div>

      <div className="border-t border-slate-200/60 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} TG ICET Predictor
      </div>

      <AnimatePresence>
        {openPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[80] bg-white/40 backdrop-blur-sm"
              onClick={() => setOpenPanel(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-1/2 top-1/2 z-[90] w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-lg font-semibold text-slate-900">
                  {openPanel === "about" ? "About" : "Privacy"}
                </h4>
                <button
                  onClick={() => setOpenPanel(null)}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                {openPanel === "about" ? ABOUT_TEXT : PRIVACY_TEXT}
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </footer>
  );
}
