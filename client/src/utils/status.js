export function getStatus(rank, cutoff) {
  const r = Number(rank);
  const c = Number(cutoff);
  if (!r || !c || r > c) return "risky";

  const ratio = r / c;
  if (ratio <= 0.75) return "safe";
  if (ratio <= 0.92) return "moderate";
  return "risky";
}

export const STATUS_META = {
  safe: { label: "Safe", emoji: "🟢", tone: "safe" },
  moderate: { label: "Moderate", emoji: "🟡", tone: "moderate" },
  risky: { label: "Risky", emoji: "🔴", tone: "risky" },
};

export const STATUS_ORDER = { safe: 0, moderate: 1, risky: 2 };