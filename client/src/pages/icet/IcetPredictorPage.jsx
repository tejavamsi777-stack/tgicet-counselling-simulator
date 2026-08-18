import { useState, useEffect } from "react";
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
import AdSenseUnit from "../../components/ads/AdSenseUnit";
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
    year: r.year || year,
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
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("Male");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
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
        setSelectedYears(years.map((y) => Number(y.year)));
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
    if (!category) {
      setError("Please select a category.");
      return;
    }
    if (!selectedCourses || selectedCourses.length === 0) {
      setError("Please select at least one course / branch.");
      return;
    }
    setError("");
    setLoaderStats(null);
    setIsLoading(true);

    try {
      const [response] = await Promise.all([
        api.post("/predict", {
          rank: Number(rank),
          category,
          gender,
          courses: selectedCourses,
          districts: selectedDistricts,
          years: selectedYears.length > 0 ? selectedYears : (year ? [Number(year)] : undefined),
          year,
          exam: "tg-icet",
        }),
        new Promise((resolve) => setTimeout(resolve, 2500)),
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
      setError(err.message || "Failed to predict colleges.");
    }
  }

  function scrollToResults() {
    setTimeout(() => {
      const target = document.getElementById("results");
      target?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }

  function handleLoaderComplete() {
    setIsLoading(false);
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
        <main className="mx-auto max-w-7xl space-y-16 px-6 pb-56">
          <FeatureStats />

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
            onPredict={handlePredict}
            error={error}
            examSlug="tg-icet"
            examBadge="TG ICET 2025"
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
            <div id="results" className="space-y-8">
              <ResultsTable results={result} activeYears={activeYears} showYear examTitle="TG ICET 2025" />
              {/* Passive ad unit placed safely below prediction results */}
              <AdSenseUnit slotName="predictorResults" minHeight={90} />
            </div>
          )}
        </main>
      </PageTransition>
    </>
  );
}
