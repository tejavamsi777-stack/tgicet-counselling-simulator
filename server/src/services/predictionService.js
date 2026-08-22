import { predictionRepository } from "../repositories/predictionRepository.js";
import { examService } from "./examService.js";

function getStatus(rank, cutoffRank) {
  const r = Number(rank);
  const c = Number(cutoffRank);
  if (!r || !c) return "risky";
  if (c >= r * 1.20) return "safe";       // Cutoff is 20%+ higher than rank -> Safe
  if (c >= r * 0.95) return "moderate";   // Cutoff is between 95% and 120% of rank -> Moderate
  return "risky";                         // Cutoff is 85% to 95% (reach / ambitious) -> Risky / Dream
}

const STATUS_PRIORITY = { risky: 0, moderate: 1, safe: 2 };

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

const PREDICTION_CACHE = new Map();
const PREDICTION_CACHE_MAX = 5000;
const PREDICTION_TTL_MS = 15 * 60 * 1000; // 15 minutes

export const predictionService = {
  async predict({ rank, category, gender, course, courses, district, districts, year, years, exam: examSlug, region }) {
    const exam = await examService.resolve(examSlug);
    const rankNum = Number(rank);

    // Normalize years list
    let yearList = [];
    if (Array.isArray(years) && years.length > 0) {
      yearList = years.map(Number).filter((y) => !isNaN(y) && y > 0);
    } else if (year && !isNaN(Number(year))) {
      yearList = [Number(year)];
    }

    // Normalize courses list
    let courseList = [];
    if (Array.isArray(courses)) {
      courseList = courses
        .map((c) => normalizeCourseCode(c, examSlug))
        .filter(Boolean);
    } else if (course && typeof course === "string") {
      courseList = [normalizeCourseCode(course, examSlug)].filter(Boolean);
    }

    // Normalize districts list
    let districtList = [];
    if (Array.isArray(districts)) {
      districtList = districts
        .map((d) => (d ? String(d).trim().toUpperCase() : ""))
        .filter(Boolean);
    } else if (district && typeof district === "string") {
      districtList = [district.trim().toUpperCase()].filter(Boolean);
    }

    // Generate cache key
    const cacheKey = `${exam.id}:${rankNum}:${category || ""}:${gender || ""}:${region || ""}:${yearList.sort().join(",")}:${courseList.sort().join(",")}:${districtList.sort().join(",")}`;
    const cached = PREDICTION_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < PREDICTION_TTL_MS) {
      return cached.data;
    }

    const matches = await predictionRepository.findMatches({
      rank: rankNum,
      category,
      gender,
      courses: courseList,
      districts: districtList,
      years: yearList,
      examId: exam.id,
      region,
    });

    const withStatus = matches.map((m) => {
      const status = getStatus(rankNum, m.cutoff_rank);
      return { ...m, status, statusPriority: STATUS_PRIORITY[status] };
    });

    withStatus.sort((a, b) => {
      if (a.statusPriority !== b.statusPriority) return a.statusPriority - b.statusPriority;
      return a.cutoff_rank - b.cutoff_rank;
    });

    if (PREDICTION_CACHE.size >= PREDICTION_CACHE_MAX) {
      const firstKey = PREDICTION_CACHE.keys().next().value;
      PREDICTION_CACHE.delete(firstKey);
    }
    PREDICTION_CACHE.set(cacheKey, { timestamp: Date.now(), data: withStatus });

    return withStatus;
  },
};

