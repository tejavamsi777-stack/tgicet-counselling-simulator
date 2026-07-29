import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useSmoothScroll } from "../hooks/useSmoothScroll";
import { api } from "../lib/api";


import Hero from "../components/layout/Hero";
import PageTransition from "../components/layout/PageTransition";

import FeatureStats from "../components/dashboard/FeatureStats";
import StatsGrid from "../components/dashboard/StatsGrid";
import PredictorForm from "../components/dashboard/PredictorForm";
import PredictionLoader from "../components/dashboard/PredictionLoader";
import ResultsTable from "../components/results/ResultsTable";
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

export default function PredictorPage() {
  const navigate = useNavigate();
  const lenisRef = useSmoothScroll();

  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("OC");
  const [gender, setGender] = useState("Male");
  const [course, setCourse] = useState("MBA");
  const [error, setError] = useState("");

  const [result, setResult] = useState([]);
  const [activeYears, setActiveYears] = useState([]);
  const [year, setYear] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchYears() {
      try {
        const years = await api.get("/years"); // now returns only active years, newest first
        if (cancelled) return;
        setActiveYears(years);
        if (years.length > 0) setYear(years[0].year); // default to newest active year
      } catch (err) {
        console.error("Failed to load active years:", err);
      }
    }
    fetchYears();
    return () => { cancelled = true; };
  }, []);

  // The exact criteria used for the last successful prediction — kept
  // separate from the live form fields so changing the year dropdown can
  // re-run the same search without needing rank/category/gender/course
  // to still match what's currently typed in the form.
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
      const { results } = await api.post("/predict", criteria);
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
        // Year-switch refetch — no cinematic loader, so nothing will call
        // handleLoaderComplete to restore scroll/overflow. Do it directly.
        scrollToResults();
      }
    } catch (err) {
      setError(err.message || "Something went wrong while predicting. Please try again.");
      if (showLoader) {
        setIsLoading(false);
        document.body.style.overflow = "";
        lenisRef.current?.start();
      }
    }
  }

 async function predictCollege() {
    if (rank.trim() === "") {
      setError("Please enter your TG ICET Rank");
      return;
    }
    setError("");
    const criteria = { rank, category, gender, course, year };

    // Instrumentation: log the click and criteria so dev console shows the
    // outgoing prediction attempt. Remove this once debugging is complete.
    // eslint-disable-next-line no-console
    console.log("Predict clicked:", criteria);

    api.post("/log-activity", {
      action: "rank_entry",
      details: { rank, category, gender, course, year },
    }).catch((err) => console.error("Activity log failed:", err));

    await runPrediction(criteria, { showLoader: true, scrollAfter: true });
  }

  // Year dropdown changed after a prediction already exists — re-run the
  // same search against the new year, no full loading overlay needed.
  useEffect(() => {
    if (!lastCriteria) return; // no prediction made yet, nothing to refetch
    if (lastCriteria.year === year) return; // avoid refetching on the initial set
    const updatedCriteria = { ...lastCriteria, year };
    runPrediction(updatedCriteria, { showLoader: false, scrollAfter: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  function scrollToResults() {
    // Small delay so the DOM has settled (overflow restored, new rows rendered)
    setTimeout(() => {
      const target = document.getElementById("results");
      if (lenisRef.current && target) {
        lenisRef.current.resize();
        lenisRef.current.scrollTo(target, { offset: -80 });
      } else {
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldScrollOnComplete]);

  function scrollToPredictor() {
    const target = document.getElementById("predict");
    if (lenisRef.current && target) {
      lenisRef.current.scrollTo(target, { offset: -80 });
    } else {
      target?.scrollIntoView({ behavior: "smooth" });
    }
  }

  const stats = useMemo(() => {
    const safe = result.filter((c) => c.status === "safe").length;
    const moderate = result.filter((c) => c.status === "moderate").length;
    const risky = result.filter((c) => c.status === "risky").length;
    return { total: result.length, safe, moderate, risky };
  }, [result]);

  return (
    <>
      <div className="mx-auto max-w-7xl px-6 pt-6">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>
      <Hero onGetStarted={scrollToPredictor} />

      <PageTransition>
        <main className="mx-auto max-w-7xl space-y-16 px-6 pb-24">
          <FeatureStats />

          {activeYears.length >= 2 && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-medium text-slate-600">Cutoff Year:</span>
              <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
                {activeYears.map((y) => (
                  <button
                    key={y.year}
                    onClick={() => setYear(y.year)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      year === y.year
                        ? "bg-brand-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {y.year}
                  </button>
                ))}
              </div>
            </div>
          )}

          

          <PredictorForm
            rank={rank}
            setRank={setRank}
            category={category}
            setCategory={setCategory}
            gender={gender}
            setGender={setGender}
            course={course}
            setCourse={setCourse}
            onPredict={predictCollege}
            error={error}
          />

          {result.length > 0 && <StatsGrid {...stats} />}

          <section id="results">
            <ResultsTable results={result} year={year} showYear={activeYears.length >= 2} />
          </section>
        </main>
      </PageTransition>

      <AnimatePresence>
        {isLoading && (
          <PredictionLoader stats={loaderStats} onComplete={handleLoaderComplete} />
        )}
      </AnimatePresence>
    </>
  );
}