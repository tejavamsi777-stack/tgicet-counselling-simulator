import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Database, ArrowRight, CheckCircle2 } from "lucide-react";
import Seo from "../components/shared/Seo";
import ExamCard from "../components/exams/ExamCard";
import { exams } from "../config/exams";
import AdSenseUnit from "../components/ads/AdSenseUnit";

function formatProgram(p) {
  if (!p) return "";
  const upper = p.toUpperCase().trim();
  if (upper === "ENGINEERING") return "Engineering";
  if (upper === "AGRICULTURE") return "Agriculture";
  if (upper === "PHARMACY") return "Pharmacy";
  if (upper.includes("DIPLOMA")) return "Polytechnic Diploma";
  if (upper === "MBA") return "MBA";
  if (upper === "MCA") return "MCA";
  if (upper === "B.TECH" || upper === "BTECH") return "B.Tech";
  if (upper === "B.E." || upper === "BE") return "B.E.";
  if (upper === "B.PHARMACY" || upper === "B.PHARM") return "B.Pharmacy";
  if (upper === "M.TECH" || upper === "MTECH") return "M.Tech";
  if (upper === "M.E." || upper === "ME") return "M.E.";
  if (upper === "M.ARCH") return "M.Arch";
  if (upper === "M.PHARMACY" || upper === "M.PHARM") return "M.Pharmacy";
  return p;
}

const STATE_CONFIGS = {
  "andhra-pradesh": {
    name: "Andhra Pradesh",
    code: "AP",
    greeting: "నమస్కారం ఆంధ్రప్రదేశ్!",
    authority: "APSCHE (Andhra Pradesh State Council of Higher Education)",
    title: "Andhra Pradesh Entrance Examinations",
    seoDescription: "Explore Andhra Pradesh AP EAPCET entrance examinations for engineering and pharmacy admissions.",
    description: "Select an entrance examination below to access rank-based college cutoff predictors, seat allotment explorers, and counselling tools.",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    mapImg: "/maps/andhra-pradesh.png",
  },
  "karnataka": {
    name: "Karnataka",
    code: "KA",
    greeting: "ನಮಸ್ಕಾರ ಕರ್ನಾಟಕ!",
    authority: "KEA (Karnataka Examinations Authority)",
    title: "Karnataka Entrance Examinations",
    seoDescription: "Explore Karnataka KCET entrance examinations for engineering admissions.",
    description: "Select an entrance examination below to access candidate-wise seat allotment records and closing rank cutoffs.",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    mapImg: "/maps/karnataka.png",
  },
  "telangana": {
    name: "Telangana",
    code: "TG",
    greeting: "నమస్తే తెలంగాణ!",
    authority: "TSCHE (Telangana State Council of Higher Education)",
    title: "Telangana Entrance Examinations",
    seoDescription: "Explore Telangana entrance examinations for TG EAPCET, TG ICET, TG ECET, TG POLYCET & TG PGECET.",
    description: "Select an entrance examination below to access college predictors, seat allotment explorers & mock web options choice simulators.",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    mapImg: "/maps/telangana.png",
  }
};

export default function StatePortalPage({ stateSlugOverride }) {
  const params = useParams();
  const stateSlug = stateSlugOverride || params.stateSlug || "telangana";
  const config = STATE_CONFIGS[stateSlug.toLowerCase()] || STATE_CONFIGS["telangana"];

  const stateExams = useMemo(() => {
    return exams.filter((ex) => (ex.state || "Telangana").toLowerCase() === config.name.toLowerCase());
  }, [config.name]);

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title={`${config.title} | Vuela Learn`}
        description={config.seoDescription}
        path={`/${stateSlug}`}
      />

      {/* Header Banner with Real State Outline Map (Behind text on mobile, on the right on desktop) */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#12131e]/90 p-6 sm:p-8 backdrop-blur-md shadow-xl">
        {/* Large Background Map centered behind text on Mobile (Sized and aligned to fit without clipping) */}
        <div className={`pointer-events-none absolute inset-0 z-0 md:hidden flex items-center justify-center opacity-65 sm:opacity-75 overflow-hidden ${
          stateSlug.includes("andhra") ? "translate-y-3 sm:translate-y-4" : "translate-y-2 sm:translate-y-3"
        }`}>
          <img
            src={config.mapImg}
            alt=""
            aria-hidden="true"
            className={`w-auto object-contain brightness-110 ${
              stateSlug.includes("andhra")
                ? "h-52 sm:h-60 max-w-[260px] drop-shadow-[0_0_25px_rgba(56,189,248,0.75)]"
                : stateSlug.includes("karnataka")
                ? "h-48 sm:h-56 max-w-[210px] drop-shadow-[0_0_25px_rgba(251,146,60,0.75)]"
                : "h-48 sm:h-56 max-w-[210px] drop-shadow-[0_0_25px_rgba(52,211,153,0.75)]"
            }`}
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-16">
          <div className="max-w-2xl z-10">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${config.badgeColor}`}>
                <MapPin size={13} />
                <span>{config.name} State Admissions · {config.authority}</span>
              </div>
            </div>

            {/* Prominent Visible Native Greeting in White Text */}
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-wide mb-1 drop-shadow-md">
              {config.greeting}
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {config.title}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-gray-300 leading-relaxed">
              {config.description}
            </p>
          </div>

          {/* Real State Outline Map on the Right (Desktop only) */}
          <div className="hidden md:flex shrink-0 items-center justify-center z-10 md:ml-12">
            <img
              src={config.mapImg}
              alt={`${config.name} State Map Outline`}
              className={`w-auto object-contain opacity-100 brightness-110 transition-transform duration-500 hover:scale-105 ${
                stateSlug.includes("andhra")
                  ? "h-36 sm:h-44 md:h-48 max-w-[240px] sm:max-w-[280px] drop-shadow-[0_0_18px_rgba(56,189,248,0.55)]"
                  : stateSlug.includes("karnataka")
                  ? "h-32 sm:h-40 md:h-44 max-w-[190px] sm:max-w-[220px] drop-shadow-[0_0_18px_rgba(251,146,60,0.55)]"
                  : "h-32 sm:h-40 md:h-44 max-w-[190px] sm:max-w-[220px] drop-shadow-[0_0_18px_rgba(52,211,153,0.55)]"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Entrance Exams Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/10 text-white">
          <Database size={18} className={stateSlug.includes("karnataka") ? "text-orange-400" : stateSlug.includes("andhra") ? "text-blue-400" : "text-emerald-400"} />
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Select Entrance Examination ({stateExams.length})
          </h2>
        </div>

        {/* Mobile View: Single Unified Mobile Block with all entrance exams */}
        <div className="sm:hidden rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-xl overflow-hidden divide-y divide-white/[0.08]">
          {stateExams.map((exam) => {
            const available = exam.status === "available";
            const coursesText = Array.isArray(exam.programs)
              ? exam.programs.map(formatProgram).join(" · ")
              : "";

            return (
              <Link
                key={exam.id}
                to={`/exams/${exam.slug}`}
                className="group flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.06] active:bg-white/10 transition-colors"
              >
                <div className="flex flex-col gap-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white truncate group-hover:text-emerald-300 transition-colors">
                      {exam.shortName}
                    </span>
                    {available && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        <CheckCircle2 size={10} />
                        <span>Available</span>
                      </span>
                    )}
                  </div>
                  {coursesText && (
                    <span className="text-[11px] font-medium text-purple-300/90 truncate">
                      {coursesText}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/25 bg-purple-500/10 px-2.5 py-1 text-[11px] font-semibold text-purple-300 group-hover:bg-purple-500/20 group-hover:border-purple-500/40 transition-all">
                    <span>{available ? "Explore tools" : "View page"}</span>
                    <ArrowRight size={11} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Desktop View: Multi-column Grid Cards */}
        <div className="hidden sm:grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stateExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      </div>

      <div className="mt-8 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
