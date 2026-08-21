import { useState, useRef } from "react";
import { ArrowLeft, Loader2, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import ResultsTable from "../../components/results/ResultsTable";
import AdSenseUnit from "../../components/ads/AdSenseUnit";
import { GlowCard } from "../../components/ui/spotlight-card";
import { GlassButton } from "../../components/ui/glass-button";
import Seo from "../../components/shared/Seo";
import { motion, AnimatePresence } from "framer-motion";
import GenderDropdown from "../../components/shared/GenderDropdown";
import BranchMultiSelect from "../../components/shared/BranchMultiSelect";
import DistrictMultiSelect from "../../components/shared/DistrictMultiSelect";
import PredictionLoader from "../../components/dashboard/PredictionLoader";

import { useReferenceData } from "../../hooks/useReferenceData";
import { useReviewPrompt } from "../../hooks/useReviewPrompt";
import ReviewModal from "../../components/shared/ReviewModal";

// AP EAPCET clean category list (matches Eduvale / APSCHE format)
const AP_CATEGORIES = [
  { code: "OC",               label: "OC" },
  { code: "BC-A",             label: "BC-A" },
  { code: "BC-B",             label: "BC-B" },
  { code: "BC-C",             label: "BC-C" },
  { code: "BC-D",             label: "BC-D" },
  { code: "BC-E",             label: "BC-E" },
  { code: "SC-I",             label: "SC-I" },
  { code: "SC-II",            label: "SC-II" },
  { code: "SC-III",           label: "SC-III" },
  { code: "ST",               label: "ST" },
  { code: "EWS",              label: "EWS" },
  { code: "Muslim Minority",  label: "Muslim Minority" },
  { code: "Christian Minority", label: "Christian Minority" },
];

const AP_REGIONS = [
  { code: "ALL", label: "All Regions" },
  { code: "AU",  label: "AU Region (Andhra)" },
  { code: "SVU", label: "SVU Region (Rayalaseema)" },
  { code: "UR",  label: "Non-Local / UR" },
];

// Lightweight native select styled to match the glass design
function NativeSelect({ value, onChange, options, placeholder, icon: Icon }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 z-10" />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 w-full appearance-none rounded-2xl border border-white/20 bg-white/10 pl-10 pr-8 text-sm font-medium outline-none backdrop-blur-2xl transition-all hover:border-white/40 focus:border-white/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)] cursor-pointer ${value === "" ? "text-gray-400" : "text-white"}`}
        style={{ colorScheme: "dark" }}
      >
        {placeholder && <option value="" disabled style={{ background: "#1a1030" }}>{placeholder}</option>}
        {options.map((o) => (
          <option key={o.code} value={o.code} style={{ background: "#1a1030" }}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
    </div>
  );
}

export default function EapcetPredictorPage() {
  const { courses, districts } = useReferenceData("ap-eapcet");
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");
  const [gender, setGender] = useState("Male");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [predicting, setPredicting] = useState(false);
  const resultsRef = useRef(null);

  const { isOpen: isReviewOpen, closePrompt: closeReview } = useReviewPrompt(
    results.length > 0,
    "ap-eapcet"
  );

  async function predict() {
    if (!rank || Number(rank) <= 0) return setError("Enter a valid AP EAPCET rank.");
    if (!category) return setError("Please select a category.");
    if (!selectedCourses || selectedCourses.length === 0) return setError("Please select at least one branch.");
    setError("");
    setPredicting(true);
    try {
      const [response] = await Promise.all([
        api.post("/predict", {
          exam: "ap-eapcet",
          rank,
          category,
          region: region || undefined,
          gender,
          courses: selectedCourses,
          districts: selectedDistricts,
        }),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);
      const rawResults = Array.isArray(response) ? response : (response.results || []);
      setResults(
        rawResults.map((row) => ({
          ...row,
          district: row.district_code || row.district,
          course: row.course_code || row.course,
          category: category || row.category_code || row.category,
          gender: row.gender || gender,
          year: Number(row.year),
          cutoff: row.cutoff_rank || row.cutoff,
        }))
      );
      // Scroll to results after a short delay to let the DOM update
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (e) {
      setError(e.message || "Prediction failed.");
    } finally {
      setPredicting(false);
    }
  }

  return (
    <main className="relative z-30 mx-auto w-full max-w-[1600px] px-4 sm:px-6 md:px-10 lg:px-14 pt-8 pb-56">
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={closeReview}
        examSlug="ap-eapcet"
      />
      <Seo
        title="AP EAPCET College Predictor 2025"
        description="Predict AP EAPCET college options by rank, category, gender, branches, and districts."
        path="/exams/ap-eapcet/predictor"
      />

      <Link
        to="/exams/ap-eapcet"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-300 transition hover:text-white"
      >
        <ArrowLeft size={16} /> AP EAPCET overview
      </Link>

      <section className="relative z-30 mt-6">
        <GlowCard customSize={true} glowColor="purple" className="p-6 sm:p-10" tilt={false}>
          <div className="space-y-2">
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Predict Your College
            </h1>
            <p className="text-xs sm:text-sm text-gray-300">
              Enter your rank, select desired branches and districts to explore eligible colleges based on previous year cutoffs.
            </p>
          </div>

          {/* Responsive Inputs Grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* 1. Rank */}
                <div className="relative z-[60]">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    AP EAPCET Rank
                  </label>
                  <input
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    type="number"
                    className="h-11 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-sm text-white outline-none backdrop-blur-2xl transition-all placeholder:text-gray-400 focus:border-white/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
                    placeholder="e.g. 25000"
                  />
                </div>

                {/* 2. Category */}
                <div className="relative z-[50]">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Category
                  </label>
                  <NativeSelect
                    value={category}
                    onChange={setCategory}
                    options={AP_CATEGORIES}
                    placeholder="Select category"
                  />
                </div>

                {/* 3. Region */}
                <div className="relative z-[45]">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Region
                  </label>
                  <NativeSelect
                    value={region}
                    onChange={setRegion}
                    options={AP_REGIONS}
                  />
                </div>

                {/* 4. Gender */}
                <div className="relative z-[40]">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Gender
                  </label>
                  <GenderDropdown gender={gender} setGender={setGender} />
                </div>

                {/* 5. Branch (Multi-select) */}
                <div className="relative z-[30]">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Branch (One or More)
                  </label>
                  <BranchMultiSelect
                    selectedCourses={selectedCourses}
                    setSelectedCourses={setSelectedCourses}
                    courses={courses}
                    examSlug="ap-eapcet"
                  />
                </div>

                {/* 6. District (Multi-select) */}
                <div className="relative z-[20]">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    District (One or More)
                  </label>
                  <DistrictMultiSelect
                    selectedDistricts={selectedDistricts}
                    setSelectedDistricts={setSelectedDistricts}
                    districts={districts}
                    examSlug="ap-eapcet"
                  />
                </div>
              </div>

              {error && (
                <p className="mt-4 text-xs sm:text-sm font-semibold text-rose-400">{error}</p>
              )}

              {/* Predict Button */}
              <div className="relative z-[1] mt-7 flex justify-center">
                <GlassButton
                  disabled={predicting}
                  onClick={predict}
                  size="default"
                  className="w-full sm:w-auto min-w-[180px]"
                  contentClassName="flex items-center justify-center gap-2 font-semibold"
                >
                  {predicting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Predicting…</span>
                    </>
                  ) : (
                    <span>Predict Colleges</span>
                  )}
                </GlassButton>
              </div>
        </GlowCard>
      </section>

      <AnimatePresence>
        {predicting && (
          <PredictionLoader
            examSlug="ap-eapcet"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!predicting && results.length > 0 && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 space-y-8"
          >
            <ResultsTable results={results} showYear examTitle="AP EAPCET 2025" />
            {/* Passive ad unit placed safely below prediction results */}
            <AdSenseUnit slotName="predictorResults" minHeight={90} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
