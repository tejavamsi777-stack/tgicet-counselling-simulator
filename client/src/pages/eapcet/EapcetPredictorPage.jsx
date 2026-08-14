import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import ResultsTable from "../../components/results/ResultsTable";
import StatsGrid from "../../components/dashboard/StatsGrid";
import { GlowCard } from "../../components/ui/spotlight-card";
import { GlassButton } from "../../components/ui/glass-button";
import Seo from "../../components/shared/Seo";

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
          category: row.category_code || row.category,
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
        <GlowCard customSize={true} glowColor="purple" className="p-7 sm:p-10">
          <span className="inline-block rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-300 backdrop-blur-sm">
            TG EAPCET 2025
          </span>
          <h1
            className="mt-3 text-3xl font-bold text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            College Predictor
          </h1>

          {initLoading ? (
            <div className="mt-8 flex items-center gap-2 text-sm text-gray-300">
              <Loader2 size={16} className="animate-spin" />
              Loading reference data…
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Field label="Rank">
                  <input
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    type="number"
                    className="h-11 w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-sm text-white backdrop-blur-md outline-none transition placeholder:text-gray-400 focus:border-white/30"
                    placeholder="e.g. 25000"
                  />
                </Field>

                <Field label="Category">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-white/15 bg-[#0d0b18]/90 px-4 text-sm text-white backdrop-blur-md outline-none transition focus:border-white/30"
                  >
                    {sortCategories(reference.categories).map((x) => (
                      <option key={x.code} value={x.code} className="bg-[#0d0b18] text-white">{x.code}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Gender">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-white/15 bg-[#0d0b18]/90 px-4 text-sm text-white backdrop-blur-md outline-none transition focus:border-white/30"
                  >
                    <option value="Male" className="bg-[#0d0b18] text-white">Male</option>
                    <option value="Female" className="bg-[#0d0b18] text-white">Female</option>
                  </select>
                </Field>

                <Field label="Branch">
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-white/15 bg-[#0d0b18]/90 px-4 text-sm text-white backdrop-blur-md outline-none transition focus:border-white/30"
                  >
                    {reference.courses.map((x) => (
                      <option key={x.code} value={x.code} className="bg-[#0d0b18] text-white">
                        {x.code} — {x.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Year">
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-white/15 bg-[#0d0b18]/90 px-4 text-sm text-white backdrop-blur-md outline-none transition focus:border-white/30"
                  >
                    {reference.years.map((x) => (
                      <option key={x.year} value={x.year} className="bg-[#0d0b18] text-white">{x.year}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-8">
                <GlassButton
                  disabled={predicting}
                  onClick={predict}
                  size="default"
                  contentClassName="flex items-center justify-center gap-2"
                >
                  {predicting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Predicting…</span>
                    </>
                  ) : (
                    <span>Predict colleges</span>
                  )}
                </GlassButton>
              </div>

              {error && (
                <p className="mt-3 text-sm font-semibold text-rose-400">{error}</p>
              )}
            </>
          )}
        </GlowCard>
      </section>

      {predicting && (
        <div className="mt-10 flex flex-col items-center gap-3 py-16 text-gray-300">
          <Loader2 size={32} className="animate-spin text-purple-400" />
          <p className="text-sm font-medium">Searching colleges for your rank…</p>
        </div>
      )}

      {!predicting && results.length > 0 && (
        <div className="mt-8 space-y-8">
          <StatsGrid {...stats} />
          <ResultsTable results={results} year={Number(year)} showYear />
        </div>
      )}
    </main>
  );
}
