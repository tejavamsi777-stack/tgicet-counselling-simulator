import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import ResultsTable from "../../components/results/ResultsTable";
import AdSenseUnit from "../../components/ads/AdSenseUnit";
import StatsGrid from "../../components/dashboard/StatsGrid";
import { GlowCard } from "../../components/ui/spotlight-card";
import { GlassButton } from "../../components/ui/glass-button";
import Seo from "../../components/shared/Seo";
import { motion, AnimatePresence } from "framer-motion";
import CategoryDropdown from "../../components/shared/CategoryDropdown";
import GenderDropdown from "../../components/shared/GenderDropdown";
import CourseDropdown from "../../components/shared/CourseDropdown";
import YearDropdown from "../../components/shared/YearDropdown";
import PredictionLoader from "../../components/dashboard/PredictionLoader";

const CATEGORY_ORDER = [
  "OC", "EWS",
  "BC_A", "BC-A", "BCA",
  "BC_B", "BC-B", "BCB",
  "BC_C", "BC-C", "BCC",
  "BC_D", "BC-D", "BCD",
  "BC_E", "BC-E", "BCE",
  "SC_I",  "SC-I",  "SC1",  "SC_1",
  "SC_II", "SC-II", "SC2",  "SC_2",
  "SC_III","SC-III","SC3",  "SC_3",
  "SC",
  "ST",
];

function categoryRank(code) {
  const idx = CATEGORY_ORDER.findIndex(
    (c) => c.toUpperCase() === (code ?? "").toUpperCase()
  );
  return idx === -1 ? 999 : idx;
}

function sortCategories(cats) {
  return [...cats].sort((a, b) => categoryRank(a.code) - categoryRank(b.code));
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-300">
      {label}
      {children}
    </label>
  );
}

export default function EapcetPredictorPage() {
  const [reference, setReference] = useState({ years: [], categories: [], courses: [] });
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("Male");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [initLoading, setInitLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get("/years?exam=tg-eapcet"),
      api.get("/categories?exam=tg-eapcet"),
      api.get("/courses?exam=tg-eapcet"),
    ])
      .then(([years, categories, courses]) => {
        if (!cancelled) {
          setReference({ years, categories, courses });
          setYear(String(years[0]?.year ?? ""));
          setCategory(categories[0]?.code ?? "");
          setCourse(courses[0]?.code ?? "");
        }
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setInitLoading(false));
    return () => { cancelled = true; };
  }, []);

  async function predict() {
    if (!rank || Number(rank) <= 0) return setError("Enter a valid TG EAPCET rank.");
    setError("");
    setPredicting(true);
    try {
      const [response] = await Promise.all([
        api.post("/predict", {
          exam: "tg-eapcet",
          rank,
          category,
          gender,
          course,
          year: Number(year),
        }),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
      const rawResults = Array.isArray(response) ? response : (response.results || []);
      setResults(
        rawResults.map((row) => ({
          ...row,
          district: row.district_code || row.district,
          course: row.course_code || row.course,
          category: row.category_code || row.category || category,
          gender: row.gender || gender,
          year: Number(year),
          cutoff: row.cutoff_rank || row.cutoff,
        }))
      );
    } catch (e) {
      setError(e.message || "Prediction failed.");
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
    <main className="mx-auto max-w-7xl px-6 py-10">
      <Seo
        title="TG EAPCET College Predictor 2025"
        description="Predict TG EAPCET college options by rank, category, gender and engineering branch."
        path="/exams/tg-eapcet/predictor"
      />

      <Link
        to="/exams/tg-eapcet"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-300 transition hover:text-white"
      >
        <ArrowLeft size={16} /> TG EAPCET overview
      </Link>

      <section className="mt-6">
        <GlowCard customSize={true} glowColor="purple" className="p-6 sm:p-10" tilt={false}>
          <div className="space-y-2">
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Predict Your College
            </h1>
            <div>
              <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-purple-300 backdrop-blur-sm">
                TG EAPCET 2025
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-300">
              Enter your rank and branch to explore eligible colleges based on previous year cutoffs.
            </p>
          </div>

          {initLoading ? (
            <div className="mt-8 flex items-center gap-2 text-sm text-gray-300">
              <Loader2 size={16} className="animate-spin" />
              Loading reference data…
            </div>
          ) : (
            <>
              {/* Responsive Inputs Grid */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {/* 1. Rank */}
                <div className="relative z-[50]">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
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

                {/* 2. Category & Gender (Side-by-side row on mobile) */}
                <div className="grid grid-cols-2 gap-3 sm:contents">
                  <div className="relative z-[40]">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                      Category
                    </label>
                    <CategoryDropdown category={category} setCategory={setCategory} examSlug="tg-eapcet" />
                  </div>

                  <div className="relative z-[30]">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                      Gender
                    </label>
                    <GenderDropdown gender={gender} setGender={setGender} />
                  </div>
                </div>

                {/* 3. Branch */}
                <div className="relative z-[20]">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Branch
                  </label>
                  <CourseDropdown course={course} setCourse={setCourse} examSlug="tg-eapcet" />
                </div>

                {/* 4. Cutoff Year */}
                <div className="relative z-[10]">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Cutoff Year
                  </label>
                  <YearDropdown year={year} setYear={setYear} years={reference.years} />
                </div>
              </div>

              {error && (
                <p className="mt-4 text-xs sm:text-sm font-semibold text-rose-400">{error}</p>
              )}

              {/* Predict Button */}
              <div className="relative z-[1] mt-7 flex justify-center">
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
