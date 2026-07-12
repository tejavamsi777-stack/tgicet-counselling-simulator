import { predictionRepository } from "../repositories/predictionRepository.js";

// PLACEHOLDER thresholds — replace with your real utils/status.js logic once shared.
// Currently: Safe = comfortable margin below cutoff, Moderate = close to cutoff,
// Risky = only just eligible.
function getStatus(rank, cutoffRank) {
  const ratio = rank / cutoffRank;
  if (ratio <= 0.85) return "safe";
  if (ratio <= 0.97) return "moderate";
  return "risky";
}

const STATUS_PRIORITY = { safe: 0, moderate: 1, risky: 2 };

export const predictionService = {
  async predict({ rank, category, gender, course, year }) {
    const rankNum = Number(rank);
    const yearNum = Number(year);

    const matches = await predictionRepository.findMatches({
      rank: rankNum,
      category,
      gender,
      course,
      year: yearNum,
    });

    const withStatus = matches.map((m) => {
      const status = getStatus(rankNum, m.cutoff_rank);
      return { ...m, status, statusPriority: STATUS_PRIORITY[status] };
    });

    withStatus.sort((a, b) => {
      if (a.statusPriority !== b.statusPriority) return a.statusPriority - b.statusPriority;
      return a.cutoff_rank - b.cutoff_rank;
    });

    return withStatus;
  },
};