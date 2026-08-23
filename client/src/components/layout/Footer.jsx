import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Mail, Shield, Info, HelpCircle, Star, ChevronRight, ArrowUp, Share2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReviewModal from "../shared/ReviewModal";
import { ShareModal, ModernShareIcon } from "../shared/ShareModal";
import { TrustpilotStar } from "../shared/TrustpilotBadge";
import { TRUSTPILOT_CONFIG } from "../../config/trustpilot";

export const ABOUT_TEXT =
  "VuelaLearn is a 100% FREE educational guidance platform built to empower students navigating Andhra Pradesh (APSCHE) and Telangana (TSCHE) admissions (AP EAPCET, TG EAPCET, TG ICET, TG ECET, TG POLYCET, and TG PGECET). We provide data-driven Rank Predictors, authentic college seat allotment data across 500+ institutions, interactive Web Options simulators, TS ePASS & AP JVD fee reimbursement calculators, and HLC certificate checklists — 100% free with zero paywalls or spam.";

function AboutPanelContent() {
  return (
    <div className="space-y-3.5 text-xs sm:text-sm text-gray-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-300">
          ✨ 100% Free Platform
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 text-[11px] font-extrabold text-purple-300">
          🏛️ 500+ AP &amp; TG Institutions
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 text-[11px] font-extrabold text-cyan-300">
          ⚡ Zero Subscriptions
        </span>
      </div>

      <p>
        <strong className="text-white">VuelaLearn</strong> is a <span className="text-emerald-400 font-bold">100% free</span> independent educational platform created to help students across Andhra Pradesh and Telangana make informed, confident, and data-backed admission decisions.
      </p>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-2 text-xs">
        <div className="font-bold text-white flex items-center gap-1.5 border-b border-white/10 pb-1.5">
          <span>What We Offer (100% Free for Every Student):</span>
        </div>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold shrink-0">•</span>
            <span><strong className="text-white">College Predictor:</strong> Data-driven cutoff estimation based on rank, caste category (OC, BC, SC, ST, EWS), and regional quota reservation (AU, SVU, OU).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold shrink-0">•</span>
            <span><strong className="text-white">Seat Allotment Explorer:</strong> Authentic candidate-level allotment records across AP EAPCET, TG EAPCET, TG ICET, TG ECET, TG POLYCET, and TG PGECET.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold shrink-0">•</span>
            <span><strong className="text-white">Exercise Web Options:</strong> Realistic practice simulator to build, test, and reorder priority choice lists with risk flags (Safe, Target, Reach).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold shrink-0">•</span>
            <span><strong className="text-white">College Profiles &amp; Fees:</strong> Accredited branch lists, verified government approved fee structures, and placement records for 500+ institutions.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold shrink-0">•</span>
            <span><strong className="text-white">Fee Reimbursement Calculators:</strong> Compute net student tuition fee under Telangana TS ePASS and Andhra Pradesh Jagananna Vidya Deevena (JVD).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold shrink-0">•</span>
            <span><strong className="text-white">HLC Certificate Guides:</strong> Complete document verification checklists with MeeSeva validity rules.</span>
          </li>
        </ul>
      </div>

      <p className="text-xs text-gray-400">
        Disclaimer: VuelaLearn is an independent educational tool. We are not officially affiliated with APSCHE, TSCHE, or any government authority. Cutoffs and allotment data are compiled from official public counseling reports for analytical and mock simulation purposes only.
      </p>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-3.5 text-xs sm:text-sm text-gray-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
      <p>
        At <strong className="text-white">Vuela Learn</strong> (vuelalearn.vercel.app), protecting student privacy is our top priority. Here is how we handle your data:
      </p>

      <div className="space-y-2 text-xs">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="font-semibold text-white mb-1">1. Zero Personal Data Retention</div>
          <p className="text-gray-400">
            Rank queries, category filters, and simulated web option lists entered into our predictors are processed in real-time in your browser session. We do not sell or monetize student data.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="font-semibold text-white mb-1">2. Local Storage &amp; Session State</div>
          <p className="text-gray-400">
            We use browser local storage solely to preserve your saved web options preferences and review prompt status on your device so you do not lose progress during mock exercises.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="font-semibold text-white mb-1">3. Analytics &amp; Cookies</div>
          <p className="text-gray-400">
            We use anonymous aggregated analytics to understand platform usage, monitor server load, and continuously improve simulation speed and usability for students.
          </p>
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        If you have any questions regarding privacy, please contact us at <a href="mailto:vuelalearn@gmail.com" className="text-purple-300 underline">vuelalearn@gmail.com</a>.
      </p>
    </div>
  );
}

function ContactContent() {
  return (
    <div className="space-y-3.5 text-xs sm:text-sm text-gray-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
      <p>
        Have questions, noticed a data discrepancy, or want to suggest a feature for <strong className="text-white">VuelaLearn</strong>? We’d love to hear from you.
      </p>
      <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4 space-y-2">
        <div className="font-bold text-white flex items-center gap-2">
          <Mail size={16} className="text-purple-300" />
          <span>Email Support</span>
        </div>
        <p className="text-xs text-gray-400">
          For general queries, data corrections, and feedback:
        </p>
        <a
          href="mailto:vuelalearn@gmail.com"
          className="inline-block text-xs font-semibold text-purple-300 hover:text-white transition underline"
        >
          vuelalearn@gmail.com
        </a>
      </div>
      <p className="text-[11px] text-gray-400">
        We typically respond to student and educator inquiries within 24–48 hours.
      </p>
    </div>
  );
}

export default function Footer({ openPanel, setOpenPanel }) {
  const location = useLocation();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const panelRef = useRef(null);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
    <footer className="relative z-[90] mt-20 border-t border-white/10 bg-[#070a13]/95 backdrop-blur-2xl text-gray-400">
      {/* Main Multi-Column Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* 1. Left Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block group">
              <img src="/vuela-logo-white.png" alt="VUELA" className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105" />
            </Link>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-sm">
              Your trusted guide to engineering, management &amp; diploma admissions in Andhra Pradesh &amp; Telangana — powered by authentic counselling data.
            </p>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Trusted by 100,000+ students</span>
              </div>
            </div>
          </div>

          {/* 2. PREDICTORS & TOOLS */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400">
              PREDICTORS &amp; TOOLS
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/ap-eapcet/predictor" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-cyan-400" /> AP EAPCET Predictor</Link></li>
              <li><Link to="/ap-eapcet/mock-counselling" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-cyan-400" /> AP EAPCET Web-Options</Link></li>
              <li><Link to="/tg-eapcet/predictor" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-cyan-400" /> TG EAPCET Predictor</Link></li>
              <li><Link to="/tg-eapcet/mock-counselling" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-cyan-400" /> TG EAPCET Web-Options</Link></li>
              <li><Link to="/tg-icet/predictor" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-cyan-400" /> TG ICET Predictor</Link></li>
              <li><Link to="/tg-icet/mock-counselling" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-cyan-400" /> TG ICET Web-Options</Link></li>
              <li><Link to="/tg-ecet/predictor" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-cyan-400" /> TG ECET Predictor</Link></li>
              <li><Link to="/tg-ecet/mock-counselling" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-cyan-400" /> TG ECET Web-Options</Link></li>
              <li><Link to="/tg-polycet/predictor" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-cyan-400" /> TG POLYCET Predictor</Link></li>
            </ul>
          </div>

          {/* 3. DATA & CUTOFFS */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400">
              DATA &amp; CUTOFFS
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/ap-eapcet/allotments" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-purple-400" /> AP EAPCET Allotments</Link></li>
              <li><Link to="/tg-eapcet/allotments" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-purple-400" /> TG EAPCET Allotments</Link></li>
              <li><Link to="/tg-icet/predictor" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-purple-400" /> TG ICET Cutoffs</Link></li>
              <li><Link to="/tg-ecet/allotments" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-purple-400" /> TG ECET Allotments</Link></li>
              <li><Link to="/tg-polycet/allotments" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-purple-400" /> TG POLYCET Allotments</Link></li>
              <li><Link to="/tg-pgecet/predictor" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-purple-400" /> TG PGECET Cutoffs</Link></li>
            </ul>
          </div>

          {/* 4. COLLEGES & DOCS */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
              COLLEGES &amp; DOCS
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/ap-eapcet" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-emerald-400" /> AP Engg Colleges</Link></li>
              <li><Link to="/tg-eapcet" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-emerald-400" /> TG Engg Colleges</Link></li>
              <li><Link to="/colleges" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-emerald-400" /> College Directory</Link></li>
              <li><Link to="/compare" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-emerald-400" /> College Comparison</Link></li>
              <li><Link to="/tg-eapcet/documents" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-emerald-400" /> Reservation Policy</Link></li>
              <li><Link to="/tg-eapcet/documents" className="hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={12} className="text-emerald-400" /> Document Checklist</Link></li>
            </ul>
          </div>

          {/* 5. COMPANY */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-pink-400">
              COMPANY
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setOpenPanel(openPanel === "about" ? null : "about")}
                  className={`hover:text-white transition-colors flex items-center gap-1.5 text-left cursor-pointer ${openPanel === "about" ? "text-white font-semibold" : ""}`}
                >
                  <ChevronRight size={12} className="text-pink-400" /> About Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setOpenPanel(openPanel === "privacy" ? null : "privacy")}
                  className={`hover:text-white transition-colors flex items-center gap-1.5 text-left cursor-pointer ${openPanel === "privacy" ? "text-white font-semibold" : ""}`}
                >
                  <ChevronRight size={12} className="text-pink-400" /> Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setOpenPanel(openPanel === "contact" ? null : "contact")}
                  className={`hover:text-white transition-colors flex items-center gap-1.5 text-left cursor-pointer ${openPanel === "contact" ? "text-white font-semibold" : ""}`}
                >
                  <ChevronRight size={12} className="text-pink-400" /> Contact Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="hover:text-purple-300 transition-colors flex items-center gap-1.5 text-left text-purple-400 cursor-pointer font-medium"
                >
                  <Share2 size={12} /> Share Website
                </button>
              </li>
              <li>
                <a
                  href={TRUSTPILOT_CONFIG.reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#00b67a] transition-colors flex items-center gap-1.5 text-left text-emerald-400 cursor-pointer font-medium"
                >
                  <TrustpilotStar size={13} className="text-[#00b67a]" /> Trustpilot Reviews ↗
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Slide-out / Modal Overlay for Panels */}
      <AnimatePresence>
        {openPanel && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-[min(94vw,560px)] max-h-[85vh] overflow-y-auto rounded-3xl border border-white/20 bg-[#120d1f]/98 p-6 text-left shadow-[0_25px_70px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-2xl text-white custom-scrollbar"
            >
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  {openPanel === "about" && <Info size={18} className="text-purple-300" />}
                  {openPanel === "privacy" && <Shield size={18} className="text-purple-300" />}
                  {openPanel === "contact" && <HelpCircle size={18} className="text-purple-300" />}
                  <span>
                    {openPanel === "about" && "About Vuela Learn"}
                    {openPanel === "privacy" && "Privacy & Cookie Policy"}
                    {openPanel === "contact" && "Contact & Support"}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => setOpenPanel(null)}
                  aria-label="Close"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-gray-300 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {openPanel === "about" && <AboutPanelContent />}
              {openPanel === "privacy" && <PrivacyContent />}
              {openPanel === "contact" && <ContactContent />}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Legal & Copyright Bar */}
      <div className="border-t border-white/10 bg-black/60 px-4 sm:px-6 lg:px-8 py-5">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="hidden md:block w-48" /> {/* Balanced left spacer */}
          
          <div className="text-center text-gray-400">
            © {new Date().getFullYear()} <strong className="text-white">vuelalearn.vercel.app</strong> — All rights reserved. Data sourced from official counselling portals.
          </div>
          
          <div className="flex items-center gap-3 w-auto md:w-48 justify-center md:justify-end">
            <a href="mailto:vuelalearn@gmail.com" className="hover:text-purple-300 transition text-gray-400">
              vuelalearn@gmail.com
            </a>
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              title="Share Vuela Learn"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 hover:text-white transition cursor-pointer"
            >
              <ModernShareIcon size={14} />
            </button>
            <button
              type="button"
              onClick={scrollToTop}
              title="Back to top"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
            >
              <ArrowUp size={15} />
            </button>
          </div>
        </div>
      </div>

      <ReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        examSlug={currentExamSlug}
      />

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        shareData={{
          url: "https://vuelalearn.vercel.app",
          title: "Vuela Learn — AP & TG Counselling Simulator & College Predictor",
          text: "Check out Vuela Learn for 100% free AP & TG College Predictors, authentic Seat Allotments, and Web Options Simulators!",
        }}
      />
    </footer>
  );
}
