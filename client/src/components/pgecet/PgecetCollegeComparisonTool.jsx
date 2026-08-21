import { useState, useMemo } from "react";
import { ArrowLeftRight, CheckCircle2, Layers } from "lucide-react";
import { PGECET_INSTITUTIONS } from "../../data/pgecetInstitutions";
import SearchableSelect from "../shared/SearchableSelect";
import allotmentsRaw from "../../data/pgecet_allotments/allotments.json";

/* ─── Standardize & Canonicalize PG Branch Names ─── */
export function getCanonicalBranch(rawName) {
  if (!rawName) return "";
  const s = rawName.toUpperCase().trim();
  if (s.includes("COMPUTER SCIENCE") || s.includes("CSE")) return "Computer Science & Engineering (CSE)";
  if (s.includes("ARTIFICIAL INTELLIGENCE") && (s.includes("DATA") || s.includes("DATA SCIENCE"))) return "AI & Data Science (AIDS)";
  if (s.includes("ARTIFICIAL INTELLIGENCE") && (s.includes("MACHINE") || s.includes("AIML"))) return "AI & Machine Learning (AIML)";
  if (s.includes("ARTIFICIAL INTELLIGENCE") || s.includes("ROBOTICS")) return "AI & Robotics";
  if (s.includes("DATA SCIENCE")) return "Data Science";
  if (s.includes("CYBER")) return "Cyber Security";
  if (s.includes("SOFTWARE")) return "Software Engineering";
  if (s.includes("VLSI") && (s.includes("EMBEDDED") || s.includes("EMBEDED"))) return "VLSI & Embedded Systems";
  if (s.includes("VLSI")) return "VLSI System Design";
  if (s.includes("EMBEDDED") || s.includes("EMBEDED")) return "Embedded Systems";
  if (s.includes("POWER") && s.includes("ELECTRONIC")) return "Power Electronics & Drives";
  if (s.includes("POWER")) return "Power Systems Engineering";
  if (s.includes("STRUCTURAL")) return "Structural Engineering";
  if (s.includes("TRANSPORT") || s.includes("HIGHWAY")) return "Transportation / Highway Engg";
  if (s.includes("GEO-TECHNICAL") || s.includes("GEOTECHNICAL")) return "Geo-Technical Engineering";
  if (s.includes("CAD") || s.includes("CAM")) return "CAD / CAM";
  if (s.includes("THERMAL")) return "Thermal Engineering";
  if (s.includes("MACHINE DESIGN") || s.includes("ENGINEERING DESIGN") || s.includes("DESIGN ENGINEERING")) return "Machine Design";
  if (s.includes("ADVANCED MANUFACTURING") || s.includes("PRODUCTION")) return "Manufacturing / Production Engg";
  if (s.includes("DIGITAL SYSTEMS") || s.includes("DIGITAL ELECTRONICS")) return "Digital Systems";
  if (s.includes("COMMUNICATION") || s.includes("MICROWAVE") || s.includes("RADAR")) return "Communication Engineering";
  if (s.includes("SIGNAL PROCESSING")) return "Signal Processing";
  if (s.includes("ENVIRONMENTAL")) return "Environmental Management";
  if (s.includes("BIO-TECHNOLOGY") || s.includes("BIOTECHNOLOGY")) return "Bio-Technology";
  if (s.includes("BIO-MEDICAL") || s.includes("BIOMEDICAL")) return "Bio-Medical Electronics";
  if (s.includes("CHEMICAL")) return "Chemical Engineering";
  if (s.includes("AEROSPACE")) return "Aerospace Engineering";
  return rawName;
}

/* ─── Compute cutoffs for a college with optional canonical branch filter ─── */
function computeCutoffs(collegeCode, canonicalBranch) {
  const pgecetRecs = allotmentsRaw.filter(a => {
    if (a.college_code !== collegeCode) return false;
    if (a.admitted_by === "GATE/GPAT" || a.gate_score) return false;
    if (!a.rank) return false;
    if (canonicalBranch && getCanonicalBranch(a.branch_name) !== canonicalBranch) return false;
    return true;
  });

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

  for (const r of pgecetRecs) {
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
    if (ranks && ranks.length) {
      catResult[cat] = { open: Math.min(...ranks), close: Math.max(...ranks), count: ranks.length };
    }
  }

  const gResult = {};
  for (const [g, ranks] of Object.entries(genderMap)) {
    if (ranks.length) gResult[g] = { open: Math.min(...ranks), close: Math.max(...ranks), count: ranks.length };
  }

  const overall = allRanks.length
    ? { open: Math.min(...allRanks), close: Math.max(...allRanks), count: allRanks.length }
    : null;

  const gateRecs = allotmentsRaw.filter(a => {
    if (a.college_code !== collegeCode) return false;
    if (!(a.admitted_by === "GATE/GPAT" || a.gate_score)) return false;
    if (!a.gate_score) return false;
    if (canonicalBranch && getCanonicalBranch(a.branch_name) !== canonicalBranch) return false;
    return true;
  });

  const gateScores = gateRecs.map(a => Number(a.gate_score)).filter(Boolean);
  const gate = gateScores.length
    ? { high: Math.max(...gateScores), low: Math.min(...gateScores), count: gateScores.length }
    : null;

  return { catResult, gResult, overall, gate };
}

const CAT_COLORS = {
  OC: "text-sky-300",
  EWS: "text-teal-300",
  "BC-A": "text-orange-300",
  "BC-B": "text-amber-300",
  "BC-C": "text-lime-300",
  "BC-D": "text-emerald-300",
  "BC-E": "text-indigo-300",
  SC: "text-purple-300",
  ST: "text-rose-300",
};

function CutoffTable({ cutoffs, accentClass }) {
  const { catResult, gResult, overall, gate } = cutoffs;
  const hasCats = Object.keys(catResult).length > 0;
  const hasGender = Object.keys(gResult).length > 0;

  if (!hasCats && !overall && !gate) {
    return <div className="py-8 text-center text-sm text-white/30">No allotment data available for this selection.</div>;
  }

  return (
    <div className="space-y-3 mt-4">
      {/* Overall PGECET Cutoff */}
      {overall && (
        <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border ${accentClass} bg-black/30 px-4 py-3`}>
          <span className="text-xs font-bold uppercase tracking-wider text-white/50">Overall (PGECET)</span>
          <div className="flex items-center gap-3 font-mono text-sm">
            <span className="text-green-400">Open #{overall.open}</span>
            <span className="text-white/20">→</span>
            <span className="text-red-300">Close #{overall.close}</span>
            <span className="text-white/30 text-[11px]">({overall.count} seats)</span>
          </div>
        </div>
      )}

      {/* GATE / GPAT Score Range */}
      {gate && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300/70">GATE / GPAT Score</span>
          <div className="flex items-center gap-3 font-mono text-sm">
            <span className="text-amber-300">High {gate.high}</span>
            <span className="text-white/20">→</span>
            <span className="text-amber-200/60">Low {gate.low}</span>
            <span className="text-white/30 text-[11px]">({gate.count} admitted)</span>
          </div>
        </div>
      )}

      {/* Category-wise Cutoffs */}
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

      {/* Gender-wise Cutoffs */}
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

function CollegeCard({ inst, cutoffs, accentClass, codeColorClass, borderClass, selectedBranch, onSelectBranch }) {
  if (!inst) return null;

  // Distinct canonical branches available for this specific college in allotments
  const collegeBranches = useMemo(() => {
    const rawBranches = allotmentsRaw
      .filter(a => a.college_code === inst.code)
      .map(a => getCanonicalBranch(a.branch_name));
    return [...new Set(rawBranches)].filter(Boolean).sort();
  }, [inst.code]);

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
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center justify-between">
          <span>Offered PG Specializations ({collegeBranches.length})</span>
          <span className="text-[10px] text-white/30 font-normal">Click to filter</span>
        </h4>
        <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
          {collegeBranches.map((br) => {
            const isSelected = selectedBranch === br;
            return (
              <button
                key={br}
                type="button"
                onClick={() => onSelectBranch && onSelectBranch(isSelected ? "" : br)}
                className={`rounded-lg border px-2.5 py-1 text-[11px] transition-all cursor-pointer text-left ${
                  isSelected
                    ? "border-purple-400 bg-purple-600/30 text-white font-semibold shadow-sm"
                    : "border-white/10 bg-white/5 text-white/75 hover:border-white/20 hover:bg-white/10 hover:text-white"
                }`}
              >
                {br}
              </button>
            );
          })}
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

  // Common branches intersection: ONLY specializations available in BOTH selected colleges
  const sharedBranchOpts = useMemo(() => {
    if (!college1Code && !college2Code) return [];

    if (college1Code && !college2Code) {
      const b1 = new Set(
        allotmentsRaw
          .filter(a => a.college_code === college1Code)
          .map(a => getCanonicalBranch(a.branch_name))
      );
      const sorted = [...b1].filter(Boolean).sort();
      return [{ value: "", label: "All Specializations" }, ...sorted.map(n => ({ value: n, label: n }))];
    }

    if (!college1Code && college2Code) {
      const b2 = new Set(
        allotmentsRaw
          .filter(a => a.college_code === college2Code)
          .map(a => getCanonicalBranch(a.branch_name))
      );
      const sorted = [...b2].filter(Boolean).sort();
      return [{ value: "", label: "All Specializations" }, ...sorted.map(n => ({ value: n, label: n }))];
    }

    // Both colleges selected -> Exact Common Intersection
    const b1 = new Set(
      allotmentsRaw
        .filter(a => a.college_code === college1Code)
        .map(a => getCanonicalBranch(a.branch_name))
    );
    const b2 = new Set(
      allotmentsRaw
        .filter(a => a.college_code === college2Code)
        .map(a => getCanonicalBranch(a.branch_name))
    );

    const common = [...b1].filter(x => x && b2.has(x)).sort();
    return [{ value: "", label: "All Common Specializations" }, ...common.map(n => ({ value: n, label: n }))];
  }, [college1Code, college2Code]);

  const cutoffs1 = useMemo(() => college1Code ? computeCutoffs(college1Code, sharedBranch) : null, [college1Code, sharedBranch]);
  const cutoffs2 = useMemo(() => college2Code ? computeCutoffs(college2Code, sharedBranch) : null, [college2Code, sharedBranch]);

  const handleSwap = () => {
    const tmp = college1Code;
    setCollege1Code(college2Code);
    setCollege2Code(tmp);
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

        {/* Branch filter — full width below, only common branches shown */}
        {(college1Code || college2Code) && (
          <div className="md:col-span-7 mt-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5 flex items-center justify-between">
              <span>
                Filter by Common Specialization{" "}
                <span className="text-white/25 font-normal normal-case">
                  {college1Code && college2Code
                    ? `(only showing ${Math.max(0, sharedBranchOpts.length - 1)} shared specializations)`
                    : "(available specializations)"}
                </span>
              </span>
              {sharedBranch && (
                <button
                  type="button"
                  onClick={() => setSharedBranch("")}
                  className="text-[10px] text-purple-300 hover:underline cursor-pointer"
                >
                  Clear filter
                </button>
              )}
            </label>
            {sharedBranchOpts.length > 1 ? (
              <SearchableSelect
                options={sharedBranchOpts}
                value={sharedBranch}
                onChange={setSharedBranch}
                placeholder="All Common Specializations"
              />
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white/40">
                No common specializations found between these two institutions. Both colleges offer different PG courses.
              </div>
            )}
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
            <CollegeCard
              inst={c1}
              cutoffs={cutoffs1}
              borderClass="border-purple-500/30"
              codeColorClass="border-purple-400/30 bg-purple-500/20 text-purple-300"
              accentClass="border-purple-500/25"
              selectedBranch={sharedBranch}
              onSelectBranch={setSharedBranch}
            />
          ) : (
            <div className="rounded-3xl border border-white/[0.07] bg-black/20 flex items-center justify-center min-h-[200px] text-white/30 text-sm">
              Select Institution A
            </div>
          )}
          {c2 && cutoffs2 ? (
            <CollegeCard
              inst={c2}
              cutoffs={cutoffs2}
              borderClass="border-cyan-500/30"
              codeColorClass="border-cyan-400/30 bg-cyan-500/20 text-cyan-300"
              accentClass="border-cyan-500/25"
              selectedBranch={sharedBranch}
              onSelectBranch={setSharedBranch}
            />
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
