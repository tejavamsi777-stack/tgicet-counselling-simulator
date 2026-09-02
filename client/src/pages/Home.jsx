import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Search, X, ExternalLink, Compass } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../components/shared/Seo";
import AdSenseUnit from "../components/ads/AdSenseUnit";
import WhyChooseUs from "../components/home/WhyChooseUs";
import FaqSection from "../components/shared/FaqSection";
import { HOME_FAQS } from "../data/faqsData";
import { exams } from "../config/exams";
import { strictMultiFieldMatch } from "../utils/searchMatch";

// Detailed State Master Information & Summaries (Telangana, Andhra Pradesh, Karnataka)
const STATE_CARDS_DATA = [
  {
    id: "telangana",
    name: "Telangana",
    code: "TG",
    path: "/telangana",
    examCount: 5,
    examsList: ["TG EAPCET", "TG ICET", "TG ECET", "TG POLYCET", "TG PGECET"],
    description: "TSCHE Engineering, MBA/MCA, Lateral Entry & PG admissions predictors and allotment archives.",
    gradient: "from-emerald-600/20 via-teal-600/10 to-transparent",
    borderColor: "border-emerald-500/30 hover:border-emerald-400/60",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    titleHoverColor: "group-hover:text-emerald-400",
    buttonStyle: "bg-gradient-to-r from-[#365314] to-[#4d7c0f] border-lime-500/30 text-white group-hover:from-[#4d7c0f] group-hover:to-[#65a30d] shadow-lg shadow-lime-950/50",
    mapImg: "/maps/telangana.png",
    mapClass: "h-20 w-auto opacity-75 group-hover:opacity-100 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]",
  },
  {
    id: "andhra-pradesh",
    name: "Andhra Pradesh",
    code: "AP",
    path: "/andhra-pradesh",
    examCount: 1,
    examsList: ["AP EAPCET"],
    description: "APSCHE Engineering, Agriculture & Pharmacy predictors, cutoffs and seat allotment explorers.",
    gradient: "from-blue-600/20 via-indigo-600/10 to-transparent",
    borderColor: "border-blue-500/30 hover:border-blue-400/60",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    titleHoverColor: "group-hover:text-blue-400",
    buttonStyle: "bg-gradient-to-r from-[#1e3a8a] to-[#172554] border-blue-400/30 text-white group-hover:from-[#1d4ed8] group-hover:to-[#1e3a8a] shadow-lg shadow-blue-950/50",
    mapImg: "/maps/andhra-pradesh.png",
    mapClass: "h-20 w-auto opacity-75 group-hover:opacity-100 drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]",
  },
  {
    id: "karnataka",
    name: "Karnataka",
    code: "KA",
    path: "/karnataka",
    examCount: 1,
    examsList: ["KCET"],
    description: "KEA Engineering admissions candidate-wise seat allotments and closing cutoffs across 200+ colleges.",
    gradient: "from-orange-600/20 via-amber-600/10 to-transparent",
    borderColor: "border-orange-500/30 hover:border-orange-400/60",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    titleHoverColor: "group-hover:text-orange-400",
    buttonStyle: "bg-gradient-to-r from-[#7c2d12] to-[#9a3412] border-orange-400/30 text-white group-hover:from-[#c2410c] group-hover:to-[#9a3412] shadow-lg shadow-orange-950/50",
    mapImg: "/maps/karnataka.png",
    mapClass: "h-20 w-auto opacity-75 group-hover:opacity-100 drop-shadow-[0_0_10px_rgba(251,146,60,0.3)]",
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Filter available exams based on strict prefix & word-boundary search query
  const filteredExams = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return exams
      .filter((exam) => exam.status === "available")
      .filter((exam) => {
        const programs = Array.isArray(exam.programs) ? exam.programs : [];
        const fields = [exam.shortName, exam.name, exam.state, exam.slug, exam.description, ...programs].filter(Boolean);
        return strictMultiFieldMatch(fields, searchQuery);
      });
  }, [searchQuery]);

  return (
    <main className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-3 py-6 sm:px-6 sm:py-10">
      <Seo
        title="Vuela Learn — 100% Free AP & TG College Predictor, Smart Web Options & Counselling Simulator"
        description="100% free counselling simulator for TG EAPCET, TG ICET, AP EAPCET, TG ECET, TG POLYCET & TG PGECET. Use our AI Smart Web Option Generator, rank predictors & verified candidate seat allotment records."
        keywords="tg eapcet counselling, ts eamcet counselling, tg icet counselling, smart web option generator, ap eapcet counselling, ap eamcet counselling, tg ecet counselling, tg polycet counselling, tg pgecet counselling, kcet counselling, ts eamcet college predictor, tg eapcet predictor 2026, free counselling simulator, web options priority generator, telangana engineering admissions"
        path="/"
        faqs={HOME_FAQS}
      />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 w-full text-center sm:mb-8"
      >
        <div className="mx-auto mb-3 flex max-w-fit items-center justify-center space-x-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-sm border border-white/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-300 sm:text-sm">
            State-Wise Admissions Portals
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-purple-300" />
        </div>

        <h1
          className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
          id="exam-selection-heading"
        >
          Select your State to get started
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-gray-200 sm:text-base sm:font-normal sm:text-gray-300">
          Click on any state card below to open its dedicated counselling portal and entrance exams.
        </p>

        {/* ── Search Bar Section (Exams Only) ─────────────────────────── */}
        <div className="mx-auto mt-6 max-w-2xl w-full">
          <div className="relative flex items-center w-full rounded-2xl border border-purple-500/30 bg-[#12131e]/90 p-1.5 shadow-xl shadow-purple-950/20 backdrop-blur-md focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-500/30 transition-all">
            <div className="pl-3 text-purple-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entrance exams (e.g. TG EAPCET, AP EAPCET, TG ICET, POLYCET)..."
              className="w-full bg-transparent px-3 py-2.5 text-sm font-medium text-white placeholder-gray-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1.5 text-gray-400 hover:text-white transition cursor-pointer"
                title="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Search Results View (Matching Exams) ──────────────────────── */}
      {searchQuery.trim().length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-10 rounded-2xl border border-purple-500/30 bg-[#12131e]/80 p-4 sm:p-6 backdrop-blur-md"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2 text-white">
              <Compass size={18} className="text-purple-400" />
              <h2 className="text-lg font-bold">
                Matching Entrance Exams ({filteredExams.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs font-semibold text-purple-300 hover:text-purple-200 cursor-pointer"
            >
              Clear Search
            </button>
          </div>

          {filteredExams.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <p className="text-sm font-semibold">No entrance exams found matching "{searchQuery}".</p>
              <p className="mt-1 text-xs text-gray-500">Try searching for "EAPCET", "ICET", "ECET", "POLYCET", or "PGECET".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredExams.map((exam) => (
                <Link
                  key={exam.id}
                  to={`/${exam.slug}`}
                  className="group relative flex flex-col justify-between rounded-xl border border-purple-500/20 bg-white/[0.03] p-4 sm:p-5 hover:border-purple-400/60 hover:bg-purple-500/10 transition-all shadow-sm hover:shadow-purple-500/15"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase font-mono text-emerald-300 border border-emerald-500/30">
                        {exam.state}
                      </span>
                      <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300 border border-purple-500/30">
                        Portal Live
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                      {exam.shortName}
                    </h3>
                    <p className="text-xs text-gray-300 font-medium mt-0.5 line-clamp-1">
                      {exam.name}
                    </p>
                    <p className="mt-2 text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>

                    {/* Programs Tag List */}
                    {exam.programs && exam.programs.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {exam.programs.slice(0, 3).map((prog) => (
                          <span
                            key={prog}
                            className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-gray-400"
                          >
                            {prog}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5 text-xs font-bold text-purple-400 group-hover:text-purple-300">
                    <span>Open Exam Portal</span>
                    <ExternalLink size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── State Cards Grid (With State-Matching Button Accents) ────────── */}
      <div className="w-full mb-10">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {STATE_CARDS_DATA.map((stateCard) => (
            <Link
              key={stateCard.id}
              to={stateCard.path}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-b ${stateCard.gradient} ${stateCard.borderColor} bg-[#10111a] p-5 sm:p-6 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.01]`}
            >
              {/* Header info & State Outline Map */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 border border-white/15 text-white group-hover:bg-white/20 transition-colors">
                      <MapPin size={16} />
                    </div>
                    <h2
                      className={`text-xl font-bold text-white tracking-tight ${stateCard.titleHoverColor} transition-colors`}
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {stateCard.name}
                    </h2>
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold font-mono ${stateCard.badgeColor}`}>
                    {stateCard.examCount} {stateCard.examCount === 1 ? 'Exam' : 'Exams'}
                  </span>
                </div>

                {/* State outline map centered beside description */}
                <div className="relative flex items-center justify-between gap-3 mb-4 min-h-[75px]">
                  <p className="text-xs sm:text-sm leading-relaxed text-gray-300 flex-1 z-10">
                    {stateCard.description}
                  </p>

                  <div className="shrink-0 flex items-center justify-center pl-2 self-center z-10">
                    <img
                      src={stateCard.mapImg}
                      alt={`${stateCard.name} Map Outline`}
                      className={`object-contain opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 ${stateCard.mapClass}`}
                    />
                  </div>
                </div>

                {/* Exams Badges tags */}
                <div className="flex flex-wrap gap-1.5 mb-5 z-10 relative">
                  {stateCard.examsList.map((exName) => (
                    <span key={exName} className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[11px] font-semibold text-gray-300">
                      {exName}
                    </span>
                  ))}
                </div>
              </div>

              {/* State-Matching Action Button */}
              <div className={`w-full inline-flex items-center justify-between rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-md z-10 relative ${stateCard.buttonStyle}`}>
                <span>Explore {stateCard.name} Admissions</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Section Divider */}
      <div className="my-6 w-full border-t border-white/[0.08]" />

      {/* Why Choose Our Website & About Section */}
      <div className="w-full mb-8">
        <WhyChooseUs />
      </div>

      {/* Section Divider */}
      <div className="my-6 w-full border-t border-white/[0.08]" />

      {/* Main Home Page FAQs */}
      <div className="w-full mb-8">
        <FaqSection
          title="Frequently Asked Questions (FAQs)"
          subtitle="Everything you need to know about state entrance counselling, cutoff predictions, fee calculators, and mock choice simulations"
          faqs={HOME_FAQS}
        />
      </div>

      {/* Passive, non-intrusive Home page advertisement banner */}
      <div className="mt-4 w-full">
        <AdSenseUnit slotName="homeBanner" minHeight={90} />
      </div>
    </main>
  );
}
