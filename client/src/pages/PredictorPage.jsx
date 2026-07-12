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

export default function PredictorPage() {
  const navigate = useNavigate();
  const lenisRef = useSmoothScroll();

  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("OC");
  const [gender, setGender] = useState("Male");
  const [course, setCourse] = useState("MBA");
  const [error, setError] = useState("");

  const [result, setResult] = useState([]);
  const [year, setYear] = useState(2024);

  const [isLoading, setIsLoading] = useState(false);
  const [loaderStats, setLoaderStats] = useState(null);
  const [pendingCriteria, setPendingCriteria] = useState(null);

  async function predictCollege() {
    if (rank.trim() === "") {
      setError("Please enter your TG ICET Rank");
      return;
    }
    setError("");

    const criteria = { rank, category, gender, course, year };

    setLoaderStats(null); // real record counts aren't known until the API responds
    setPendingCriteria(criteria);
    setIsLoading(true);

    document.body.style.overflow = "hidden";
    lenisRef.current?.stop();

    try {
      const { results } = await api.post("/predict", criteria);

      // Map the API's field names back to the shape ResultsTable/ExportButtons
      // already expect (same shape the old local JSON + computeMatches produced),
      // so no changes are needed in ResultsTable itself.
      const mapped = results.map((r) => ({
        code: r.code,
        name: r.name,
        place: r.place,
        district: r.district_code,
        course: r.course_code,
        courseName: r.course_name,
        category: r.category_code,
        gender: criteria.gender,
        cutoff: r.cutoff_rank,
        fee: r.fee,
        university: r.university,
        status: r.status,
        statusPriority: r.statusPriority,
      }));

      setLoaderStats({
        recordsScanned: results.length,
        collegesChecked: results.length,
        safeMatches: mapped.filter((m) => m.status === "safe").length,
      });

      // small delay so the cinematic loader has something to show before results land
      setTimeout(() => {
        setResult(mapped);
      }, 0);
    } catch (err) {
      setIsLoading(false);
      document.body.style.overflow = "";
      lenisRef.current?.start();
      setError(err.message || "Something went wrong while predicting. Please try again.");
    }
  }

  const handleLoaderComplete = useCallback(() => {
    setIsLoading(false);
    document.body.style.overflow = "";
    lenisRef.current?.start();
  }, []);

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

  useEffect(() => {
    if (result.length > 0) {
      const timer = setTimeout(() => {
        const target = document.getElementById("results");
        if (lenisRef.current && target) {
          lenisRef.current.resize();
          lenisRef.current.scrollTo(target, { offset: -80 });
        } else {
          target?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
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
            <ResultsTable results={result} year={year} setYear={setYear} />
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