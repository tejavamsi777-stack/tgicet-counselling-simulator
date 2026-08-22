import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "../../lib/api";

import Hero from "../../components/layout/Hero";
import PageTransition from "../../components/layout/PageTransition";
import FeatureStats from "../../components/dashboard/FeatureStats";
import PredictorForm from "../../components/dashboard/PredictorForm";
import PredictionLoader from "../../components/dashboard/PredictionLoader";
import ResultsTable from "../../components/results/ResultsTable";
import AdSenseUnit from "../../components/ads/AdSenseUnit";
import { AnimatePresence } from "framer-motion";
import { useReviewPrompt } from "../../hooks/useReviewPrompt";
import ReviewModal from "../../components/shared/ReviewModal";
import { smoothScrollTo } from "../../lib/utils";

function mapResults(results = [], gender, year) {
  if (!Array.isArray(results)) return [];
  return results.map((r) => ({
    code: r.code,
    name: r.name,
    place: r.place,
    district: r.district_code || r.district,
    course: r.course_code || r.course,
    courseName: r.course_name || r.courseName || r.course,
    category: r.category_code || r.category,
    gender: r.gender || gender,
    year: Number(r.year || year),
    cutoff: Number(r.cutoff_rank || r.cutoff || 0),
    fee: r.fee,
    university: r.university,
    status: r.status,
    statusPriority: r.statusPriority,
  }));
}

export default function EcetPredictorPage() {
  const navigate = useNavigate();

  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("Male");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [error, setError] = useState("");

  const [result, setResult] = useState([]);
  const [activeYears, setActiveYears] = useState([]);
  const [year, setYear] = useState(null);

  const { isOpen: isReviewOpen, closePrompt: closeReview } = useReviewPrompt(
    result.length > 0,
    "tg-ecet"
  );

  useEffect(() => {
    let cancelled = false;
    async function fetchYears() {
      try {
        const years = await api.get("/years?exam=tg-ecet");
        if (cancelled) return;
        setActiveYears(years);
        setSelectedYears(years.map((y) => Number(y.year)));
        if (years.length > 0) setYear(years[0].year);
      } catch (err) {
        console.error("Failed to load active years:", err);
      }
    }
    fetchYears();
    return () => { cancelled = true; };
  }, []);

  const [lastCriteria, setLastCriteria] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loaderStats, setLoaderStats] = useState(null);
  const [shouldScrollOnComplete, setShouldScrollOnComplete] = useState(false);

  async function runPrediction(criteria, { showLoader = true, scrollAfter = true } = {}) {
    if (showLoader) {
      setLoaderStats(null);
      setIsLoading(true);
    }

    try {
      const response = await api.post("/predict", { ...criteria, exam: "tg-ecet" });

      const rawResults = Array.isArray(response) ? response : (response?.results || []);
      const mapped = mapResults(rawResults, criteria.gender, criteria.year);
      setLoaderStats({
        recordsScanned: rawResults.length,
        collegesChecked: rawResults.length,
        safeMatches: mapped.filter((m) => m.status === "safe").length,
      });
      setResult(mapped);
      setLastCriteria(criteria);
      setShouldScrollOnComplete(scrollAfter);

      if (!showLoader) {
        scrollToResults();
      }
    } catch (err) {
      console.error("Prediction error:", err);
      if (showLoader) {
        setIsLoading(false);
      }
      setError(err.message || "Failed to predict colleges. Please check backend connection.");
    }
  }

  function handleFormPredict() {
    if (!rank || isNaN(rank) || Number(rank) <= 0) {
      setError("Please enter a valid rank.");
      return;
    }
    if (!category) {
      setError("Please select a category.");
      return;
    }
    if (!selectedCourses || selectedCourses.length === 0) {
      setError("Please select at least one branch.");
      return;
    }
    setError("");

    runPrediction(
      {
        rank: Number(rank),
        category,
        gender,
        courses: selectedCourses,
        districts: selectedDistricts,
        years: selectedYears.length > 0 ? selectedYears : (year ? [Number(year)] : undefined),
        year,
      },
      { showLoader: true, scrollAfter: true }
    );
  }

  function scrollToResults() {
    smoothScrollTo("results", 80);
  }

  const handleLoaderComplete = useCallback(() => {
    setIsLoading(false);
    if (shouldScrollOnComplete) {
      scrollToResults();
    }
  }, [shouldScrollOnComplete]);

  const sortedResult = useMemo(() => {
    return [...result].sort((a, b) => {
      if (a.statusPriority !== b.statusPriority) {
        return a.statusPriority - b.statusPriority;
      }
      return a.cutoff - b.cutoff;
    });
  }, [result]);

  return (
    <PageTransition>
      <div className="relative">
        <AnimatePresence>
          {isLoading && (
            <PredictionLoader
              onComplete={handleLoaderComplete}
              collegeCount={loaderStats?.collegesChecked || 0}
              safeMatchesCount={loaderStats?.safeMatches || 0}
              minimumDurationMs={350}
            />
          )}
        </AnimatePresence>

        <main className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 md:px-10 lg:px-14 py-8 min-h-[calc(100vh-280px)] pb-36">
          <ReviewModal
            isOpen={isReviewOpen}
            onClose={closeReview}
            examSlug="tg-ecet"
          />
          <button
            onClick={() => navigate("/")}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>

          <Hero title="TG ECET College Predictor" subtitle="Predict B.E. / B.Tech / B.Pharmacy lateral-entry admissions using verified TG ECET cutoff data." />
          <FeatureStats />

          <div className="mt-8 space-y-12">
            <PredictorForm
              rank={rank}
              setRank={setRank}
              category={category}
              setCategory={setCategory}
              gender={gender}
              setGender={setGender}
              selectedCourses={selectedCourses}
              setSelectedCourses={setSelectedCourses}
              selectedDistricts={selectedDistricts}
              setSelectedDistricts={setSelectedDistricts}
              year={year}
              setYear={setYear}
              selectedYears={selectedYears}
              setSelectedYears={setSelectedYears}
              years={activeYears}
              onPredict={handleFormPredict}
              error={error}
              examSlug="tg-ecet"
              examBadge="TG ECET 2026"
              rankLabel="TG ECET Branch Rank"
            />

            {lastCriteria && (
              <div id="results" className="space-y-6">
                <ResultsTable
                  results={sortedResult}
                  activeYears={activeYears}
                  showYear
                  examTitle="TG ECET 2026"
                />
                {/* Passive ad unit placed safely below prediction results */}
                <AdSenseUnit slotName="predictorResults" minHeight={90} />
              </div>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
