import { useState, useRef, useEffect } from "react";
import { X, Mail, Shield, Info, HelpCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo";

export const ABOUT_TEXT =
  "TG Counselling is an independent educational platform designed to help students navigate Telangana entrance exams including TG ICET, TG EAPCET, TG ECET, and TG POLYCET. We provide data-driven College Predictors based on verified previous-year cutoff trends and interactive Mock Counselling Simulators for practicing web options entry and simulated seat allotments.";

export const PRIVACY_TEXT = (
  <div className="space-y-3 text-xs sm:text-sm text-gray-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
    <p>
      At <strong>TG Counselling</strong>, we respect your privacy and are committed to protecting your personal data.
    </p>
    <div>
      <h5 className="font-semibold text-white mb-1">1. Information Collection & Usage</h5>
      <p>
        Candidate ranks, exam preferences, and simulated web options are processed locally or securely associated with your user account to provide personalized cutoff estimations and mock counselling practice. We do not sell or rent your personal data to third parties.
      </p>
    </div>
    <div>
      <h5 className="font-semibold text-white mb-1">2. Google AdSense & Third-Party Cookies</h5>
      <p>
        Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to our site and/or other sites on the Internet.
      </p>
      <p className="mt-1">
        Users may opt out of personalized advertising by visiting{" "}
        <a
          href="https://www.google.com/settings/ads"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-300 underline hover:text-white"
        >
          Google Ads Settings
        </a>{" "}
        or through{" "}
        <a
          href="https://www.aboutads.info/choices/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-300 underline hover:text-white"
        >
          aboutads.info
        </a>.
      </p>
    </div>
    <div>
      <h5 className="font-semibold text-white mb-1">3. Analytics & Security</h5>
      <p>
        We use privacy-friendly analytics to monitor service health and performance. All data is transmitted securely over HTTPS with industry-standard encryption.
      </p>
    </div>
  </div>
);

export const CONTACT_TEXT = (
  <div className="space-y-3 text-xs sm:text-sm text-gray-300 leading-relaxed">
    <p>
      Have questions, suggestions, or found an issue with college data? We'd love to hear from you.
    </p>
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4 space-y-2">
      <div className="flex items-center gap-2.5 text-white font-semibold">
        <Mail size={16} className="text-purple-300" />
        <span>Email Support</span>
      </div>
      <p className="text-xs text-gray-400">
        For general queries, data corrections, and feedback:
      </p>
      <a
        href="mailto:support@tgcounselling.in"
        className="inline-block text-xs font-semibold text-purple-300 hover:text-white transition"
      >
        support@tgcounselling.in
      </a>
    </div>
    <p className="text-[11px] text-gray-400">
      We typically respond to student and educator inquiries within 24–48 hours.
    </p>
  </div>
);

export default function Footer({ openPanel, setOpenPanel }) {
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        if (openPanel) setOpenPanel(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [openPanel, setOpenPanel]);

  return (
    <footer className="relative mt-24 border-t border-white/10 bg-black/80 backdrop-blur-xl text-gray-300">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 text-center md:flex-row">
        <div className="flex items-center gap-3">
          <Logo size={34} />
          <div className="text-left">
            <h3 className="font-brand text-[17px] leading-none tracking-wide text-white inline-flex items-center gap-2">
              <span>TG</span>
              <span>Counselling</span>
            </h3>
            <p className="text-xs text-gray-400">
              Verified college predictor and web options simulator for Telangana entrance exams.
            </p>
          </div>
        </div>

        <div className="relative flex flex-wrap justify-center gap-6 sm:gap-8 text-sm text-gray-400">
          <div className="relative">
            <button
              onClick={() => setOpenPanel(openPanel === "about" ? null : "about")}
              className={`transition hover:text-white ${openPanel === "about" ? "text-white font-semibold" : ""}`}
            >
              About
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setOpenPanel(openPanel === "privacy" ? null : "privacy")}
              className={`transition hover:text-white ${openPanel === "privacy" ? "text-white font-semibold" : ""}`}
            >
              Privacy Policy
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setOpenPanel(openPanel === "contact" ? null : "contact")}
              className={`transition hover:text-white ${openPanel === "contact" ? "text-white font-semibold" : ""}`}
            >
              Contact Us
            </button>
          </div>

          <AnimatePresence>
            {openPanel && (
              <motion.div
                ref={panelRef}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-full mb-3 right-1/2 translate-x-1/2 md:translate-x-0 md:right-0 z-[90] w-[min(92vw,460px)] rounded-3xl border border-white/20 bg-[#120d1f]/98 p-5 sm:p-6 text-left shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-2xl text-white"
              >
                <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5">
                  <h4 className="text-base font-semibold text-white flex items-center gap-2">
                    {openPanel === "about" && <Info size={16} className="text-purple-300" />}
                    {openPanel === "privacy" && <Shield size={16} className="text-purple-300" />}
                    {openPanel === "contact" && <HelpCircle size={16} className="text-purple-300" />}
                    <span>
                      {openPanel === "about" && "About TG Counselling"}
                      {openPanel === "privacy" && "Privacy & Cookie Policy"}
                      {openPanel === "contact" && "Contact & Support"}
                    </span>
                  </h4>
                  <button
                    onClick={() => setOpenPanel(null)}
                    aria-label="Close"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white"
                  >
                    <X size={15} />
                  </button>
                </div>

                {openPanel === "about" && (
                  <p className="text-xs sm:text-sm leading-relaxed text-gray-300">
                    {ABOUT_TEXT}
                  </p>
                )}
                {openPanel === "privacy" && PRIVACY_TEXT}
                {openPanel === "contact" && CONTACT_TEXT}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} TG Counselling Simulator · Educational Guidance Platform
      </div>
    </footer>
  );
}
