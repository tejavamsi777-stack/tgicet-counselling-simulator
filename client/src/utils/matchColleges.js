import { getStatus } from "./status";

export function computeMatches(dataset, criteria) {
  return dataset
    .filter(
      (college) =>
        college.course === criteria.course &&
        college.category === criteria.category &&
        college.gender === criteria.gender &&
        Number(criteria.rank) <= Number(college.cutoff)
    )
    .map((college) => {
      const status = getStatus(criteria.rank, college.cutoff);
      return {
        ...college,
        status,
        statusPriority: status === "safe" ? 0 : status === "moderate" ? 1 : 2,
      };
    })
    .sort((a, b) => {
      if (a.statusPriority !== b.statusPriority) {
        return a.statusPriority - b.statusPriority;
      }
      return a.cutoff - b.cutoff;
    });
}