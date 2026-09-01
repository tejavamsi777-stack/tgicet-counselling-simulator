import { useState, useEffect } from "react";
import { useSearchParams, useParams, Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Wand2 } from "lucide-react";
import Seo from "../../components/shared/Seo";
import AdSenseUnit from "../../components/ads/AdSenseUnit";
import { GlowCard } from "../../components/ui/spotlight-card";
import CategoryDropdown from "../../components/shared/CategoryDropdown";
import GenderDropdown from "../../components/shared/GenderDropdown";
import BranchMultiSelect from "../../components/shared/BranchMultiSelect";
import DistrictMultiSelect from "../../components/shared/DistrictMultiSelect";
import SmartWebOptionsModal from "../../components/counselling/SmartWebOptionsModal";
import { useReferenceData } from "../../hooks/useReferenceData";

const EXAM_META = {
  "tg-eapcet": {
    name: "TG EAPCET 2027",
    fullName: "TG EAPCET Engineering & Pharmacy",
    homePath: "/exams/tg-eapcet",
    rankPlaceholder: "e.g. 14500",
  },
  "tg-icet": {
    name: "TG ICET 2027",
    fullName: "TG ICET MBA & MCA Admissions",
    homePath: "/exams/tg-icet",
    rankPlaceholder: "e.g. 1200",
  },
  "ap-eapcet": {
    name: "AP EAPCET 2027",
    fullName: "AP EAPCET Engineering & Pharmacy",
    homePath: "/exams/ap-eapcet",
    rankPlaceholder: "e.g. 18000",
  },
  "tg-ecet": {
    name: "TG ECET 2027",
    fullName: "TG ECET Lateral Entry B.Tech",
    homePath: "/exams/tg-ecet",
    rankPlaceholder: "e.g. 850",
  },
  "tg-polycet": {
    name: "TG POLYCET 2027",
    fullName: "TG POLYCET Polytechnic Diploma",
    homePath: "/exams/tg-polycet",
    rankPlaceholder: "e.g. 6500",
  },
};

export default function CreateWebOptionsPage({ examOverride }) {
  const [searchParams] = useSearchParams();
  const { examSlug: urlExam } = useParams();

  const examSlug = examOverride || urlExam || "tg-eapcet";
  const meta = EXAM_META[examSlug] || EXAM_META["tg-eapcet"];

  const { courses, districts } = useReferenceData(examSlug);

  const [rank, setRank] = useState(searchParams.get("rank") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "OC");
  const [gender, setGender] = useState(searchParams.get("gender") || "Male");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  // Auto-open builder if rank is already supplied via URL params
  useEffect(() => {
    if (searchParams.get("rank")) {
      setIsModalOpen(true);
    }
  }, []);

  function handleOpenSmartOptions(e) {
    e?.preventDefault();
    const rankNum = Number(rank);
    if (!rank || isNaN(rankNum) || rankNum <= 0) {
      setError("Please enter a valid rank number.");
      return;
    }
    setError("");
    setIsModalOpen(true);
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <Seo
        title={`${meta.name} Create Web Options | Smart Choice Preference Generator`}
        description={`Generate an optimal, cutoff-balanced web options preference list for ${meta.fullName}. Dream, target, and safe tiers with PDF download and simulator export.`}
        keywords={`${examSlug} create web options 2027, ${examSlug} web options preference list generator, ${examSlug} smart web options builder, create web options 2027`}
        path={`/exams/${examSlug}/create-web-options`}
        toolType="builder"
        examName={meta.name}
      />

      {/* Back Link */}
      <Link
        to={meta.homePath}
        className="no-print inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to {meta.name} overview
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 backdrop-blur-sm">
          <Sparkles size={13} />
          <span>{meta.name} • Smart Choice Preference Builder</span>
        </div>
        <h1
          className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Create Web Options {meta.name.includes("2027") ? "2027" : ""}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl">
          Enter your candidate rank, select your branch interests and districts. Our engine calculates verified closing
          cutoffs to build a balanced, conflict-free priority order for official counseling submission.
        </p>
      </div>

      {/* Form Input Section */}
      <div className="mb-10">
        <GlowCard customSize={true} glowColor="purple" className="p-6 sm:p-8" tilt={false}>
          <form onSubmit={handleOpenSmartOptions}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Rank */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                  Your Rank <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  placeholder={meta.rankPlaceholder}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder-gray-500 text-sm font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                  Category
                </label>
                <CategoryDropdown category={category} setCategory={setCategory} examSlug={examSlug} />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                  Gender
                </label>
                <GenderDropdown gender={gender} setGender={setGender} />
              </div>

              {/* Action Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-gray-950 shadow-[0_4px_20px_0_rgba(255,255,255,0.25)] transition-all hover:bg-gray-100 hover:shadow-[0_6px_28px_0_rgba(255,255,255,0.4)] active:scale-[0.98] cursor-pointer"
                >
                  <Wand2 size={16} className="text-purple-600" />
                  <span>Build Smart Options</span>
                </button>
              </div>
            </div>

            {/* Optional Branch & District Filters */}
            <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
              <BranchMultiSelect
                courses={courses}
                selectedCourses={selectedCourses}
                setSelectedCourses={setSelectedCourses}
                examSlug={examSlug}
              />
              <DistrictMultiSelect
                districts={districts}
                selectedDistricts={selectedDistricts}
                setSelectedDistricts={setSelectedDistricts}
                examSlug={examSlug}
              />
            </div>

            {error && (
              <p className="mt-4 text-xs font-semibold text-rose-400 bg-rose-950/30 border border-rose-500/30 rounded-xl p-3">
                {error}
              </p>
            )}
          </form>
        </GlowCard>
      </div>

      {/* Info Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <span className="text-2xl mb-2 block">🌟</span>
          <h3 className="text-sm font-bold text-white mb-1">Dream Tier (Reach)</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Identifies premier, highly competitive institutions for your desired branch with tight cutoffs to maximize top-choice reach.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <span className="text-2xl mb-2 block">🎯</span>
          <h3 className="text-sm font-bold text-white mb-1">Target Tier (Realistic)</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            High-probability colleges matching your rank (80% to 125% range) based on verified multi-year closing data.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <span className="text-2xl mb-2 block">🛡️</span>
          <h3 className="text-sm font-bold text-white mb-1">Safe Tier (Backup)</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Guaranteed safety nets with cutoffs well above your rank to ensure no risk of non-allotment across counselling rounds.
          </p>
        </div>
      </div>

      {/* 100% Identical Shared Generator Engine */}
      {isModalOpen && (
        <SmartWebOptionsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          rank={rank}
          category={category}
          gender={gender}
          selectedCourses={selectedCourses}
          selectedDistricts={selectedDistricts}
          examSlug={examSlug}
          results={[]}
        />
      )}

      <div className="mt-12 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
