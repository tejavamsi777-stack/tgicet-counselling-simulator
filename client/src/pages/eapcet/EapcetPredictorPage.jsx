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

export default function EapcetPredictorPage() {
  const [reference, setReference] = useState({
    courses: [],
    categories: [],
    years: [],
  });
  const [initLoading, setInitLoading] = useState(true);

  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("Male");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");

  const [predicting, setPredicting] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.getPublicReference("tg-eapcet");
        if (!mounted) return;
        const years = (res.years || []).map((y) => Number(y)).filter((y) => !Number.isNaN(y));
        const preferredYear = years.includes(2025) ? 2025 : years[0] || 2025;
        const mappedCategories = (res.categories || []).map((c) =>
          typeof c === "string" ? { code: c, name: c } : c
        );
        const mappedCourses = (res.courses || []).map((c) =>
          typeof c === "string" ? { code: c, name: c } : c
        );

        setReference({
          courses: mappedCourses,
          categories: mappedCategories,
          years: years.length ? years : [2025],
        });

        const initialCategory = mappedCategories.some((c) => c.code === "OC")
          ? "OC"
          : mappedCategories[0]?.code || "OC";
        const initialCourse = mappedCourses.some((c) => c.code === "CSE")
          ? "CSE"
          : mappedCourses[0]?.code || "";

        setCategory(initialCategory);
        setCourse(initialCourse);
        setYear(String(preferredYear));
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load reference data");
          setReference({
            courses: [{ code: "CSE", name: "Computer Science and Engineering" }],
            categories: [{ code: "OC", name: "OC" }],
            years: [2025],
          });
          setCategory("OC");
          setCourse("CSE");
          setYear("2025");
        }
      } finally {
        if (mounted) setInitLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function predict() {
    setError("");
    const numericRank = Number(rank);
    if (!rank || Number.isNaN(numericRank) || numericRank <= 0) {
      setError("Please enter a valid rank.");
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

    setPredicting(true);
    setResults([]);

    try {
      const payload = {
        rank: numericRank,
        category,
        gender,
        year: Number(year) || undefined,
        course: course || undefined,
      };

      const data = await api.predictColleges("tg-eapcet", payload);
      setResults(data.results || []);
      if (!data.results || data.results.length === 0) {
        setError("No colleges found matching your criteria. Try adjusting your preferences.");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch predictions.");
    } finally {
      setPredicting(false);
    }
  }

  const stats = useMemo(
    () => ({
      total: results.length,
      safe: results.filter((r) => r.status === "safe").length,
      moderate: results.filter((r) => r.status === "moderate").length,
      risky: results.filter((r) => r.status === "risky").length,
    }),
    [results]
  );

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

          {initLoading ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-300">
              <Loader2 size={16} className="animate-spin" />
              Loading reference data…
            </div>
          ) : (
            <>
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
                  <YearDropdown year={year} setYear={setYear} years={reference.years} />
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
            </>
          )}
        </GlowCard>
      </section>

      <AnimatePresence>
        {predicting && (
          <PredictionLoader
            examSlug="tg-eapcet"
            onComplete={() => {}}
            collegeCount={results.length}
            safeMatchesCount={stats.safe}
            minimumDurationMs={2500}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!predicting && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 space-y-8"
          >
            <StatsGrid {...stats} />
            <ResultsTable results={results} year={Number(year)} showYear />
            {/* Passive ad unit placed safely below prediction results */}
            <AdSenseUnit slotName="predictorResults" minHeight={90} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
