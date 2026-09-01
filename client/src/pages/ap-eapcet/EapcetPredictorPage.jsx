import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Loader2, ChevronDown, Sparkles, AlertCircle } from "lucide-react";
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
import SmartWebOptionsModal from "../../components/counselling/SmartWebOptionsModal";
import { smoothScrollTo } from "../../lib/utils";
import { useReferenceData } from "../../hooks/useReferenceData";
import ThreeDotsLoader from "../../components/ui/three-dots-loader";

// AP EAPCET clean category list (matches Eduvale / APSCHE format)
const AP_CATEGORIES = [
  { code: "OC",                 label: "OC" },
  { code: "BC-A",               label: "BC-A" },
  { code: "BC-B",               label: "BC-B" },
  { code: "BC-C",               label: "BC-C" },
  { code: "BC-D",               label: "BC-D" },
  { code: "BC-E",               label: "BC-E" },
  { code: "SC",                 label: "SC (All Groups)" },
  { code: "SC-I",               label: "SC-I" },
  { code: "SC-II",              label: "SC-II" },
  { code: "SC-III",             label: "SC-III" },
  { code: "ST",                 label: "ST" },
  { code: "EWS",                label: "EWS" },
  { code: "Muslim Minority",    label: "Muslim Minority" },
  { code: "Christian Minority", label: "Christian Minority" },
];

const AP_REGIONS = [
  { code: "ALL", label: "All Regions (AU + SVU + Non-Local)" },
  { code: "AU",  label: "AU Region (Andhra University area)" },
  { code: "SVU", label: "SVU Region (Sri Venkateswara area)" },
  { code: "NL",  label: "Non-Local (15% Unreserved Quota)" },
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
  const { courses, districts, loading } = useReferenceData("ap-eapcet");
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("OC");
  const [region, setRegion] = useState("ALL");
  const [gender, setGender] = useState("Male");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [predicting, setPredicting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSmartOptionsModal, setShowSmartOptionsModal] = useState(false);
  const resultsRef = useRef(null);

  async function predict() {
    if (!rank || Number(rank) <= 0) return setError("Enter a valid AP EAPCET rank.");
    if (!category) return setError("Please select a category.");
    setError("");
    setPredicting(true);
    setHasSearched(true);
    try {
      const response = await api.post("/predict", {
        exam: "ap-eapcet",
        rank: Number(rank),
        category,
        region: region || "ALL",
        gender,
        courses: selectedCourses.length > 0 ? selectedCourses : undefined,
        districts: selectedDistricts.length > 0 ? selectedDistricts : undefined,
      });
      const rawResults = Array.isArray(response) ? response : (response?.results || []);
      setResults(
        rawResults.map((row) => ({
          ...row,
          district: row.district_code || row.district,
          course: row.course_code || row.course,
          category: category || row.category_code || row.category,
          gender: row.gender || gender,
          year: Number(row.year || 2025),
          cutoff: Number(row.cutoff_rank || row.cutoff || 0),
        }))
      );
    } catch (e) {
      setError(e.message || "Prediction failed. Please try again.");
    } finally {
      setPredicting(false);
    }
  }

  useEffect(() => {
    if (!predicting && results.length > 0) {
      smoothScrollTo(resultsRef, 80);
    }
  }, [predicting, results]);

  return (
    <main className="relative z-30 mx-auto w-full max-w-[1600px] px-4 sm:px-6 md:px-10 lg:px-14 pt-8 pb-56">
      <Seo
        title="AP EAPCET 2027 College Predictor | Predict AP B.Tech Colleges by Rank"
        description="Find eligible Andhra Pradesh engineering & pharmacy colleges by AP EAPCET 2027 rank, category (OC, BC, SC, ST, EWS), and branch preference with real closing cutoffs."
        keywords="ap eapcet college predictor 2027, ap eamcet engineering predictor by rank, auce jntuk cse cutoff rank eapcet, top engineering colleges in ap by rank, ap eapcet 2027 cutoffs"
        path="/exams/ap-eapcet/predictor"
        toolType="predictor"
        examName="AP EAPCET"
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
            <div>
              <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-purple-300 backdrop-blur-sm">
                AP EAPCET 2025
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-300">
              Enter your rank, select category, region, and optional branches/districts to explore eligible engineering colleges based on official cutoffs.
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
                {loading && courses.length === 0 ? (
                  <ThreeDotsLoader label="Branch (Optional / All by default)" dotClassName="bg-purple-400" />
                ) : (
                  "Branch (Optional / All by default)"
                )}
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
                {loading && districts.length === 0 ? (
                  <ThreeDotsLoader label="District (Optional / All by default)" dotClassName="bg-cyan-400" />
                ) : (
                  "District (Optional / All by default)"
                )}
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
            className="mt-8 space-y-6"
          >
            {/* Full Results Table with Chance Confidence Bar and Create Web Options button */}
            <ResultsTable
              results={results}
              showYear
              examTitle="AP EAPCET 2025"
              studentRank={Number(rank)}
              onCreateWebOptions={() => setShowSmartOptionsModal(true)}
            />

            {/* Passive ad unit placed safely below prediction results */}
            <AdSenseUnit slotName="predictorResults" minHeight={90} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State when search returns 0 results */}
      {!predicting && hasSearched && results.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Matching Colleges Found</h3>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto mb-4">
            No cutoffs found within the selected branch or district filters for rank <strong className="text-white">#{rank}</strong> ({category} category).
          </p>
          <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
            <span>💡 Tip:</span>
            <button
              onClick={() => { setSelectedCourses([]); setSelectedDistricts([]); setRegion("ALL"); }}
              className="font-semibold text-purple-300 hover:text-purple-200 underline cursor-pointer"
            >
              Reset branch &amp; district filters to search all colleges
            </button>
          </div>
        </motion.div>
      )}

      {/* Smart Web Options Generator Modal */}
      <SmartWebOptionsModal
        isOpen={showSmartOptionsModal}
        onClose={() => setShowSmartOptionsModal(false)}
        rank={rank}
        category={category}
        gender={gender}
        selectedCourses={selectedCourses}
        selectedDistricts={selectedDistricts}
        results={results}
        examSlug="ap-eapcet"
      />
    </main>
  );
}
