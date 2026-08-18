import { getStatus, STATUS_ORDER } from "./status";

export function computeMatches(dataset, criteria) {
  const rankNum = Number(criteria.rank);
  const minCutoff = Math.floor(rankNum * 0.85);

  return dataset
    .filter(
      (college) =>
        college.course === criteria.course &&
        college.category === criteria.category &&
        college.gender === criteria.gender &&
        Number(college.cutoff) >= minCutoff
    )
    .map((college) => {
      const status = getStatus(criteria.rank, college.cutoff);
      return {
        ...college,
        status,
        statusPriority: STATUS_ORDER[status] ?? 2,
      };
    })
    .sort((a, b) => {
      if (a.statusPriority !== b.statusPriority) {
        return a.statusPriority - b.statusPriority;
      }
      return a.cutoff - b.cutoff;
    });
}