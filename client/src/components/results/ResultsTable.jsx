import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search as SearchIcon } from "lucide-react";
import { GlowCard } from "../ui/spotlight-card";
import StatusBadge from "./StatusBadge";
import ExportButtons from "./ExportButtons";
import { getDistrictName } from "../../utils/districtNames";

const PAGE_SIZE = 20;

export default function ResultsTable({
  results,
  year,
  showYear = false,
  activeYears = [],
  selectedYear,
  onYearChange,
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("statusPriority");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const currentYear = selectedYear ?? year;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let rows = term
      ? results.filter((c) => c.name.toLowerCase().includes(term))
      : results;

    rows = [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [results, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function SortHeader({ label, sortKeyName, className }) {
    const active = sortKey === sortKeyName;
    return (
      <th
        onClick={() => toggleSort(sortKeyName)}
        className={`cursor-pointer select-none px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-white ${className ?? ""}`}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {active && (sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
        </span>
      </th>
    );
  }

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
      {activeYears && activeYears.length >= 2 && onYearChange && (
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm font-bold text-white tracking-wide">Cutoff Year:</span>
          <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
            {activeYears.map((y) => (
              <button
                key={y.year}
                onClick={() => onYearChange(y.year)}
                className={`rounded-full px-5 py-1.5 text-sm font-semibold transition-all duration-200 ${
                  currentYear === y.year
                    ? "bg-white/25 text-white shadow-[0_4px_20px_rgba(124,58,237,0.4),inset_0_1px_0_0_rgba(255,255,255,0.5)] border border-white/30"
                    : "text-gray-300 hover:bg-white/15 hover:text-white"
                }`}
              >
                {y.year}
              </button>
            ))}
          </div>
        </div>
      )}

      <GlowCard customSize={true} glowColor="purple" className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search college name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 text-xs text-white placeholder-gray-400 outline-none transition focus:border-white/30"
            />
          </div>
          <ExportButtons results={filtered} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300">#</th>
                <SortHeader label="College" sortKeyName="name" />
                <SortHeader label="District" sortKeyName="district" />
                <SortHeader label="Course" sortKeyName="course" />
                {(showYear || activeYears.length > 0) && <SortHeader label="Year" sortKeyName="year" />}
                <SortHeader label="Category" sortKeyName="category" />
                <SortHeader label="Gender" sortKeyName="gender" />
                <SortHeader label="Cutoff" sortKeyName="cutoff" />
                <SortHeader label="University" sortKeyName="university" />
                <SortHeader label="Status" sortKeyName="statusPriority" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pageRows.map((c, i) => (
                <tr
                  key={`${c.code}-${c.category}-${c.gender}-${i}`}
                  className="transition-colors hover:bg-white/5"
                >
                  <td className="px-4 py-3.5 text-xs text-gray-400">
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-white">{c.name}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-300">{getDistrictName(c.district)}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-300">{c.course}</td>
                  {(showYear || activeYears.length > 0) && <td className="px-4 py-3.5 text-xs text-gray-300">{c.year}</td>}
                  <td className="px-4 py-3.5 text-xs text-gray-300">{c.category}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-300">{c.gender}</td>
                  <td className="px-4 py-3.5 text-xs font-semibold text-purple-300">{c.cutoff.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-300">{c.university}</td>
                  <td className="px-4 py-3.5 text-xs">
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 p-4">
          <p className="text-xs text-gray-400">
            Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs font-medium text-gray-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
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