import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Mail, Shield, Info, HelpCircle, Star, ChevronRight, ArrowUp, Share2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReviewModal from "../shared/ReviewModal";
import { ShareModal, ModernShareIcon } from "../shared/ShareModal";
import { TrustpilotStar } from "../shared/TrustpilotBadge";
import { TRUSTPILOT_CONFIG } from "../../config/trustpilot";

export const ABOUT_TEXT =
  "VuelaLearn is a 100% FREE educational admissions and counselling platform designed to help students master Andhra Pradesh (APSCHE), Telangana (TGCHE/TSCHE), and Karnataka (KEA) state counselling. Features include our AI-powered Smart Web Option Generator for TG EAPCET & TG ICET, accurate Rank Predictors, official seat allotment data for 500+ colleges, mock web option simulators, TS ePASS & AP JVD scholarship calculators, and HLC certificate guides — 100% free with zero paywalls, subscriptions, or spam.";

function AboutPanelContent() {
  return (
    <div className="space-y-4 text-xs sm:text-sm text-gray-300 leading-relaxed max-h-[65vh] overflow-y-auto pr-1">
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-300">
          ✨ 100% Free Website
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 text-[11px] font-extrabold text-purple-300">
          🎯 Smart Web Option Generator
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 text-[11px] font-extrabold text-cyan-300">
          🏛️ 500+ AP &amp; TG Colleges
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-300">
          ⚡ Zero Subscriptions or Ads
        </span>
      </div>

      <p>
        <strong className="text-white">VuelaLearn</strong> (vuelalearn.vercel.app) is India&apos;s leading <span className="text-emerald-400 font-bold">100% free</span> state entrance counselling simulator and admission guidance platform. We empower over 100,000+ students and parents across Telangana, Andhra Pradesh, and Karnataka to navigate competitive admissions with precision, confidence, and transparent data.
      </p>

      {/* Flagship Feature: Smart Web Option Generator */}
      <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-3.5 space-y-2">
        <div className="font-bold text-white flex items-center gap-2 text-sm text-purple-200">
          <span>🚀 Flagship: Smart Web Option Generator for TG EAPCET &amp; TG ICET</span>
        </div>
        <p className="text-xs text-gray-300">
          Struggling to prepare your web options list? Our automated <strong className="text-white">Smart Web Option Generator</strong> for <strong className="text-white">TG EAPCET</strong> (Engineering / B.Tech) and <strong className="text-white">TG ICET</strong> (MBA &amp; MCA) instantly generates an optimized, risk-balanced choice order based on your rank, reservation category, preferred branches, and districts — categorized into <em>Dream</em>, <em>Target</em>, and <em>Safe</em> colleges.
        </p>
      </div>

      {/* Comprehensive Counselling Portals */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-2.5 text-xs">
        <div className="font-bold text-white flex items-center gap-1.5 border-b border-white/10 pb-1.5">
          <span>Complete State Counselling Ecosystem (100% Free):</span>
        </div>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold shrink-0">•</span>
            <span><strong className="text-white">TG EAPCET Counselling (TS EAMCET):</strong> Predict B.Tech colleges by rank and category (OC, BC-A/B/C/D/E, SC, ST, EWS), search candidate allotments, simulate web options, and check OU/Non-Local cutoffs.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold shrink-0">•</span>
            <span><strong className="text-white">TG ICET Counselling:</strong> Comprehensive Telangana MBA &amp; MCA college predictor, fee structures, verified closing ranks, and phase-wise allotment records.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold shrink-0">•</span>
            <span><strong className="text-white">AP EAPCET Counselling (AP EAMCET):</strong> Andhra Pradesh engineering &amp; pharmacy admissions with AU/SVU regional quotas, Jagananna Vidya Deevena (JVD) scholarship calculators, and candidate records.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold shrink-0">•</span>
            <span><strong className="text-white">TG ECET Counselling:</strong> Lateral entry engineering admissions predictor &amp; seat allotment database for diploma holders (FDH).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold shrink-0">•</span>
            <span><strong className="text-white">TG POLYCET Counselling:</strong> Government &amp; private polytechnic college predictor for SSC / 10th pass diploma aspirants.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold shrink-0">•</span>
            <span><strong className="text-white">TG PGECET &amp; KCET Counselling:</strong> M.Tech, M.Pharm, and Karnataka CET candidate-wise seat allotments and cutoff trends.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold shrink-0">•</span>
            <span><strong className="text-white">Govt Scholarship &amp; Fee Calculators:</strong> Compute exact net tuition fees under Telangana TS ePASS (G.O. Ms. 244 &amp; 33) and AP JVD (G.O. Ms. 115).</span>
          </li>
        </ul>
      </div>

      <p className="text-xs text-gray-400">
        <em>Disclaimer:</em> VuelaLearn is an independent open-access student platform. We are not officially affiliated with APSCHE, TSCHE/TGCHE, or government counselling authorities. All allotment data and cutoff statistics are curated from official public archives for mock simulation, educational, and analytical purposes.
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
                <Link
                  to="/about"
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-left text-gray-400"
                >
                  <ChevronRight size={12} className="text-pink-400" /> About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-left text-gray-400"
                >
                  <ChevronRight size={12} className="text-pink-400" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-left text-gray-400"
                >
                  <ChevronRight size={12} className="text-pink-400" /> Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-left text-gray-400"
                >
                  <ChevronRight size={12} className="text-pink-400" /> Contact Support
                </Link>
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
            © {new Date().getFullYear()} <strong className="text-white">vuelalearn.in</strong> — All rights reserved. Data sourced from official counselling portals.
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
          url: "https://vuelalearn.in",
          title: "Vuela Learn — AP & TG Counselling Simulator & College Predictor",
          text: "Check out Vuela Learn for 100% free AP & TG College Predictors, authentic Seat Allotments, and Web Options Simulators!",
        }}
      />
    </footer>
  );
}
