import { useState, useMemo, useEffect } from "react";
import colleges2023 from "./data/colleges.json";
import colleges2024 from "./data/colleges2024.json";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { getStatus } from "./utils/status";

import Navbar from "./components/layout/Navbar";
import Hero from "./components/layout/Hero";
import Footer from "./components/layout/Footer";
import PageTransition from "./components/layout/PageTransition";

import FeatureStats from "./components/dashboard/FeatureStats";
import StatsGrid from "./components/dashboard/StatsGrid";
import PredictorForm from "./components/dashboard/PredictorForm";
import PredictionLoader from "./components/dashboard/PredictionLoader";
import ResultsTable from "./components/results/ResultsTable";
import { AnimatePresence } from "framer-motion";

const DATASETS = {
  2023: colleges2023,
  2024: colleges2024,
};

function computeMatches(dataset, criteria) {
  return dataset
    .filter(
      (college) =>
        college.course === criteria.course &&
        college.category === criteria.category &&
        college.gender === criteria.gender &&
        Number(criteria.rank) <= Number(college.cutoff)
    )
    .map((college) => {
      const status = getStatus(criteria.rank, college.cutoff);
      return {
        ...college,
        status,
        statusPriority: status === "safe" ? 0 : status === "moderate" ? 1 : 2,
      };
    })
    .sort((a, b) => {
      if (a.statusPriority !== b.statusPriority) {
        return a.statusPriority - b.statusPriority;
      }
      return a.cutoff - b.cutoff;
    });
}

function App() {
  const lenisRef = useSmoothScroll();

  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("OC");
  const [gender, setGender] = useState("Male");
  const [course, setCourse] = useState("MBA");
  const [error, setError] = useState("");

  const [submitted, setSubmitted] = useState(null);
  const [year, setYear] = useState(2024);
  const [openPanel, setOpenPanel] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loaderStats, setLoaderStats] = useState(null);
  const [pendingCriteria, setPendingCriteria] = useState(null);

  function predictCollege() {
    if (rank.trim() === "") {
      setError("Please enter your TG ICET Rank");
      return;
    }
    setError("");

    const criteria = { rank, category, gender, course };
    const dataset = DATASETS[year] ?? [];

    const collegesChecked = new Set(
      dataset.filter((c) => c.course === course).map((c) => c.code)
    ).size;

    const matches = computeMatches(dataset, criteria);
    const safeMatches = matches.filter((c) => c.status === "safe").length;

    setLoaderStats({
      recordsScanned: dataset.length,
      collegesChecked,
      safeMatches,
    });
    setPendingCriteria(criteria);
    setIsLoading(true);

    document.body.style.overflow = "hidden";
    lenisRef.current?.stop();
  }

  function handleLoaderComplete() {
    setSubmitted(pendingCriteria);
    setIsLoading(false);
    document.body.style.overflow = "";
    lenisRef.current?.start();
  }

  function scrollToPredictor() {
    const target = document.getElementById("predict");
    if (lenisRef.current && target) {
      lenisRef.current.scrollTo(target, { offset: -80 });
    } else {
      target?.scrollIntoView({ behavior: "smooth" });
    }
  }

  const result = useMemo(() => {
    if (!submitted) return [];
    const dataset = DATASETS[year] ?? [];
    return computeMatches(dataset, submitted);
  }, [submitted, year]);

  const stats = useMemo(() => {
    const safe = result.filter((c) => c.status === "safe").length;
    const moderate = result.filter((c) => c.status === "moderate").length;
    const risky = result.filter((c) => c.status === "risky").length;
    return { total: result.length, safe, moderate, risky };
  }, [result]);

  useEffect(() => {
    if (submitted) {
      const target = document.getElementById("results");
      if (lenisRef.current && target) {
        lenisRef.current.scrollTo(target, { offset: -80 });
      } else {
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [submitted]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-300/40 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
      </div>

      <Navbar />
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

      <Footer openPanel={openPanel} setOpenPanel={setOpenPanel} />

      <AnimatePresence>
        {isLoading && (
          <PredictionLoader stats={loaderStats} onComplete={handleLoaderComplete} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;