import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import ResultsTable from "../../components/results/ResultsTable";
import AdSenseUnit from "../../components/ads/AdSenseUnit";
import StatsGrid from "../../components/dashboard/StatsGrid";
import { GlowCard } from "../../components/ui/spotlight-card";
import { GlassButton } from "../../components/ui/glass-button";
import GenderDropdown from "../../components/shared/GenderDropdown";
import CategoryDropdown from "../../components/shared/CategoryDropdown";
import CourseDropdown from "../../components/shared/CourseDropdown";
import YearDropdown from "../../components/shared/YearDropdown";
import PredictionLoader from "../../components/dashboard/PredictionLoader";
import Seo from "../../components/shared/Seo";
import { AnimatePresence, motion } from "framer-motion";

function mapResults(results, gender, year) {
  return results.map((r) => ({
    collegeCode: r.collegeCode,
    collegeName: r.collegeName,
    branchCode: r.branchCode || r.course,
    course: r.branchCode || r.course,
    category: r.category,
    gender: gender || r.gender,
    cutoffRank: r.cutoffRank,
    year: year || r.year,
    district: r.district,
    fee: r.fee,
    university: r.university,
    status: r.status,
    statusPriority: r.statusPriority,
  }));
}

export default function EapcetPredictorPage() {
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("OC");
  const [gender, setGender] = useState("Male");
  const [course, setCourse] = useState("CSE");
  const [activeYears, setActiveYears] = useState([]);
  const [year, setYear] = useState(null);

  const [predicting, setPredicting] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchYears() {
      try {
        const years = await api.get("/years?exam=tg-eapcet");
        if (cancelled) return;
        setActiveYears(years || []);
        if (years && years.length > 0) {
          setYear(years[0].year);
        }
      } catch (err) {
        console.error("Failed to load active years:", err);
      }
    }
    fetchYears();
    return () => {
      cancelled = true;
    };
  }, []);

  async function predict() {
    if (!rank || isNaN(rank) || Number(rank) <= 0) {
      setError("Please enter a valid TG EAPCET Rank.");
      return;
    }
    if (!category) {
      setError("Please select a category.");
      return;
    }
    if (!gender) {
      setError("Please select a gender.");
      return;
    }

    setError("");
    setPredicting(true);
    setResults([]);

    try {
      const [response] = await Promise.all([
        api.post("/predict", {
          rank: Number(rank),
          category,
          gender,
          course: course || undefined,
          year: year || undefined,
          exam: "tg-eapcet",
        }),
        new Promise((resolve) => setTimeout(resolve, 2500)),
      ]);

      const { results: rawResults } = response;
      const mapped = mapResults(rawResults || [], gender, year);
      setResults(mapped);
      if (!mapped || mapped.length === 0) {
        setError("No colleges found matching your criteria. Try adjusting your preferences.");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch predictions.");
    } finally {
      setPredicting(false);
    }
  }

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      if (a.statusPriority !== b.statusPriority) {
        return a.statusPriority - b.statusPriority;
      }
      return a.cutoffRank - b.cutoffRank;
    });
  }, [results]);

  const yearOptions = useMemo(() => {
    return activeYears.map((y) => y.year || y);
  }, [activeYears]);

  return (
    <main className="mx-auto max-w-7xl px-4 pt-4 pb-16 sm:px-6 sm:pt-8 sm:pb-24">
      <Seo
        title="TG EAPCET College Predictor 2025"
        description="Predict TG EAPCET college options by rank, category, gender and engineering branch."
        path="/exams/tg-eapcet/predictor"
      />

      <div className="mb-4">
        <Link
          to="/exams/tg-eapcet"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-300 transition hover:text-white"
        >
          <ArrowLeft size={15} /> TG EAPCET overview
        </Link>
      </div>

      <section>
        <GlowCard customSize={true} glowColor="purple" className="p-4 sm:p-8" tilt={false}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1
              className="text-xl sm:text-2xl font-bold tracking-tight text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Predict Your College
            </h1>
            <span className="inline-block rounded-full border border-purple-500/30 bg-purple-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-purple-300 backdrop-blur-sm">
              TG EAPCET 2025
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-300">
            Enter your rank and branch to explore eligible colleges based on previous year cutoffs.
          </p>

          {/* Responsive Inputs Grid */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* 1. Rank */}
            <div className="relative z-[50]">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-300">
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

            {/* 2. Category & Gender (Combined row on mobile) */}
            <div className="grid grid-cols-2 gap-2.5 sm:contents">
              <div className="relative z-[40]">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Category
                </label>
                <CategoryDropdown category={category} setCategory={setCategory} examSlug="tg-eapcet" />
              </div>

              <div className="relative z-[30]">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Gender
                </label>
                <GenderDropdown gender={gender} setGender={setGender} />
              </div>
            </div>

            {/* 3. Branch */}
            <div className="relative z-[20]">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Branch
              </label>
              <CourseDropdown course={course} setCourse={setCourse} examSlug="tg-eapcet" />
            </div>

            {/* 4. Year */}
            <div className="relative z-[10]">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Cutoff Year
              </label>
              <YearDropdown year={year} setYear={setYear} years={yearOptions.length > 0 ? yearOptions : [2025]} />
            </div>
          </div>

          {error && (
            <p className="mt-3 text-xs sm:text-sm font-semibold text-rose-400">{error}</p>
          )}

          {/* Predict Button */}
          <div className="relative z-[1] mt-5 sm:mt-7 flex justify-center">
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
            onComplete={() => {}}
            collegeCount={results.length}
            safeMatchesCount={results.filter((r) => r.status === "safe").length}
            minimumDurationMs={2500}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!predicting && sortedResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 space-y-8"
          >
            <StatsGrid results={sortedResults} />
            <ResultsTable
              results={sortedResults}
              activeYears={activeYears}
              selectedYear={year}
              onYearChange={(newYear) => {
                setYear(newYear);
                predict();
              }}
            />
            {/* Passive ad unit placed safely below prediction results */}
            <AdSenseUnit slotName="predictorResults" minHeight={90} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
