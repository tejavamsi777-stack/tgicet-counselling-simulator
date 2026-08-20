import { useState, useMemo } from "react";
import { ArrowLeftRight } from "lucide-react";
import { PGECET_INSTITUTIONS } from "../../data/pgecetInstitutions";
import SearchableSelect from "../shared/SearchableSelect";
import allotmentsRaw from "../../data/pgecet_allotments/allotments.json";

function computeCutoffs(collegeCode, branchFilter) {
  const recs = allotmentsRaw.filter(a =>
    a.college_code === collegeCode &&
    !(a.admitted_by === "GATE/GPAT" || a.gate_score) &&
    a.rank &&
    (!branchFilter || a.branch_name === branchFilter)
  );

  function normCat(q) {
    q = (q || "").toUpperCase();
    if (q.includes("EWS")) return "EWS";
    if (q.includes("BC-A") || q.includes("BCA")) return "BC-A";
    if (q.includes("BC-B") || q.includes("BCB")) return "BC-B";
    if (q.includes("BC-C") || q.includes("BCC")) return "BC-C";
    if (q.includes("BC-D") || q.includes("BCD")) return "BC-D";
    if (q.includes("BC-E") || q.includes("BCE")) return "BC-E";
    if (q.includes("SC")) return "SC";
    if (q.includes("ST")) return "ST";
    return "OC";
  }

  const catMap = {};
  const genderMap = { M: [], F: [] };
  const allRanks = [];

  for (const r of recs) {
    const cat = normCat(r.allotted_category || r.category);
    if (!catMap[cat]) catMap[cat] = [];
    catMap[cat].push(r.rank);
    if (r.gender === "M" || r.gender === "F") genderMap[r.gender].push(r.rank);
    allRanks.push(r.rank);
  }

  const CAT_ORDER = ["OC", "EWS", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC", "ST"];
  const catResult = {};
  for (const cat of CAT_ORDER) {
    const ranks = catMap[cat];
    if (ranks && ranks.length)
      catResult[cat] = { open: Math.min(...ranks), close: Math.max(...ranks), count: ranks.length };
  }

  const gResult = {};
  for (const [g, ranks] of Object.entries(genderMap)) {
    if (ranks.length) gResult[g] = { open: Math.min(...ranks), close: Math.max(...ranks), count: ranks.length };
  }

  const overall = allRanks.length
    ? { open: Math.min(...allRanks), close: Math.max(...allRanks), count: allRanks.length }
    : null;

  const gateRecs = allotmentsRaw.filter(a =>
    a.college_code === collegeCode &&
    (a.admitted_by === "GATE/GPAT" || a.gate_score) &&
    a.gate_score &&
    (!branchFilter || a.branch_name === branchFilter)
  );
  const gateScores = gateRecs.map(a => Number(a.gate_score)).filter(Boolean);
  const gate = gateScores.length
    ? { high: Math.max(...gateScores), low: Math.min(...gateScores), count: gateScores.length }
    : null;

  return { catResult, gResult, overall, gate };
}

const CAT_COLORS = {
  OC: "text-sky-300", EWS: "text-teal-300",
  "BC-A": "text-orange-300", "BC-B": "text-amber-300",
  "BC-C": "text-lime-300", "BC-D": "text-emerald-300",
  "BC-E": "text-indigo-300", SC: "text-purple-300", ST: "text-rose-300",
};

function CutoffTable({ cutoffs, accentClass }) {
  const { catResult, gResult, overall, gate } = cutoffs;
  const hasCats = Object.keys(catResult).length > 0;
  const hasGender = Object.keys(gResult).length > 0;

  if (!hasCats && !overall) {
    return <div className="py-8 text-center text-sm text-white/30">No TG PGECET allotment data for this selection.</div>;
  }

  return (
    <div className="space-y-3 mt-4">
      {overall && (
        <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border ${accentClass} bg-black/30 px-4 py-3`}>
          <span className="text-xs font-bold uppercase tracking-wider text-white/50">Overall (PGECET)</span>
          <div className="flex items-center gap-3 font-mono text-sm">
            <span className="text-green-400">Open #{overall.open}</span>
            <span className="text-white/20">→</span>
            <span className="text-red-300">Close #{overall.close}</span>
            <span className="text-white/30 text-[11px]">({overall.count})</span>
          </div>
        </div>
      )}
      {gate && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300/70">GATE / GPAT Score</span>
          <div className="flex items-center gap-3 font-mono text-sm">
            <span className="text-amber-300">High {gate.high}</span>
            <span className="text-white/20">→</span>
            <span className="text-amber-200/60">Low {gate.low}</span>
            <span className="text-white/30 text-[11px]">({gate.count})</span>
          </div>
        </div>
      )}
      {hasCats && (
        <div className="overflow-hidden rounded-xl border border-white/[0.07]">
          <div className="bg-white/[0.04] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10">
            Category-wise TG PGECET Cutoffs
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-bold text-white/30">
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3 text-green-400">Open</th>
                <th className="py-2 px-3 text-red-300">Close</th>
                <th className="py-2 px-3">Seats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {Object.entries(catResult).map(([cat, d]) => (
                <tr key={cat} className="hover:bg-white/[0.03] transition">
                  <td className={`py-2 px-3 font-bold font-mono ${CAT_COLORS[cat] || "text-white/70"}`}>{cat}</td>
                  <td className="py-2 px-3 font-mono font-semibold text-green-400">#{d.open}</td>
                  <td className="py-2 px-3 font-mono font-semibold text-red-300">#{d.close}</td>
                  <td className="py-2 px-3 font-mono text-white/40">{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {hasGender && (
        <div className="overflow-hidden rounded-xl border border-white/[0.07]">
          <div className="bg-white/[0.04] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10">
            Gender-wise TG PGECET Cutoffs
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-bold text-white/30">
                <th className="py-2 px-3">Gender</th>
                <th className="py-2 px-3 text-green-400">Open</th>
                <th className="py-2 px-3 text-red-300">Close</th>
                <th className="py-2 px-3">Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {Object.entries(gResult).map(([g, d]) => (
                <tr key={g} className="hover:bg-white/[0.03] transition">
                  <td className={`py-2 px-3 font-bold ${g === "F" ? "text-pink-400" : "text-sky-400"}`}>
                    {g === "M" ? "Male" : "Female"}
                  </td>
                  <td className="py-2 px-3 font-mono font-semibold text-green-400">#{d.open}</td>
                  <td className="py-2 px-3 font-mono font-semibold text-red-300">#{d.close}</td>
                  <td className="py-2 px-3 font-mono text-white/40">{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CollegeCard({ inst, cutoffs, accentClass, codeColorClass, borderClass }) {
  if (!inst) return null;
  return (
    <div className={`rounded-3xl border ${borderClass} bg-gradient-to-br from-[#0e0820]/90 to-[#080512]/90 p-5 sm:p-6 shadow-xl`}>
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <span className={`rounded-lg border px-3 py-1 font-mono text-xs font-bold ${codeColorClass}`}>{inst.code}</span>
        <span className="rounded bg-white/5 px-2 py-0.5 text-xs text-white/50">{inst.type}</span>
      </div>
      <h3 className="mt-3 text-sm sm:text-base font-bold text-white leading-snug">{inst.name}</h3>
      <p className="text-[11px] text-white/40 mt-0.5">{inst.place || "Telangana"}</p>
      <CutoffTable cutoffs={cutoffs} accentClass={accentClass} />
      <div className="mt-5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2">
          Offered PG Specializations ({inst.courses.length})
        </h4>
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
          {inst.courses.map((c) => (
            <span key={c.branchName} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/75">
              {c.branchName}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PgecetCollegeComparisonTool() {
  const [college1Code, setCollege1Code] = useState("");
  const [college2Code, setCollege2Code] = useState("");
  const [sharedBranch, setSharedBranch] = useState("");

  const collegeOptions = useMemo(() =>
    PGECET_INSTITUTIONS.map((inst) => ({ value: inst.code, label: `${inst.code} — ${inst.name}` }))
  , []);

  const c1 = useMemo(() => PGECET_INSTITUTIONS.find((i) => i.code === college1Code) || null, [college1Code]);
  const c2 = useMemo(() => PGECET_INSTITUTIONS.find((i) => i.code === college2Code) || null, [college2Code]);

  // Union of both colleges' branches (deduplicated, sorted)
  const sharedBranchOpts = useMemo(() => {
    const names = new Set();
    (c1?.courses || []).forEach(c => names.add(c.branchName));
    (c2?.courses || []).forEach(c => names.add(c.branchName));
    const sorted = [...names].sort();
    return [{ value: "", label: "All Branches" }, ...sorted.map(n => ({ value: n, label: n }))];
  }, [c1, c2]);

  const cutoffs1 = useMemo(() => college1Code ? computeCutoffs(college1Code, sharedBranch) : null, [college1Code, sharedBranch]);
  const cutoffs2 = useMemo(() => college2Code ? computeCutoffs(college2Code, sharedBranch) : null, [college2Code, sharedBranch]);

  const handleSwap = () => {
    const tmp = college1Code;
    setCollege1Code(college2Code);
    setCollege2Code(tmp);
    setSharedBranch("");
  };

  return (
    <div className="relative z-20 overflow-visible rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6 sm:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300">
            <ArrowLeftRight size={16} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Side-by-Side College Comparison</h3>
            <p className="text-xs text-white/50">Compare category-wise &amp; gender-wise PGECET cutoffs and GATE scores</p>
          </div>
        </div>
        <span className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
          🏛️ {PGECET_INSTITUTIONS.length} Institutions
        </span>
      </div>

      {/* Selectors bar — EAPCET style */}
      <div className="relative z-30 grid grid-cols-1 md:grid-cols-7 gap-3 p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        {/* College A */}
        <div className="md:col-span-3">
          <label className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
            <span>Institution A ({PGECET_INSTITUTIONS.length})</span>
            <span className="text-[10px] font-mono text-purple-300">Primary</span>
          </label>
          <SearchableSelect
            value={college1Code}
            onChange={(v) => { setCollege1Code(v); setSharedBranch(""); }}
            placeholder="-- Search Institution A --"
            searchPlaceholder="Search by code or college name..."
            options={collegeOptions}
          />
        </div>

        {/* Swap button */}
        <div className="md:col-span-1 flex flex-col justify-end items-center gap-1 pb-0.5">
          <label className="hidden md:block text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Swap</label>
          <button
            type="button"
            onClick={handleSwap}
            title="Swap colleges"
            className="flex h-10 w-full md:w-10 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeftRight size={16} />
          </button>
        </div>

        {/* College B */}
        <div className="md:col-span-3">
          <label className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
            <span>Institution B ({PGECET_INSTITUTIONS.length})</span>
            <span className="text-[10px] font-mono text-cyan-300">Benchmark</span>
          </label>
          <SearchableSelect
            value={college2Code}
            onChange={(v) => { setCollege2Code(v); setSharedBranch(""); }}
            placeholder="-- Search Institution B --"
            searchPlaceholder="Search by code or college name..."
            options={collegeOptions}
          />
        </div>

        {/* Branch filter — full width below */}
        {(c1 || c2) && sharedBranchOpts.length > 1 && (
          <div className="md:col-span-7">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              Filter by Specialization <span className="text-white/25 font-normal normal-case">(applies to both)</span>
            </label>
            <SearchableSelect
              options={sharedBranchOpts}
              value={sharedBranch}
              onChange={setSharedBranch}
              placeholder="All Specializations"
            />
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-white/40">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-400" />Opening Rank (best)</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400" />Closing Rank (cutoff)</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />GATE Score range</span>
      </div>

      {/* Comparison cards */}
      {(c1 || c2) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {c1 && cutoffs1 ? (
            <CollegeCard inst={c1} cutoffs={cutoffs1}
              borderClass="border-purple-500/30"
              codeColorClass="border-purple-400/30 bg-purple-500/20 text-purple-300"
              accentClass="border-purple-500/25" />
          ) : (
            <div className="rounded-3xl border border-white/[0.07] bg-black/20 flex items-center justify-center min-h-[200px] text-white/30 text-sm">
              Select Institution A
            </div>
          )}
          {c2 && cutoffs2 ? (
            <CollegeCard inst={c2} cutoffs={cutoffs2}
              borderClass="border-cyan-500/30"
              codeColorClass="border-cyan-400/30 bg-cyan-500/20 text-cyan-300"
              accentClass="border-cyan-500/25" />
          ) : (
            <div className="rounded-3xl border border-white/[0.07] bg-black/20 flex items-center justify-center min-h-[200px] text-white/30 text-sm">
              Select Institution B
            </div>
          )}
        </div>
      )}

      {!c1 && !c2 && (
        <div className="flex items-center justify-center py-16 text-white/30 text-sm">
          Select two institutions above to start comparing
        </div>
      )}
    </div>
  );
}
