import { useState, useMemo, useRef, useEffect } from "react";
import {
  Sparkles,
  Search,
  Building,
  GraduationCap,
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Layers
} from "lucide-react";
import Seo from "../../components/shared/Seo";
import { GlassButton } from "../../components/ui/glass-button";
import { pgecetApi } from "../../lib/pgecetApi";
import { PGECET_BRANCHES } from "../../data/pgecetInstitutions";
import SearchableSelect from "../../components/shared/SearchableSelect";
import { smoothScrollTo } from "../../lib/utils";

const CATEGORIES = ["OC", "EWS", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC", "ST"];
const PAGE_SIZE = 20;

export default function PgecetPredictorPage() {
  const [rank, setRank] = useState("");
  const [gateScore, setGateScore] = useState("");
  const [category, setCategory] = useState("OC");
  const [gender, setGender] = useState("M");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [hasPredicted, setHasPredicted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Table state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Ref for results auto-scrolling
  const resultsRef = useRef(null);

  // Smooth scroll to results table when predictions are loaded
  useEffect(() => {
    if (hasPredicted && predictions.length > 0 && resultsRef.current) {
      smoothScrollTo(resultsRef, 80);
    }
  }, [hasPredicted, predictions]);

  const handlePredict = async (e) => {
    e.preventDefault();
    const isGate = Boolean(gateScore);
    const value = isGate ? gateScore : rank;

    if (!value || Number(value) <= 0) return;

    setLoading(true);
    try {
      const res = await pgecetApi.predict(value, isGate, category, gender, selectedBranch);
      setPredictions(res.data || []);
      setHasPredicted(false); // reset pagination and filters on new prediction
      setCurrentPage(1);
      setStatusFilter("all");
      setSearchQuery("");
      setHasPredicted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Mutually exclusive clear/set
  const handleRankChange = (val) => {
    setRank(val);
    if (val) setGateScore("");
  };

  const handleGateChange = (val) => {
    setGateScore(val);
    if (val) setRank("");
  };

  // Filter & Search Prediction Results
  const filteredPredictions = useMemo(() => {
    let list = predictions;

    // 1. Status Filter
    if (statusFilter !== "all") {
      list = list.filter((p) => {
        if (statusFilter === "safe") return p.probability >= 75;
        if (statusFilter === "moderate") return p.probability >= 50 && p.probability < 75;
        if (statusFilter === "risky") return p.probability < 50;
        return true;
      });
    }

    // 2. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.college_name.toLowerCase().includes(q) ||
          p.college_code.toLowerCase().includes(q) ||
          p.branch_name.toLowerCase().includes(q)
      );
    }

    return list;
  }, [predictions, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPredictions.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPredictions.slice(start, start + PAGE_SIZE);
  }, [filteredPredictions, currentPage]);

  // Counts for filters
  const counts = useMemo(() => {
    return {
      total: predictions.length,
      safe: predictions.filter((p) => p.probability >= 75).length,
      moderate: predictions.filter((p) => p.probability >= 50 && p.probability < 75).length,
      risky: predictions.filter((p) => p.probability < 50).length,
    };
  }, [predictions]);

  // Export CSV helper
  const exportToCSV = () => {
    if (!predictions.length) return;
    const headers = ["College Code", "College Name", "Branch / Specialization", "Admitted By", "Cutoff Quota", "Opening Range", "Closing Range", "Chances"];
    const rows = predictions.map(p => [
      p.college_code,
      `"${p.college_name.replace(/"/g, '""')}"`,
      `"${p.branch_name}"`,
      p.isGate ? "GATE" : "TG PGECET",
      p.allotted_category,
      p.min_val,
      p.max_val,
      p.chance
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tg_pgecet_predictions_${category}_${gender}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const branchOptions = useMemo(() => {
    return [
      { value: "", label: "All Specializations (AI/ML, CSE, VLSI, Civil, Mechanical...)" },
      ...PGECET_BRANCHES.map((b) => ({
        value: b.code,
        label: `${b.code} — ${b.name}`,
      })),
    ];
  }, []);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:px-10 sm:py-12 pb-72 md:pb-96 space-y-12">
      <Seo
        title="TG PGECET 2027 College Predictor | Predict M.Tech & M.Pharm Colleges by Rank"
        description="Predict eligible M.Tech, M.Pharm & M.Arch colleges based on your TG PGECET / GATE / GPAT 2027 rank and specialization across Osmania & JNTU."
        keywords="tg pgecet college predictor 2027, ts pgecet m.tech college predictor by rank, gate pgecet cutoff ranks ou jntuh, tg pgecet 2027 cutoffs"
        path="/tg-pgecet/predictor"
        toolType="predictor"
        examName="TG PGECET"
      />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-300">
          <Sparkles size={14} className="text-cyan-400" />
          <span>Dual Rank &amp; Score Predictor</span>
        </div>
        <h1
          className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          TG PGECET College Predictor
        </h1>
        <p className="mt-3 text-sm sm:text-base text-gray-300">
          Enter your GATE score OR your TG PGECET rank to predict M.Tech, M.E., and M.Arch admission chances.
        </p>
      </div>

      {/* Inputs Form */}
      <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-[#130b24]/90 via-[#180f2d]/90 to-[#0d0718]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl max-w-3xl mx-auto">
        <form onSubmit={handlePredict} className="space-y-6">
          
          {/* Dual Input Fields row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* TG PGECET Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-300">
                Your TG PGECET Rank
              </label>
              <input
                type="number"
                min="1"
                placeholder={gateScore ? "Disabled (using GATE Score)" : "e.g. 1450"}
                value={rank}
                disabled={Boolean(gateScore)}
                onChange={(e) => handleRankChange(e.target.value)}
                required={!gateScore}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3.5 text-base font-mono font-bold text-cyan-300 placeholder:text-white/20 focus:border-purple-400 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-white/[0.02]"
              />
            </div>

            {/* GATE Score Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
                Your GATE Score
              </label>
              <input
                type="number"
                min="100"
                max="1000"
                placeholder={rank ? "Disabled (using PGECET Rank)" : "e.g. 520"}
                value={gateScore}
                disabled={Boolean(rank)}
                onChange={(e) => handleGateChange(e.target.value)}
                required={!rank}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3.5 text-base font-mono font-bold text-amber-400 placeholder:text-white/20 focus:border-amber-400 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-white/[0.02]"
              />
            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-[#1a1033] px-3.5 py-3 text-sm font-semibold text-white focus:border-purple-400 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                Gender
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender("M")}
                  className={`flex-1 rounded-2xl border py-3 text-sm font-bold transition ${
                    gender === "M"
                      ? "border-sky-500 bg-sky-500/20 text-sky-300"
                      : "border-white/10 bg-black/40 text-white/60 hover:bg-white/5"
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setGender("F")}
                  className={`flex-1 rounded-2xl border py-3 text-sm font-bold transition ${
                    gender === "F"
                      ? "border-pink-500 bg-pink-500/20 text-pink-300"
                      : "border-white/10 bg-black/40 text-white/60 hover:bg-white/5"
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
          </div>

          <div className="relative z-40">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
              Target Specialization (Optional)
            </label>
            <SearchableSelect
              options={branchOptions}
              value={selectedBranch}
              onChange={setSelectedBranch}
              placeholder="All Specializations (AI/ML, CSE, VLSI, Civil, Mechanical...)"
              searchPlaceholder="Type to search specialization..."
            />
          </div>

          <div className="pt-2 text-center">
            <GlassButton
              type="submit"
              disabled={loading || (!rank && !gateScore)}
              className="w-full justify-center py-3.5 text-base font-bold text-white shadow-lg shadow-purple-900/50"
            >
              {loading ? "Analyzing Cutoffs..." : "Predict PG Colleges Now"}
            </GlassButton>
          </div>
        </form>
      </div>

      {/* Results Section Table */}
      {hasPredicted && (
        <div ref={resultsRef} className="space-y-6 scroll-mt-6">
          
          {/* Header & Export Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                Prediction Results
                <span className="rounded-full bg-white/10 border border-white/10 px-2.5 py-0.5 text-xs font-mono text-cyan-300">
                  {filteredPredictions.length} found
                </span>
              </h2>
              <p className="text-xs text-white/50 mt-1">
                {gateScore ? `GATE Score: ${gateScore}` : `PGECET Rank: #${rank}`} · {category} · {gender === "F" ? "Female" : "Male"}
              </p>
            </div>
            {predictions.length > 0 && (
              <button
                type="button"
                onClick={exportToCSV}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/25 transition cursor-pointer"
              >
                <Download size={14} /> Export Results (CSV)
              </button>
            )}
          </div>

          {/* Search and Quick Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Search Box */}
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 text-white/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search college code, name or branch..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-white/15 bg-white/5 pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:border-purple-500 focus:outline-none transition"
              />
            </div>

            {/* Probability filter pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}
                className={`rounded-xl px-3 py-1.5 border transition cursor-pointer ${
                  statusFilter === "all"
                    ? "border-white/30 bg-white/10 text-white font-bold"
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                All ({counts.total})
              </button>
              <button
                type="button"
                onClick={() => { setStatusFilter("safe"); setCurrentPage(1); }}
                className={`flex items-center gap-1 rounded-xl px-3 py-1.5 border transition cursor-pointer ${
                  statusFilter === "safe"
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold"
                    : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10"
                }`}
              >
                <CheckCircle2 size={13} /> Safe ({counts.safe})
              </button>
              <button
                type="button"
                onClick={() => { setStatusFilter("moderate"); setCurrentPage(1); }}
                className={`flex items-center gap-1 rounded-xl px-3 py-1.5 border transition cursor-pointer ${
                  statusFilter === "moderate"
                    ? "border-amber-500 bg-amber-500/20 text-amber-300 font-bold"
                    : "border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10"
                }`}
              >
                <AlertTriangle size={13} /> Moderate ({counts.moderate})
              </button>
              <button
                type="button"
                onClick={() => { setStatusFilter("risky"); setCurrentPage(1); }}
                className={`flex items-center gap-1 rounded-xl px-3 py-1.5 border transition cursor-pointer ${
                  statusFilter === "risky"
                    ? "border-rose-500 bg-rose-500/20 text-rose-300 font-bold"
                    : "border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10"
                }`}
              >
                <Flame size={13} /> Risky ({counts.risky})
              </button>
            </div>

          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-white/5 text-[11px] font-bold uppercase tracking-wider text-white/50 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">College</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Admitted By</th>
                  <th className="py-3 px-4">Quota</th>
                  <th className="py-3 px-4 text-center">
                    {gateScore ? "Admitted GATE Scores" : "Admitted PGECET Ranks"}
                  </th>
                  <th className="py-3 px-4 text-center">Chance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-white/30 text-sm">
                      No colleges match your active search or filter.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((p, idx) => {
                    const rowNum = (currentPage - 1) * PAGE_SIZE + idx + 1;
                    return (
                      <tr key={`${p.college_code}_${p.branch_name}_${idx}`} className="hover:bg-white/[0.02] transition">
                        <td className="py-3 px-4 font-mono text-white/40">{rowNum}</td>
                        <td className="py-3 px-4">
                          <span className="inline-block rounded-md bg-white/5 border border-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-white/80 mr-2">
                            {p.college_code}
                          </span>
                          <span className="font-semibold text-white">{p.college_name}</span>
                        </td>
                        <td className="py-3 px-4 text-purple-300 font-medium">{p.branch_name}</td>
                        <td className="py-3 px-4 font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.isGate
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          }`}>
                            {p.isGate ? "GATE" : "TG PGECET"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-white/60">{p.allotted_category}</td>
                        <td className="py-3 px-4 text-center font-mono font-semibold">
                          {p.isGate ? (
                            <span className="text-amber-400">
                              {p.min_val} → {p.max_val}
                            </span>
                          ) : (
                            <span className="text-cyan-400">
                              #{p.min_val} → #{p.max_val}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block rounded-full border px-3 py-1 text-[11px] font-bold ${
                            p.probability >= 75
                              ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                              : p.probability >= 50
                              ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                              : "border-rose-500/40 bg-rose-500/20 text-rose-300"
                          }`}>
                            {p.chance}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs">
              <p className="text-white/40">
                Showing {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, filteredPredictions.length)} of {filteredPredictions.length} results
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-white/70">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </main>
  );
}
