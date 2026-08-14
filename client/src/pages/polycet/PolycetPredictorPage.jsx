import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useSmoothScroll } from "../../hooks/useSmoothScroll";
import { api } from "../../lib/api";

import Hero from "../../components/layout/Hero";
import PageTransition from "../../components/layout/PageTransition";
import FeatureStats from "../../components/dashboard/FeatureStats";
import StatsGrid from "../../components/dashboard/StatsGrid";
import PredictorForm from "../../components/dashboard/PredictorForm";
import PredictionLoader from "../../components/dashboard/PredictionLoader";
import ResultsTable from "../../components/results/ResultsTable";
import { AnimatePresence } from "framer-motion";

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
    year,
    cutoff: r.cutoff_rank,
    fee: r.fee,
    university: r.university,
    status: r.status,
    statusPriority: r.statusPriority,
  }));
}

export default function PolycetPredictorPage() {
  const navigate = useNavigate();
  const lenisRef = useSmoothScroll();

  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("OC");
  const [gender, setGender] = useState("Male");
  const [course, setCourse] = useState("CS");
  const [error, setError] = useState("");

  const [result, setResult] = useState([]);
  const [activeYears, setActiveYears] = useState([]);
  const [year, setYear] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchYears() {
      try {
        const years = await api.get("/years?exam=tg-polycet");
        if (cancelled) return;
        setActiveYears(years);
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
      document.body.style.overflow = "hidden";
      lenisRef.current?.stop();
    }

    try {
      const [response] = await Promise.all([
        api.post("/predict", { ...criteria, exam: "tg-polycet" }),
        showLoader ? new Promise((resolve) => setTimeout(resolve, 3000)) : Promise.resolve(),
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
        document.body.style.overflow = "";
        lenisRef.current?.start();
      }
      setError(err.message || "Failed to predict colleges. Please check backend connection.");
    }
  }

  function handleFormPredict() {
    if (!rank || isNaN(rank) || Number(rank) <= 0) {
      setError("Please enter a valid rank.");
      return;
    }
    setError("");

    runPrediction(
      {
        rank: Number(rank),
        category,
        gender,
        course,
        year,
      },
      { showLoader: true, scrollAfter: true }
    );
  }

  const handleYearChange = useCallback((newYear) => {
    setYear(newYear);
    if (!lastCriteria) return;
    runPrediction(
      { ...lastCriteria, year: newYear },
      { showLoader: false, scrollAfter: false }
    );
  }, [lastCriteria]);

  function scrollToResults() {
    setTimeout(() => {
      const target = document.getElementById("results");
      if (!target) return;
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, { offset: -60, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }

  const handleLoaderComplete = useCallback(() => {
    setIsLoading(false);
    document.body.style.overflow = "";
    lenisRef.current?.start();

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

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
              course={course}
              setCourse={setCourse}
              onPredict={handleFormPredict}
              error={error}
              examSlug="tg-polycet"
            />

            {lastCriteria && (
              <div id="results" className="space-y-6">
                <StatsGrid results={result} />
                <ResultsTable
                  results={sortedResult}
                  activeYears={activeYears}
                  selectedYear={year}
                  onYearChange={handleYearChange}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
