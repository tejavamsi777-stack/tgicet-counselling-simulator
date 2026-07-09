import { useState, useMemo } from "react";
import colleges from "./data/colleges.json";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { getStatus } from "./utils/status";

import Navbar from "./components/layout/Navbar";
import Hero from "./components/layout/Hero";
import Footer from "./components/layout/Footer";
import PageTransition from "./components/layout/PageTransition";

import FeatureStats from "./components/dashboard/FeatureStats";
import StatsGrid from "./components/dashboard/StatsGrid";
import PredictorForm from "./components/dashboard/PredictorForm";
import ResultsTable from "./components/results/ResultsTable";

function App() {
  useSmoothScroll();

  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("OC");
  const [gender, setGender] = useState("Male");
  const [course, setCourse] = useState("MBA");
  const [result, setResult] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  function predictCollege() {

  if (rank.trim() === "") {
    setError("Please enter your TG ICET Rank");
    return;
  }

  setError("");
}

 const matchedColleges = colleges
  .filter(
    (college) =>
      college.course === course &&
      college.category === category &&
      college.gender === gender &&
      Number(rank) <= Number(college.cutoff)
  )
  .map((college) => ({
    ...college,
    status: getStatus(rank, college.cutoff),
  }))
  .sort((a, b) => {
    const order = {
      safe: 0,
      moderate: 1,
      risky: 2,
    };

    if (order[a.status] !== order[b.status]) {
      return order[a.status] - order[b.status];
    }

    // Within the same status, sort by cutoff
    return a.cutoff - b.cutoff;
  });

    setResult(matchedColleges);
  }

  function scrollToPredictor() {
    document
      .getElementById("predict")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  const stats = useMemo(() => {
    const safe = result.filter((c) => c.status === "safe").length;
    const moderate = result.filter((c) => c.status === "moderate").length;
    const risky = result.filter((c) => c.status === "risky").length;

    return {
      total: result.length,
      safe,
      moderate,
      risky,
    };
  }, [result]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Blur */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
      >
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-300/40 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <Hero onGetStarted={scrollToPredictor} />

      {/* Main Content */}
      <PageTransition>
        <main className="mx-auto max-w-7xl space-y-16 px-6 pb-24">

          {/* Feature Cards */}
          <FeatureStats />

          {/* Predictor */}
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

          {/* Prediction Summary */}
          {result.length > 0 && <StatsGrid {...stats} />}

          {/* Results */}
          <section id="results">
            <ResultsTable results={result} />
          </section>

        </main>
      </PageTransition>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;