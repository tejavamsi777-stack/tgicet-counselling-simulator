import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Database } from "lucide-react";
import Seo from "../components/shared/Seo";
import ExamCard from "../components/exams/ExamCard";
import { exams } from "../config/exams";
import AdSenseUnit from "../components/ads/AdSenseUnit";

const STATE_CONFIGS = {
  "andhra-pradesh": {
    name: "Andhra Pradesh",
    code: "AP",
    greeting: "నమస్కారం!",
    authority: "APSCHE (Andhra Pradesh State Council of Higher Education)",
    title: "Andhra Pradesh Entrance Examinations",
    seoDescription: "Explore Andhra Pradesh AP EAPCET entrance examinations for engineering and pharmacy admissions.",
    description: "Select an entrance examination below to access rank-based college cutoff predictors, seat allotment explorers, and counselling tools.",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    mapImg: "/maps/andhra-pradesh.png"
  },
  "telangana": {
    name: "Telangana",
    code: "TG",
    greeting: "నమస్తే!",
    authority: "TSCHE (Telangana State Council of Higher Education)",
    title: "Telangana Entrance Examinations",
    seoDescription: "Explore Telangana entrance examinations for TG EAPCET, TG ICET, TG ECET, TG POLYCET & TG PGECET.",
    description: "Select an entrance examination below to access college predictors, seat allotment explorers & mock web options choice simulators.",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    mapImg: "/maps/telangana.png"
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

      {/* Header Banner with Real State Outline Map to the Right */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#12131e]/90 p-6 sm:p-8 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-16">
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

          {/* Real State Outline Map on the Right (Shifted Slightly Right) */}
          <div className="shrink-0 flex items-center justify-center z-10 md:ml-12">
            <img
              src={config.mapImg}
              alt={`${config.name} State Map Outline`}
              className="h-34 sm:h-42 md:h-46 w-auto max-w-[200px] sm:max-w-[240px] object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>
      </div>

      {/* Entrance Exams Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/10 text-white">
          <Database size={18} className="text-emerald-400" />
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Select Entrance Examination ({stateExams.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
