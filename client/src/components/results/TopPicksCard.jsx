import { useMemo } from "react";
import { motion } from "framer-motion";
import { Star, ArrowRight, MapPin, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import ConfidenceBar from "./ConfidenceBar";
import { getDistrictName } from "../../utils/districtNames";

const STATUS_RANK = { safe: 0, moderate: 1, risky: 2 };

/**
 * TopPicksCard — appears above the full ResultsTable.
 * Shows the student's best 5 personalized college+branch picks.
 * Priority: safe first → closest cutoff to rank (most bang for rank).
 */
export default function TopPicksCard({ results, studentRank, onCreateWebOptions }) {
  const picks = useMemo(() => {
    if (!results || results.length === 0) return [];

    // Take the most recent year's results only
    const latestYear = Math.max(...results.map((r) => Number(r.year || 0)));
    const byLatest = results.filter((r) => Number(r.year) === latestYear);

    // Sort: safe first, then by smallest gap between cutoff and rank (closest match)
    return [...byLatest]
      .sort((a, b) => {
        const statusDiff = (STATUS_RANK[a.status] ?? 2) - (STATUS_RANK[b.status] ?? 2);
        if (statusDiff !== 0) return statusDiff;
        // Within same status, sort by cutoff closest to studentRank (ascending gap)
        const gapA = Math.abs(Number(a.cutoff) - Number(studentRank));
        const gapB = Math.abs(Number(b.cutoff) - Number(studentRank));
        return gapA - gapB;
      })
      .slice(0, 5);
  }, [results, studentRank]);

  if (!picks.length) return null;

  const STATUS_STYLE = {
    safe:     "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
    moderate: "bg-amber-500/15 border-amber-500/40 text-amber-300",
    risky:    "bg-rose-500/15 border-rose-500/40 text-rose-300",
  };
  const STATUS_EMOJI = { safe: "🟢", moderate: "🟡", risky: "🔴" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="mb-6 rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-600/10 via-purple-900/5 to-transparent p-4 sm:p-6 shadow-lg shadow-purple-950/30"
    >
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30">
            <Star size={15} className="text-purple-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Your Top {picks.length} Best Picks
            </h3>
            <p className="text-[11px] text-gray-400">
              Personalised for rank <span className="font-mono font-bold text-purple-300">{Number(studentRank).toLocaleString()}</span> — best matches first
            </p>
          </div>
        </div>

        {onCreateWebOptions && (
          <button
            type="button"
            onClick={onCreateWebOptions}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2 shadow-lg shadow-purple-950/40 border border-purple-400/30 transition active:scale-[0.98] cursor-pointer"
          >
            <span>✨ Create Web Options for Rank</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {picks.map((c, idx) => (
          <motion.div
            key={`${c.code}-${c.course}-${idx}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07, duration: 0.4 }}
            className="relative flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] p-3 transition-all"
          >
            {/* Rank badge */}
            <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-mono font-bold text-white/50">
              {idx + 1}
            </span>

            {/* College name */}
            <p className="pr-5 text-xs font-bold leading-snug text-white line-clamp-2 mb-1">
              {c.name}
            </p>

            {/* Branch pill */}
            <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-md bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300">
              <BookOpen size={9} /> {c.course}
            </span>

            {/* District */}
            <span className="mb-2 flex items-center gap-1 text-[10px] text-gray-400">
              <MapPin size={9} /> {getDistrictName(c.district) || c.district}
            </span>

            {/* Cutoff row */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Cutoff</span>
              <span className="text-[11px] font-mono font-bold text-purple-300">
                {Number(c.cutoff).toLocaleString()}
              </span>
            </div>

            {/* Confidence bar */}
            <ConfidenceBar studentRank={studentRank} cutoff={c.cutoff} />

            {/* Status badge */}
            <span className={`mt-2 inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[c.status]}`}>
              {STATUS_EMOJI[c.status]} {c.status?.charAt(0).toUpperCase() + c.status?.slice(1)}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Footer tip */}
      <p className="mt-3 flex items-center gap-1 text-[10px] text-gray-500">
        <ArrowRight size={10} /> Full results with all eligible colleges are in the table below.
      </p>
    </motion.div>
  );
}
