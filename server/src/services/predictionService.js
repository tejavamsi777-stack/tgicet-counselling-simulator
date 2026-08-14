import { predictionRepository } from "../repositories/predictionRepository.js";
import { examService } from "./examService.js";

function getStatus(rank, cutoffRank) {
  const ratio = rank / cutoffRank;
  if (ratio <= 0.85) return "safe";
  if (ratio <= 0.97) return "moderate";
  return "risky";
}

const STATUS_PRIORITY = { safe: 0, moderate: 1, risky: 2 };

function normalizeCourseCode(course, examSlug) {
  if (!course) return course;
  const c = course.trim().toUpperCase();
  if (examSlug === "tg-polycet") {
    if (c === "CME" || c === "CSE") return "CS";
    if (c === "CIV") return "CE";
    if (c === "ECE") return "EC";
    if (c === "EEE") return "EE";
    if (c === "MEC") return "ME";
  }
  return c;
}

export const predictionService = {
  async predict({ rank, category, gender, course, year, exam: examSlug }) {
    const exam = await examService.resolve(examSlug);
    const rankNum = Number(rank);
    const yearNum = Number(year);
    const normalizedCourse = normalizeCourseCode(course, examSlug);

    const matches = await predictionRepository.findMatches({
      rank: rankNum,
      category,
      gender,
      course: normalizedCourse,
      year: yearNum,
      examId: exam.id,
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
