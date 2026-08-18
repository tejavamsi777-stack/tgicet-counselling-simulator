export function getStatus(rank, cutoff) {
  const r = Number(rank);
  const c = Number(cutoff);
  if (!r || !c) return "risky";

  if (c >= r * 1.20) return "safe";
  if (c >= r * 0.95) return "moderate";
  return "risky";
}

export const STATUS_META = {
  safe: { label: "Safe", emoji: "🟢", tone: "safe" },
  moderate: { label: "Moderate", emoji: "🟡", tone: "moderate" },
  risky: { label: "Risky", emoji: "🔴", tone: "risky" },
};

export const STATUS_ORDER = { risky: 0, moderate: 1, safe: 2 };