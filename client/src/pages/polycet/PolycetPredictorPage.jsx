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

function mapResults(results, gender, year) {
  return results.map((r) => ({
    code: r.code,
    name: r.name,
    place: r.place,
    district: r.district_code,
    course: r.course_code,
    courseName: r.course_name,
    category: r.category_code,
    gender,
    year: r.year || year,
    cutoff: r.cutoff_rank,
    fee: r.fee,
    university: r.university,
    status: r.status,
    statusPriority: r.statusPriority,
  }));
}

export default function PolycetPredictorPage() {
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
    "tg-polycet"
  );

  useEffect(() => {
    let cancelled = false;
    async function fetchYears() {
      try {
        const years = await api.get("/years?exam=tg-polycet");
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
      const [response] = await Promise.all([
        api.post("/predict", { ...criteria, exam: "tg-polycet" }),
        showLoader ? new Promise((resolve) => setTimeout(resolve, 2500)) : Promise.resolve(),
      ]);

      const { results } = response;
      const mapped = mapResults(results, criteria.gender, criteria.year);
      setLoaderStats({
        recordsScanned: results.length,
        collegesChecked: results.length,
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
    setTimeout(() => {
      const target = document.getElementById("results");
      target?.scrollIntoView({ behavior: "smooth" });
    }, 150);
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
              examSlug="tg-polycet"
              onComplete={handleLoaderComplete}
              collegeCount={loaderStats?.collegesChecked || 0}
              safeMatchesCount={loaderStats?.safeMatches || 0}
              minimumDurationMs={3000}
            />
          )}
        </AnimatePresence>

        <main className="mx-auto max-w-7xl px-4 pt-8 pb-56 sm:px-6 lg:px-8">
          <ReviewModal
            isOpen={isReviewOpen}
            onClose={closeReview}
            examSlug="tg-polycet"
          />
          <button
            onClick={() => navigate("/")}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>

          <Hero title="TG POLYCET College Predictor" subtitle="Predict Polytechnic & Diploma admissions using verified TG POLYCET cutoff data." />
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
              examSlug="tg-polycet"
              examBadge="TG POLYCET 2025"
            />

            {lastCriteria && (
              <div id="results" className="space-y-6">
                <ResultsTable
                  results={sortedResult}
                  activeYears={activeYears}
                  showYear
                  examTitle="TG POLYCET 2025"
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
