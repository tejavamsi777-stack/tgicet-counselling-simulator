import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Calendar,
  Sparkles,
} from "lucide-react";
import { GlowCard } from "../ui/spotlight-card";
import { GlassButton } from "../ui/glass-button";
import StatusBadge from "./StatusBadge";
import ExportButtons from "./ExportButtons";
import ConfidenceBar from "./ConfidenceBar";
import { getDistrictName } from "../../utils/districtNames";
import { strictMultiFieldMatch } from "../../utils/searchMatch";

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100];
const DEFAULT_PAGE_SIZE = 25;

// Expand university abbreviations to full names
const UNIVERSITY_NAMES = {
  JNTUH: "JNTU Hyderabad",
  JNTUK: "JNTU Kakinada",
  JNTUA: "JNTU Anantapur",
  OU: "Osmania University",
  KU: "Kakatiya University",
  SVU: "SV University",
  AU: "Andhra University",
  SKU: "SK University",
  ANU: "Acharya Nagarjuna Univ.",
  PLMU: "Palamuru University",
  TU: "Telangana University",
  MGU: "Mahatma Gandhi Univ.",
  MSU: "Mahatma Gandhi Univ.",
  RBVRR: "RBVRR Women's College",
};

function getUniversityName(code) {
  if (!code || code === "-") return "-";
  return UNIVERSITY_NAMES[code.toString().trim().toUpperCase()] || code;
}

function SortHeader({ label, sortKeyName, sortKey, sortDir, onToggleSort, className }) {
  const active = sortKey === sortKeyName;
  return (
    <th
      onClick={() => onToggleSort(sortKeyName)}
      className={`cursor-pointer select-none px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-white transition-colors ${
        className ?? ""
      }`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
      </span>
    </th>
  );
}

export default function ResultsTable({
  results = [],
  year,
  showYear = false,
  activeYears = [],
  selectedYear,
  onYearChange,
  examTitle = "Vuela Learn",
  studentRank = 0,
  onCreateWebOptions,
}) {
  // Extract available years from results
  const yearList = useMemo(() => {
    const set = new Set();
    for (const r of results) {
      if (r.year) set.add(Number(r.year));
    }
    if (set.size === 0 && (selectedYear || year)) {
      set.add(Number(selectedYear || year));
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [results, selectedYear, year]);

  const [activeYearTab, setActiveYearTab] = useState(
    selectedYear ? String(selectedYear) : ""
  );
  const [activeCourseTab, setActiveCourseTab] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("statusPriority");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const currentYearTab =
    activeYearTab && yearList.some((y) => String(y) === String(activeYearTab))
      ? activeYearTab
      : (yearList[0] ? String(yearList[0]) : "");

  // Show University column only when at least one result has real affiliation data
  const hasUniversityData = useMemo(() =>
    results.some((r) => {
      const u = (r.university || "").toString().trim();
      return u && u !== "-";
    }),
  [results]);

  // 1. Filter by Year first
  const yearFiltered = useMemo(() => {
    if (!currentYearTab) return results;
    return results.filter((r) => String(r.year) === String(currentYearTab));
  }, [results, currentYearTab]);

  // 2. Group and count available branches for the current year
  const branchList = useMemo(() => {
    const map = new Map();
    for (const r of yearFiltered) {
      const code = (r.course || r.course_code || "GENERAL").toString().trim().toUpperCase();
      const name = r.courseName || r.course_name || code;
      if (!map.has(code)) {
        map.set(code, { code, name, count: 0 });
      }
      map.get(code).count += 1;
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [yearFiltered]);

  const currentCourseTab =
    activeCourseTab && branchList.some((b) => b.code === activeCourseTab)
      ? activeCourseTab
      : branchList[0]?.code || "";

  // 3. Filter by selected course/branch
  const courseFiltered = useMemo(() => {
    if (!currentCourseTab) return yearFiltered;
    return yearFiltered.filter(
      (r) =>
        (r.course || r.course_code || "").toString().trim().toUpperCase() === currentCourseTab
    );
  }, [yearFiltered, currentCourseTab]);

  // 4. Filter by status (Safe / Moderate / Risky)
  const statusFiltered = useMemo(() => {
    if (statusFilter === "all" || !statusFilter) return courseFiltered;
    return courseFiltered.filter((r) => r.status === statusFilter);
  }, [courseFiltered, statusFilter]);

  // 5. Apply strict prefix & word-boundary search query and sorting
  const finalFiltered = useMemo(() => {
    const term = search.trim();
    let rows = term
      ? statusFiltered.filter((c) => {
          const fields = [
            c.name,
            c.code,
            c.college_code,
            c.college_name,
            c.course,
            c.courseName,
            c.place,
            c.district ? getDistrictName(c.district) : null,
            c.district
          ].filter(Boolean);
          return strictMultiFieldMatch(fields, term);
        })
      : statusFiltered;

    rows = [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === "number" ? av - bv : String(av || "").localeCompare(String(bv || ""));
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [statusFiltered, search, sortKey, sortDir]);

  const effectivePageSize = pageSize === 0 ? finalFiltered.length || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(finalFiltered.length / effectivePageSize));
  const pageRows = finalFiltered.slice((page - 1) * effectivePageSize, page * effectivePageSize);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleYearTabChange(yVal) {
    setActiveYearTab(yVal);
    if (onYearChange) {
      onYearChange(Number(yVal));
    }
    setPage(1);
  }

  function handleCourseTabChange(code) {
    setActiveCourseTab(code);
    setPage(1);
  }

  // Active view breakdown statistics
  const safeCount = courseFiltered.filter((r) => r.status === "safe").length;
  const moderateCount = courseFiltered.filter((r) => r.status === "moderate").length;
  const riskyCount = courseFiltered.filter((r) => r.status === "risky").length;

  if (!results.length) {
    return (
      <GlowCard customSize={true} glowColor="purple" className="p-10 text-center">
        <p className="text-base text-gray-300">
          Enter your rank and preferences above, then click{" "}
          <span className="font-bold text-white">Predict Colleges</span> to see results.
        </p>
      </GlowCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Unified Results Table Card */}
      <GlowCard customSize={true} glowColor="purple" className="overflow-hidden p-0" tilt={false}>
        {/* Table Header: Year Selection (Above) & Branch Selection (Below) */}
        <div className="border-b border-white/10 bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-transparent p-4 sm:p-5 space-y-4">
          
          {/* Row 1: Cutoff Year Filter (Placed ABOVE branch filter, aligned left, individual years) */}
          {(yearList.length > 1 || activeYears.length > 1) && (
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
              {yearList.map((yVal) => {
                const isSelected = String(currentYearTab) === String(yVal);
                return (
                  <button
                    key={yVal}
                    type="button"
                    onClick={() => handleYearTabChange(String(yVal))}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-purple-600/60 text-white border border-purple-400/60 shadow-[0_4px_16px_rgba(147,51,234,0.4)] font-bold"
                        : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    <Calendar size={13} className={isSelected ? "text-purple-200" : "text-gray-400"} />
                    <span>{yVal}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Row 2: Branch Selection & Interactive Status Summary */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Courses / Branches Switcher Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {branchList.map((branch) => {
                const isSelected = currentCourseTab === branch.code;
                return (
                  <button
                    key={branch.code}
                    type="button"
                    onClick={() => handleCourseTabChange(branch.code)}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-purple-600/60 text-white border border-purple-400/60 shadow-[0_4px_16px_rgba(147,51,234,0.4)] font-bold"
                        : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    <BookOpen size={13} className={isSelected ? "text-purple-200" : "text-gray-400"} />
                    <span>{branch.code}</span>
                    <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                      {branch.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Clickable Status Filter Buttons — hidden on mobile */}
            <div className="hidden sm:flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("all");
                  setPage(1);
                }}
                className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-white/25 text-white border border-white/40 shadow-sm font-bold"
                    : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/15 hover:text-white"
                }`}
                title="Show all eligible colleges"
              >
                All ({courseFiltered.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter(statusFilter === "safe" ? "all" : "safe");
                  setPage(1);
                }}
                className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === "safe"
                    ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.3)] font-bold"
                    : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20"
                }`}
                title="Filter high admission probability colleges"
              >
                <CheckCircle2 size={13} /> {safeCount} Safe
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter(statusFilter === "moderate" ? "all" : "moderate");
                  setPage(1);
                }}
                className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === "moderate"
                    ? "bg-amber-500/30 text-amber-200 border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.3)] font-bold"
                    : "bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
                }`}
                title="Filter competitive cutoffs"
              >
                <AlertTriangle size={13} /> {moderateCount} Moderate
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter(statusFilter === "risky" ? "all" : "risky");
                  setPage(1);
                }}
                className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === "risky"
                    ? "bg-rose-500/30 text-rose-200 border border-rose-400/60 shadow-[0_0_12px_rgba(244,63,94,0.3)] font-bold"
                    : "bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20"
                }`}
                title="Filter ambitious cutoff targets"
              >
                <Flame size={13} /> {riskyCount} Risky
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Export Bar */}
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between bg-white/[0.02]">
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto flex-1 sm:max-w-xl">
            <div className="relative w-full sm:w-64 md:w-72">
              <SearchIcon
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                placeholder="Search college, district, branch..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-9 w-full rounded-xl border border-white/15 bg-white/5 pl-9 pr-4 text-xs text-white placeholder-gray-400 outline-none transition focus:border-white/40 focus:bg-white/10"
              />
            </div>
            {onCreateWebOptions && (
              <div className="relative inline-flex items-center">
                {/* Floating Animated "Must Try" Badge */}
                <motion.span
                  animate={{ y: [0, -3, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute -top-2.5 -right-1 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-md shadow-black/60 border border-white/50 ring-1 ring-amber-300/60"
                >
                  <Flame size={10} className="text-yellow-200 fill-yellow-200" />
                  <span>TRENDING!</span>
                </motion.span>

                <GlassButton
                  onClick={onCreateWebOptions}
                  variant="red"
                  size="md"
                  className="w-full sm:w-auto shrink-0"
                  contentClassName="flex items-center justify-center gap-2 font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 whitespace-nowrap"
                >
                  <Sparkles size={15} className="text-white" />
                  <span>Create Web Options</span>
                </GlassButton>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Per-page selector — placed at top of table */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 whitespace-nowrap">Show:</span>
              <div className="flex items-center gap-1">
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { setPageSize(opt); setPage(1); }}
                    className={`h-7 min-w-[36px] rounded-lg border px-2 text-xs font-semibold transition-all ${
                      pageSize === opt
                        ? "border-purple-400/60 bg-purple-600/40 text-white"
                        : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setPageSize(0); setPage(1); }}
                  className={`h-7 rounded-lg border px-2 text-xs font-semibold transition-all ${
                    pageSize === 0
                      ? "border-purple-400/60 bg-purple-600/40 text-white"
                      : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  All
                </button>
              </div>
            </div>
            <ExportButtons results={finalFiltered} examTitle={examTitle} />
          </div>
        </div>

        {/* Single Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300">
                  #
                </th>
                <SortHeader label="College" sortKeyName="name" sortKey={sortKey} sortDir={sortDir} onToggleSort={toggleSort} />
                <SortHeader label="District" sortKeyName="district" sortKey={sortKey} sortDir={sortDir} onToggleSort={toggleSort} />
                <SortHeader label="Branch" sortKeyName="course" sortKey={sortKey} sortDir={sortDir} onToggleSort={toggleSort} />
                <SortHeader label="Category" sortKeyName="category" sortKey={sortKey} sortDir={sortDir} onToggleSort={toggleSort} />
                <SortHeader label="Gender" sortKeyName="gender" sortKey={sortKey} sortDir={sortDir} onToggleSort={toggleSort} />
                <SortHeader label="Cutoff Rank" sortKeyName="cutoff" sortKey={sortKey} sortDir={sortDir} onToggleSort={toggleSort} />
                {hasUniversityData && (
                  <SortHeader label="University" sortKeyName="university" sortKey={sortKey} sortDir={sortDir} onToggleSort={toggleSort} />
                )}
                <SortHeader label="Status" sortKeyName="statusPriority" sortKey={sortKey} sortDir={sortDir} onToggleSort={toggleSort} />
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 min-w-[90px]">
                  Chance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-xs text-gray-400">
                    No colleges found matching &ldquo;{search}&rdquo;
                  </td>
                </tr>
              ) : (
                pageRows.map((c, i) => (
                  <tr
                    key={`${c.code}-${c.category}-${c.gender}-${c.course}-${c.year}-${i}`}
                    className="transition-colors hover:bg-white/5"
                  >
                    <td className="px-4 py-3.5 text-xs text-gray-400 font-mono">
                      {(page - 1) * effectivePageSize + i + 1}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-white">
                      {c.name}
                      {c.place && <span className="block text-xs font-normal text-gray-400">{c.place}</span>}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-300">
                      {getDistrictName(c.district) || c.district}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <span className="inline-block rounded-md bg-purple-500/20 px-2 py-0.5 font-semibold text-purple-300">
                        {c.course}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-300">{c.category || "-"}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-300">{c.gender || "All"}</td>
                    <td className="px-4 py-3.5 text-xs font-bold text-purple-300 font-mono">
                      {Number(c.cutoff || 0).toLocaleString()}
                    </td>
                    {hasUniversityData && (
                      <td className="px-4 py-3.5 text-xs text-gray-300">{getUniversityName(c.university)}</td>
                    )}
                    <td className="px-4 py-3.5 text-xs">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <ConfidenceBar studentRank={studentRank} cutoff={c.cutoff} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-white/10 p-4 bg-white/[0.02]">
          {/* Left: showing count */}
          <p className="text-xs text-gray-400">
            {pageSize === 0
              ? `Showing all ${finalFiltered.length} colleges`
              : `Showing ${Math.min((page - 1) * effectivePageSize + 1, finalFiltered.length)}–${Math.min(page * effectivePageSize, finalFiltered.length)} of ${finalFiltered.length}`}
          </p>

          {/* Right: prev / page / next */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || pageSize === 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs font-medium text-gray-300">
              {pageSize === 0 ? "All" : `Page ${page} of ${totalPages}`}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || pageSize === 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </GlowCard>
    </motion.div>
  );
}