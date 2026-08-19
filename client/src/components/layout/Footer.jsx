import { useState, useRef, useEffect } from "react";
import { X, Mail, Shield, Info, HelpCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo";
import { ShareButton } from "../shared/ShareModal";

export const ABOUT_TEXT =
  "TG Counselling is a 100% FREE educational guidance platform built to empower students navigating Telangana admissions (TG EAPCET, TG ICET, TG ECET, and TG POLYCET). We provide data-driven Rank Predictors, official college seat allotment data across all 178 institutions, interactive Web Options simulators, TS ePASS fee reimbursement calculators, and HLC certificate guides — 100% free with zero paywalls, subscriptions, or hidden charges.";

export const ABOUT_PANEL_CONTENT = (
  <div className="space-y-3.5 text-xs sm:text-sm text-gray-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-300">
        ✨ 100% Free Platform
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 text-[11px] font-extrabold text-purple-300">
        🏛️ 178 TG Institutions Data
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 text-[11px] font-extrabold text-cyan-300">
        ⚡ Zero Subscriptions
      </span>
    </div>

    <p>
      <strong className="text-white">TG Counselling Portal</strong> is a <span className="text-emerald-400 font-bold">100% free</span> independent educational platform created to help students across Telangana make informed, confident, and accurate higher education admission decisions.
    </p>

    <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-2 text-xs">
      <div className="font-bold text-white flex items-center gap-1.5 border-b border-white/10 pb-1.5">
        <span>What We Offer (100% Free for Every Student):</span>
      </div>
      <ul className="space-y-2 text-gray-300">
        <li className="flex items-start gap-2">
          <span className="text-purple-400 font-bold shrink-0">•</span>
          <span><strong className="text-white">College Predictor:</strong> Data-driven cutoff estimation based on rank, caste category, and quota reservation.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-purple-400 font-bold shrink-0">•</span>
          <span><strong className="text-white">Seat Allotment Explorer:</strong> Official candidate-level allotments across TG EAPCET, TG ICET, TG ECET, and TG POLYCET.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-purple-400 font-bold shrink-0">•</span>
          <span><strong className="text-white">Exercise Web Options:</strong> Realistic practice simulator to build, test, and reorder preference lists before official counselling.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-purple-400 font-bold shrink-0">•</span>
          <span><strong className="text-white">College Profiles &amp; Fees:</strong> Accredited branch lists, verified TAFRC fee structures, and placement CTCs for all 178 institutions.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-purple-400 font-bold shrink-0">•</span>
          <span><strong className="text-white">TS ePASS Calculator:</strong> Compute net student out-of-pocket tuition fees per official G.O. Ms. reimbursement rules.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-purple-400 font-bold shrink-0">•</span>
          <span><strong className="text-white">HLC Certificate Guides:</strong> Complete document verification checklists with MeeSeva validity rules and account sync.</span>
        </li>
      </ul>
    </div>

    <p className="text-[11px] text-gray-400 italic">
      * TG Counselling is dedicated to keeping higher education guidance transparent, accessible, and 100% free for all Telangana students and parents.
    </p>
  </div>
);

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

  useEffect(() => {
    if (openPanel && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [openPanel]);

  return (
    <footer className="relative z-[90] mt-24 border-t border-white/10 bg-black/80 backdrop-blur-xl text-gray-300">
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

          <div className="relative">
            <ShareButton variant="pill" label="Share Portal" className="text-white hover:text-purple-300" />
          </div>

          <AnimatePresence>
            {openPanel && (
              <motion.div
                ref={panelRef}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-full mb-4 right-1/2 translate-x-1/2 md:translate-x-0 md:right-0 z-[100] w-[min(92vw,480px)] max-h-[82vh] overflow-y-auto rounded-3xl border border-white/20 bg-[#120d1f]/98 p-5 sm:p-6 text-left shadow-[0_25px_70px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-2xl text-white custom-scrollbar"
              >
                <div className="mb-3.5 flex items-center justify-between border-b border-white/10 pb-2.5">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    {openPanel === "about" && <Info size={18} className="text-purple-300" />}
                    {openPanel === "privacy" && <Shield size={18} className="text-purple-300" />}
                    {openPanel === "contact" && <HelpCircle size={18} className="text-purple-300" />}
                    <span>
                      {openPanel === "about" && "About TG Counselling"}
                      {openPanel === "privacy" && "Privacy & Cookie Policy"}
                      {openPanel === "contact" && "Contact & Support"}
                    </span>
                  </h4>
                  <button
                    onClick={() => setOpenPanel(null)}
                    aria-label="Close"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-gray-300 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                {openPanel === "about" && ABOUT_PANEL_CONTENT}
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
