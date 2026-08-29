import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import ResultsTable from "../../components/results/ResultsTable";
import SmartWebOptionsModal from "../../components/counselling/SmartWebOptionsModal";
import AdSenseUnit from "../../components/ads/AdSenseUnit";
import { GlowCard } from "../../components/ui/spotlight-card";
import { GlassButton } from "../../components/ui/glass-button";
import Seo from "../../components/shared/Seo";
import { motion, AnimatePresence } from "framer-motion";
import CategoryDropdown from "../../components/shared/CategoryDropdown";
import GenderDropdown from "../../components/shared/GenderDropdown";
import BranchMultiSelect from "../../components/shared/BranchMultiSelect";
import DistrictMultiSelect from "../../components/shared/DistrictMultiSelect";
import YearDropdown from "../../components/shared/YearDropdown";
import PredictionLoader from "../../components/dashboard/PredictionLoader";
import ThreeDotsLoader from "../../components/ui/three-dots-loader";

import { useReferenceData, sortCourses } from "../../hooks/useReferenceData";
import { smoothScrollTo } from "../../lib/utils";

export default function EapcetPredictorPage() {
  const { years, categories, courses, districts, loading } = useReferenceData("tg-eapcet");
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("Male");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [year, setYear] = useState("");
  const [selectedYears, setSelectedYears] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [predicting, setPredicting] = useState(false);
  const [showSmartOptionsModal, setShowSmartOptionsModal] = useState(false);

  useEffect(() => {
    if (years && years.length > 0) {
      setYear(String(years[0]?.year ?? ""));
      setSelectedYears(years.map((y) => Number(y.year)));
    }
  }, [years]);

  async function predict() {
    if (!rank || Number(rank) <= 0) return setError("Enter a valid TG EAPCET rank.");
    if (!category) return setError("Please select a category.");
    if (!selectedCourses || selectedCourses.length === 0) return setError("Please select at least one branch.");
    setError("");
    setPredicting(true);
    try {
      const response = await api.post("/predict", {
        exam: "tg-eapcet",
        rank,
        category,
        gender,
        courses: selectedCourses,
        districts: selectedDistricts,
        years: selectedYears.length > 0 ? selectedYears : (year ? [Number(year)] : undefined),
      });
      const rawResults = Array.isArray(response) ? response : (response.results || []);
      setResults(
        rawResults.map((row) => ({
          ...row,
          district: row.district_code || row.district,
          course: row.course_code || row.course,
          category: row.category_code || row.category || category,
          gender: row.gender || gender,
          year: Number(row.year || year),
          cutoff: row.cutoff_rank || row.cutoff,
        }))
      );
    } catch (e) {
      setError(e.message || "Prediction failed.");
    } finally {
      setPredicting(false);
    }
  }

  useEffect(() => {
    if (!predicting && results.length > 0) {
      smoothScrollTo("results", 80);
    }
  }, [predicting, results]);

  return (
    <main className="relative z-30 mx-auto w-full max-w-[1600px] px-4 sm:px-6 md:px-10 lg:px-14 pt-8 pb-56">
      <Seo
        title="TG EAPCET College Predictor 2025"
        description="Predict TG EAPCET college options by rank, category, gender, branches, and districts."
        path="/exams/tg-eapcet/predictor"
      />

      <Link
        to="/exams/tg-eapcet"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-300 transition hover:text-white"
      >
        <ArrowLeft size={16} /> TG EAPCET overview
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
                TG EAPCET 2025
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-300">
              Enter your rank, select desired branches and districts to explore eligible colleges based on previous year cutoffs.
            </p>
          </div>

          {/* Responsive Inputs Grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* 1. Rank */}
                <div className="relative z-[60]">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    TG EAPCET Rank
                  </label>
                  <input
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    type="number"
                    className="h-11 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-sm text-white outline-none backdrop-blur-2xl transition-all placeholder:text-gray-400 focus:border-white/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
                    placeholder="e.g. 25000"
                  />
                </div>

                {/* 2. Category & Gender (Side-by-side row on mobile) */}
                <div className="grid grid-cols-2 gap-3 sm:contents">
                  <div className="relative z-[50]">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                      Category
                    </label>
                    <CategoryDropdown category={category} setCategory={setCategory} examSlug="tg-eapcet" />
                  </div>

                  <div className="relative z-[40]">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                      Gender
                    </label>
                    <GenderDropdown gender={gender} setGender={setGender} />
                  </div>
                </div>

                {/* 4. Branch (Multi-select) */}
                <div className="relative z-[30]">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Branch (One or More)
                  </label>
                  <BranchMultiSelect
                    selectedCourses={selectedCourses}
                    setSelectedCourses={setSelectedCourses}
                    courses={courses}
                    examSlug="tg-eapcet"
                  />
                </div>

                {/* 5. District (Multi-select) */}
                <div className="relative z-[20]">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    District (One or More)
                  </label>
                  <DistrictMultiSelect
                    selectedDistricts={selectedDistricts}
                    setSelectedDistricts={setSelectedDistricts}
                    districts={districts}
                    examSlug="tg-eapcet"
                  />
                </div>

                {/* 6. Cutoff Year (Multi-select) */}
                <div className="relative z-[10]">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Cutoff Year (One or More)
                  </label>
                  <YearDropdown
                    year={year}
                    setYear={setYear}
                    selectedYears={selectedYears}
                    setSelectedYears={setSelectedYears}
                    years={years}
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
            examSlug="tg-eapcet"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!predicting && results.length > 0 && (
          <motion.div
            id="results"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 space-y-6"
          >
            {/* Full Results Table with Chance Confidence Bar and Create Web Options action */}
            <ResultsTable
              results={results}
              activeYears={years}
              showYear
              examTitle="TG EAPCET 2025"
              studentRank={rank}
              onCreateWebOptions={() => setShowSmartOptionsModal(true)}
            />

            {/* Passive ad unit placed safely below prediction results */}
            <AdSenseUnit slotName="predictorResults" minHeight={90} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Web Options Modal */}
      <SmartWebOptionsModal
        isOpen={showSmartOptionsModal}
        onClose={() => setShowSmartOptionsModal(false)}
        rank={rank}
        category={category}
        gender={gender}
        selectedCourses={selectedCourses}
        selectedDistricts={selectedDistricts}
        selectedYears={selectedYears}
        results={results}
        examSlug="tg-eapcet"
      />
    </main>
  );
}
