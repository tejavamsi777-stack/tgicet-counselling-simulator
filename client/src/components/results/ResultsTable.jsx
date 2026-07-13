import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search as SearchIcon } from "lucide-react";
import Card from "../ui/Card";
import Input from "../ui/Input";
import StatusBadge from "./StatusBadge";
import ExportButtons from "./ExportButtons";
import { getDistrictName } from "../../utils/districtNames";

const PAGE_SIZE = 10;

export default function ResultsTable({ results, year }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("statusPriority");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

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
        className={`cursor-pointer select-none px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700 ${className ?? ""}`}
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
      <Card className="bg-white p-10 text-center">
        <p className="text-slate-500">
          Enter your rank and preferences above, then click{" "}
          <span className="font-medium text-slate-700">Predict College</span> to see results.
        </p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search college name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <ExportButtons results={filtered} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">#</th>
                <SortHeader label="College" sortKeyName="name" />
                <SortHeader label="District" sortKeyName="district" />
                <SortHeader label="Course" sortKeyName="course" />
                <SortHeader label="Category" sortKeyName="category" />
                <SortHeader label="Gender" sortKeyName="gender" />
                <SortHeader label="Cutoff" sortKeyName="cutoff" />
                <SortHeader label="University" sortKeyName="university" />
                <SortHeader label="Status" sortKeyName="statusPriority" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((c, i) => (
                <tr
                  key={`${c.code}-${c.category}-${c.gender}-${i}`}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-sm text-black">
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-700">{getDistrictName(c.district)}</td>
                  <td className="px-4 py-3 text-sm text-700">{c.course}</td>
                  <td className="px-4 py-3 text-sm text-700">{c.category}</td>
                  <td className="px-4 py-3 text-sm text-700">{c.gender}</td>
                  <td className="px-4 py-3 text-sm text-700">{c.cutoff.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-700">{c.university}</td>
                  <td className="px-4 py-3 text-sm">
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 p-4">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}