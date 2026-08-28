import { useMemo } from "react";

/**
 * Computes a 0–99 confidence score:
 *   gap  = cutoff - studentRank   (positive means the cutoff is HIGHER than rank → good)
 *   score = 50 + (gap / cutoff) * 50, clamped [1, 99]
 */
function computeConfidence(studentRank, cutoff) {
  const r = Number(studentRank);
  const c = Number(cutoff);
  if (!r || !c) return 0;
  const gap = c - r;
  const raw = 50 + (gap / c) * 50;
  return Math.min(99, Math.max(1, Math.round(raw)));
}

const COLORS = {
  high:   { bar: "#10b981", text: "#a7f3d0", label: "High" },
  medium: { bar: "#f59e0b", text: "#fde68a", label: "Good" },
  low:    { bar: "#f43f5e", text: "#fda4af", label: "Low" },
};

export default function ConfidenceBar({ studentRank, cutoff }) {
  const pct = useMemo(() => computeConfidence(studentRank, cutoff), [studentRank, cutoff]);

  const scheme =
    pct >= 70 ? COLORS.high
    : pct >= 45 ? COLORS.medium
    : COLORS.low;

  return (
    <div className="flex flex-col gap-[3px] min-w-[72px]">
      {/* Label row */}
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] font-bold" style={{ color: scheme.text }}>
          {scheme.label}
        </span>
        <span className="text-[10px] font-mono font-bold text-white/60">
          {pct}%
        </span>
      </div>

      {/* Bar track */}
      <div className="h-[5px] w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${scheme.bar}99, ${scheme.bar})`,
            boxShadow: `0 0 6px ${scheme.bar}80`,
          }}
        />
      </div>
    </div>
  );
}
