import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useSmoothScroll } from "../../hooks/useSmoothScroll";
import { api } from "../../lib/api";

import Hero from "../../components/layout/Hero";
import PageTransition from "../../components/layout/PageTransition";
import FeatureStats from "../../components/dashboard/FeatureStats";
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

export default function IcetPredictorPage() {
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
        const years = await api.get("/years?exam=tg-icet");
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

  const [isLoading, setIsLoading] = useState(false);
  const [loaderStats, setLoaderStats] = useState(null);

  async function handlePredict() {
    if (!rank || isNaN(rank) || Number(rank) <= 0) {
      setError("Please enter a valid TG ICET Rank.");
      return;
    }
    setError("");
    setLoaderStats(null);
    setIsLoading(true);

    document.body.style.overflow = "hidden";
    lenisRef.current?.stop();

    try {
      const [response] = await Promise.all([
        api.post("/predict", {
          rank: Number(rank),
          category,
          gender,
          course,
          year,
          exam: "tg-icet",
        }),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);

      const { results } = response;
      const mapped = mapResults(results, gender, year);
      setLoaderStats({
        recordsScanned: results.length,
        collegesChecked: results.length,
        safeMatches: mapped.filter((m) => m.status === "safe").length,
      });
      setResult(mapped);
    } catch (err) {
      console.error("Prediction error:", err);
      setIsLoading(false);
      document.body.style.overflow = "";
      lenisRef.current?.start();
      setError(err.message || "Failed to predict colleges.");
    }
  }

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

  function handleLoaderComplete() {
    setIsLoading(false);
    document.body.style.overflow = "";
    lenisRef.current?.start();
    scrollToResults();
  }

  function scrollToPredictor() {
    const target = document.getElementById("predict");
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: -60, duration: 1.2 });
    } else {
      target?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-6 pt-6">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-300 hover:text-white"
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
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm font-bold text-white tracking-wide">Cutoff Year:</span>
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
                {activeYears.map((y) => (
                  <button
                    key={y.year}
                    onClick={() => setYear(y.year)}
                    className={`rounded-full px-5 py-1.5 text-sm font-semibold transition-all duration-200 ${
                      year === y.year
                        ? "bg-white/25 text-white shadow-[0_4px_20px_rgba(124,58,237,0.4),inset_0_1px_0_0_rgba(255,255,255,0.5)] border border-white/30"
                        : "text-gray-300 hover:bg-white/15 hover:text-white"
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
            onPredict={handlePredict}
            error={error}
          />

          <AnimatePresence>
            {isLoading && (
              <PredictionLoader
                onComplete={handleLoaderComplete}
                collegeCount={loaderStats?.collegesChecked || 0}
                safeMatchesCount={loaderStats?.safeMatches || 0}
                minimumDurationMs={3000}
              />
            )}
          </AnimatePresence>

          {result.length > 0 && (
            <div id="results">
              <ResultsTable results={result} year={year} showYear={activeYears.length >= 2} />
            </div>
          )}
        </main>
      </PageTransition>
    </>
  );
}
