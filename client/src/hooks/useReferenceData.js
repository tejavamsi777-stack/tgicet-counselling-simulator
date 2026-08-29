import { useEffect, useState } from "react";
import { api } from "../lib/api";

function isValidCache(cached) {
  return (
    cached &&
    typeof cached === "object" &&
    Array.isArray(cached.courses) &&
    cached.courses.length > 0 &&
    Array.isArray(cached.districts) &&
    cached.districts.length > 0
  );
}

const TG_CATEGORIES = [
  { code: "OC", name: "OC" },
  { code: "EWS", name: "EWS" },
  { code: "BC_A", name: "BC-A" },
  { code: "BC_B", name: "BC-B" },
  { code: "BC_C", name: "BC-C" },
  { code: "BC_D", name: "BC-D" },
  { code: "BC_E", name: "BC-E" },
  { code: "SC", name: "SC" },
  { code: "ST", name: "ST" },
];

export function sortCategories(categories = [], examSlug = "") {
  const isAp = examSlug === "ap-eapcet";
  if (!isAp) {
    // For all TG exams, return the standard 9 categories
    return TG_CATEGORIES;
  }

  return [...categories].sort((a, b) => {
    const codeA = a?.code ?? a ?? "";
    const codeB = b?.code ?? b ?? "";
    const rankA = getCategoryRank(codeA);
    const rankB = getCategoryRank(codeB);
    if (rankA !== rankB) return rankA - rankB;
    return codeA.localeCompare(codeB);
  });
}

// Popularity rankings for student preferences per exam
const POPULAR_COURSES = {
  "tg-eapcet": [
    "CSE",  // Computer Science & Engineering
    "CSM",  // CSE (AI & ML)
    "CSD",  // CSE (Data Science)
    "CSC",  // CSE (Cyber Security)
    "CSIT", // Computer Science & Information Tech
    "INF",  // Information Technology
    "IT",
    "CSO",  // CSE (IoT)
    "CSB",  // CSE (Business Systems)
    "CSI",  // CSE (IoT & Cyber Security)
    "AIM",  // AI & ML
    "AID",  // AI & Data Science
    "AI",   // Artificial Intelligence
    "ECE",  // Electronics & Communication
    "EEE",  // Electrical & Electronics
    "MEC",  // Mechanical Engineering
    "ME",
    "CIV",  // Civil Engineering
    "CE",
    "CHE",  // Chemical Engineering
    "BME",  // Biomedical Engineering
    "AGR",  // Agricultural Engineering
    "MIN",  // Mining Engineering
    "MET",  // Metallurgical Engineering
    "AUT",  // Automobile Engineering
    "AER",  // Aeronautical Engineering
    "ANE",
    "BIO",  // Biotechnology
    "TXE",  // Textile Engineering
  ],
  "tg-icet": [
    "MBA",  // Master of Business Administration
    "MCA",  // Master of Computer Applications
    "MBT",  // MBA Tourism Management
    "MTM",  // MBA Technology Management
    "MTH",  // MBA Tourism & Hospitality
  ],
  "tg-ecet": [
    "CSE",  // Computer Science & Engineering
    "CSM",  // CSE (AI & ML)
    "CSD",  // CSE (Data Science)
    "AID",  // AI & Data Science
    "AIM",  // AI & ML
    "CSC",  // Cyber Security
    "CIC",  // IoT & Blockchain
    "CSB",  // Business Systems
    "INF",  // Information Technology
    "IT",
    "ECE",  // Electronics & Communication
    "EEE",  // Electrical & Electronics
    "MEC",  // Mechanical Engineering
    "ME",
    "CIV",  // Civil Engineering
    "CE",
    "PHM",  // Pharmacy
    "PHA",
    "CHE",  // Chemical Engineering
    "EVL",  // VLSI Design
    "BME",  // Biomedical
    "MIN",  // Mining Engineering
    "MET",  // Metallurgical Engineering
    "AUT",  // Automobile Engineering
    "CER",  // Ceramic Technology
    "FPT",  // Food Processing Technology
  ],
  "ap-eapcet": [
    "CSE", "CSM", "CSD", "CSC", "CAI", "CAD", "CIC", "CIT", "CSBS", "INF", "IT", "AIM", "AID", "AI", "ECE", "EEE", "MEC", "ME", "CIV", "CE", "CHE", "AGR", "BIO", "AUT", "ASE", "MIN", "MET"
  ],
  "tg-polycet": [
    "CME",  // Computer Engineering
    "CS",
    "ECE",  // Electronics & Communication
    "EC",
    "EEE",  // Electrical & Electronics
    "EE",
    "MEC",  // Mechanical Engineering
    "ME",
    "CIV",  // Civil Engineering
    "CE",
    "AUT",  // Automobile Engineering
    "MIN",  // Mining Engineering
    "CHE",  // Chemical Engineering
    "MET",  // Metallurgical Engineering
    "PKG",  // Packaging Technology
    "CCP",  // Commercial & Computer Practice
  ],
};

const AP_EAPCET_FALLBACK_COURSES = [
  { code: "CSE", name: "COMPUTER SCIENCE AND ENGINEERING" },
  { code: "CSM", name: "CSE (AI & MACHINE LEARNING)" },
  { code: "CSD", name: "CSE (DATA SCIENCE)" },
  { code: "CSC", name: "CSE (CYBER SECURITY)" },
  { code: "CAI", name: "CSE (ARTIFICIAL INTELLIGENCE)" },
  { code: "CAD", name: "CSE (AI & DATA SCIENCE)" },
  { code: "CIC", name: "CSE (IOT & CYBER SECURITY WITH BLOCKCHAIN)" },
  { code: "CIT", name: "COMPUTER SCIENCE AND INFORMATION TECHNOLOGY" },
  { code: "CSBS", name: "COMPUTER SCIENCE AND BUSINESS SYSTEMS" },
  { code: "INF", name: "INFORMATION TECHNOLOGY" },
  { code: "AI", name: "ARTIFICIAL INTELLIGENCE" },
  { code: "AID", name: "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE" },
  { code: "AIM", name: "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING" },
  { code: "ECE", name: "ELECTRONICS AND COMMUNICATION ENGINEERING" },
  { code: "EEE", name: "ELECTRICAL AND ELECTRONICS ENGINEERING" },
  { code: "MEC", name: "MECHANICAL ENGINEERING" },
  { code: "CIV", name: "CIVIL ENGINEERING" },
  { code: "CHE", name: "CHEMICAL ENGINEERING" },
  { code: "AGR", name: "AGRICULTURAL ENGINEERING" },
  { code: "BIO", name: "BIO-TECHNOLOGY" },
  { code: "AUT", name: "AUTOMOBILE ENGINEERING" },
  { code: "ASE", name: "AEROSPACE ENGINEERING" },
  { code: "MIN", name: "MINING ENGINEERING" },
  { code: "MET", name: "METALLURGICAL ENGINEERING" },
  { code: "FDT", name: "FOOD TECHNOLOGY" },
  { code: "PHE", name: "PHARMACEUTICAL ENGINEERING" },
  { code: "RBT", name: "ROBOTICS" },
  { code: "SWE", name: "SOFTWARE ENGINEERING" },
];

const AP_EAPCET_FALLBACK_DISTRICTS = [
  { code: "ANN", name: "Annamayya" },
  { code: "ATP", name: "Anantapur" },
  { code: "CTR", name: "Chittoor" },
  { code: "EG", name: "East Godavari" },
  { code: "GTR", name: "Guntur" },
  { code: "KDP", name: "YSR Kadapa" },
  { code: "KNL", name: "Kurnool" },
  { code: "KRI", name: "Krishna" },
  { code: "NLR", name: "SPSR Nellore" },
  { code: "NTR", name: "NTR" },
  { code: "PKS", name: "Prakasam" },
  { code: "PLN", name: "Palnadu" },
  { code: "SKL", name: "Srikakulam" },
  { code: "VSP", name: "Visakhapatnam" },
  { code: "VZM", name: "Vizianagaram" },
  { code: "WG", name: "West Godavari" },
];

function getCourseRank(code, examSlug) {
  const norm = (code ?? "").toString().trim().toUpperCase();
  const list = POPULAR_COURSES[examSlug] || POPULAR_COURSES["tg-eapcet"] || [];
  const idx = list.findIndex((c) => c.toUpperCase() === norm);
  return idx === -1 ? 999 : idx;
}

export function sortCourses(courses = [], examSlug = "tg-eapcet") {
  return [...courses].sort((a, b) => {
    const codeA = (a?.code ?? a ?? "").toString().trim().toUpperCase();
    const codeB = (b?.code ?? b ?? "").toString().trim().toUpperCase();
    const rankA = getCourseRank(codeA, examSlug);
    const rankB = getCourseRank(codeB, examSlug);
    if (rankA !== rankB) return rankA - rankB;
    return codeA.localeCompare(codeB);
  });
}

// In-memory + sessionStorage cache across all dropdown instances and page navigations
const referenceCache = new Map();
// Track which slugs are currently being fetched (to avoid duplicate requests)
const fetchInProgress = new Set();

function readSessionCache(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`tg_ref_v5_${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSessionCache(key, val) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`tg_ref_v5_${key}`, JSON.stringify(val));
  } catch {
    // ignore quota
  }
}

const TG_ICET_FALLBACK_COURSES = [
  { code: "MBA", name: "MASTER OF BUSINESS ADMINISTRATION" },
  { code: "MCA", name: "MASTER OF COMPUTER APPLICATIONS" },
  { code: "MBT", name: "MBA (TOURISM MANAGEMENT)" },
  { code: "MTM", name: "MBA (TECHNOLOGY MANAGEMENT)" },
  { code: "MTH", name: "MBA (TOURISM & HOSPITALITY)" },
];

const TG_EAPCET_FALLBACK_COURSES = [
  { code: "CSE", name: "COMPUTER SCIENCE AND ENGINEERING" },
  { code: "CSM", name: "CSE (ARTIFICIAL INTELLIGENCE & MACHINE LEARNING)" },
  { code: "CSD", name: "CSE (DATA SCIENCE)" },
  { code: "CSC", name: "CSE (CYBER SECURITY)" },
  { code: "CSIT", name: "COMPUTER SCIENCE & INFORMATION TECHNOLOGY" },
  { code: "INF", name: "INFORMATION TECHNOLOGY" },
  { code: "CSO", name: "CSE (IOT)" },
  { code: "CSB", name: "CSE (BUSINESS SYSTEMS)" },
  { code: "CSI", name: "CSE (IOT & CYBER SECURITY)" },
  { code: "AIM", name: "ARTIFICIAL INTELLIGENCE & MACHINE LEARNING" },
  { code: "AID", name: "ARTIFICIAL INTELLIGENCE & DATA SCIENCE" },
  { code: "AI", name: "ARTIFICIAL INTELLIGENCE" },
  { code: "ECE", name: "ELECTRONICS & COMMUNICATION ENGINEERING" },
  { code: "EEE", name: "ELECTRICAL & ELECTRONICS ENGINEERING" },
  { code: "MEC", name: "MECHANICAL ENGINEERING" },
  { code: "CIV", name: "CIVIL ENGINEERING" },
  { code: "CHE", name: "CHEMICAL ENGINEERING" },
  { code: "BME", name: "BIOMEDICAL ENGINEERING" },
  { code: "AGR", name: "AGRICULTURAL ENGINEERING" },
  { code: "MIN", name: "MINING ENGINEERING" },
  { code: "MET", name: "METALLURGICAL ENGINEERING" },
  { code: "AUT", name: "AUTOMOBILE ENGINEERING" },
  { code: "AER", name: "AERONAUTICAL ENGINEERING" },
  { code: "BIO", name: "BIOTECHNOLOGY" },
];

const TG_ECET_FALLBACK_COURSES = [
  { code: "CSE", name: "COMPUTER SCIENCE AND ENGINEERING" },
  { code: "CSM", name: "CSE (AI & ML)" },
  { code: "CSD", name: "CSE (DATA SCIENCE)" },
  { code: "AID", name: "AI & DATA SCIENCE" },
  { code: "AIM", name: "AI & ML" },
  { code: "CSC", name: "CYBER SECURITY" },
  { code: "INF", name: "INFORMATION TECHNOLOGY" },
  { code: "ECE", name: "ELECTRONICS & COMMUNICATION ENGINEERING" },
  { code: "EEE", name: "ELECTRICAL & ELECTRONICS ENGINEERING" },
  { code: "MEC", name: "MECHANICAL ENGINEERING" },
  { code: "CIV", name: "CIVIL ENGINEERING" },
  { code: "PHM", name: "PHARMACY" },
  { code: "CHE", name: "CHEMICAL ENGINEERING" },
  { code: "MIN", name: "MINING ENGINEERING" },
];

const TG_POLYCET_FALLBACK_COURSES = [
  { code: "CME", name: "COMPUTER ENGINEERING" },
  { code: "ECE", name: "ELECTRONICS & COMMUNICATION ENGINEERING" },
  { code: "EEE", name: "ELECTRICAL & ELECTRONICS ENGINEERING" },
  { code: "MEC", name: "MECHANICAL ENGINEERING" },
  { code: "CIV", name: "CIVIL ENGINEERING" },
  { code: "AUT", name: "AUTOMOBILE ENGINEERING" },
  { code: "MIN", name: "MINING ENGINEERING" },
  { code: "CHE", name: "CHEMICAL ENGINEERING" },
  { code: "MET", name: "METALLURGICAL ENGINEERING" },
];

const TG_FALLBACK_DISTRICTS = [
  { code: "HYD", name: "Hyderabad" },
  { code: "MDL", name: "Medchal-Malkajgiri" },
  { code: "RRD", name: "Ranga Reddy" },
  { code: "KMR", name: "Karimnagar" },
  { code: "WGL", name: "Warangal Urban" },
  { code: "NGD", name: "Nalgonda" },
  { code: "KMM", name: "Khammam" },
  { code: "NZB", name: "Nizamabad" },
  { code: "MBN", name: "Mahabubnagar" },
  { code: "SRD", name: "Sangareddy" },
  { code: "YGD", name: "Yadadri Bhuvanagiri" },
  { code: "MDK", name: "Medak" },
  { code: "PED", name: "Peddapalli" },
  { code: "JTL", name: "Jagtial" },
  { code: "BPL", name: "Bhupalpally" },
  { code: "KGM", name: "Bhadradri Kothagudem" },
  { code: "MNCL", name: "Mancherial" },
  { code: "SUR", name: "Suryapet" },
  { code: "VKB", name: "Vikarabad" },
  { code: "WNP", name: "Wanaparthy" },
  { code: "JGN", name: "Jangaon" },
];

function getInitialFallback(examSlug) {
  if (examSlug === "ap-eapcet") {
    return {
      courses: sortCourses(AP_EAPCET_FALLBACK_COURSES, "ap-eapcet"),
      categories: [],
      districts: AP_EAPCET_FALLBACK_DISTRICTS,
      years: [{ year: 2025 }],
    };
  }
  if (examSlug === "tg-icet") {
    return {
      courses: sortCourses(TG_ICET_FALLBACK_COURSES, "tg-icet"),
      categories: TG_CATEGORIES,
      districts: TG_FALLBACK_DISTRICTS,
      years: [{ year: 2025 }],
    };
  }
  if (examSlug === "tg-ecet") {
    return {
      courses: sortCourses(TG_ECET_FALLBACK_COURSES, "tg-ecet"),
      categories: TG_CATEGORIES,
      districts: TG_FALLBACK_DISTRICTS,
      years: [{ year: 2025 }],
    };
  }
  if (examSlug === "tg-polycet") {
    return {
      courses: sortCourses(TG_POLYCET_FALLBACK_COURSES, "tg-polycet"),
      categories: TG_CATEGORIES,
      districts: TG_FALLBACK_DISTRICTS,
      years: [{ year: 2025 }],
    };
  }
  // Default to TG EAPCET
  return {
    courses: sortCourses(TG_EAPCET_FALLBACK_COURSES, "tg-eapcet"),
    categories: TG_CATEGORIES,
    districts: TG_FALLBACK_DISTRICTS,
    years: [{ year: 2025 }],
  };
}

/**
 * Core fetch logic — shared between the hook and prefetchAllExams.
 * Populates referenceCache and sessionStorage, then optionally notifies listeners.
 */
async function fetchExamData(examSlug, onDone) {
  const cacheKey = examSlug || "default";
  if (fetchInProgress.has(cacheKey)) return; // already fetching
  const existing = referenceCache.get(cacheKey) || readSessionCache(cacheKey);
  if (isValidCache(existing)) {
    referenceCache.set(cacheKey, existing);
    onDone && onDone(existing);
    return;
  }

  fetchInProgress.add(cacheKey);
  try {
    const query = examSlug ? `?exam=${examSlug}` : "";
    const [coursesRes, categoriesRes, districtsRes, yearsRes] = await Promise.all([
      api.get(`/courses${query}`).catch(() => []),
      api.get(`/categories${query}`).catch(() => []),
      api.get(`/districts${query}`).catch(() => []),
      api.get(`/years${query}`).catch(() => []),
    ]);

    const fallback = getInitialFallback(examSlug);
    const safeCourses =
      Array.isArray(coursesRes) && coursesRes.length > 0 ? coursesRes : fallback.courses;
    const safeDistricts =
      Array.isArray(districtsRes) && districtsRes.length > 0 ? districtsRes : fallback.districts;

    const result = {
      courses: sortCourses(safeCourses, examSlug),
      categories: sortCategories(
        Array.isArray(categoriesRes) && categoriesRes.length > 0 ? categoriesRes : (fallback.categories || []),
        examSlug
      ),
      districts: safeDistricts,
      years: Array.isArray(yearsRes) && yearsRes.length > 0 ? yearsRes : fallback.years,
    };
    referenceCache.set(cacheKey, result);
    writeSessionCache(cacheKey, result);
    onDone && onDone(result);
  } catch {
    // silently fail — fallback data is already in cache
  } finally {
    fetchInProgress.delete(cacheKey);
  }
}

/**
 * Fire-and-forget: fetch all exam slugs in parallel at app startup.
 * Call this once from main.jsx before ReactDOM.render so data is warm
 * by the time any predictor page mounts.
 */
export function prefetchAllExams() {
  const slugs = ["tg-eapcet", "tg-icet", "tg-ecet", "tg-polycet", "ap-eapcet"];
  slugs.forEach((slug) => fetchExamData(slug));
}

/**
 * Fetches courses/categories/districts/years once and caches them.
 */
export function useReferenceData(examSlug = "tg-icet") {
  const cacheKey = examSlug || "default";

  const getInitialState = () => {
    const raw = referenceCache.get(cacheKey) || readSessionCache(cacheKey);
    if (isValidCache(raw)) {
      referenceCache.set(cacheKey, raw);
      return { data: raw, loading: false };
    }
    return { data: getInitialFallback(examSlug), loading: true };
  };

  const initial = getInitialState();
  const [data, setData] = useState(initial.data);
  // loading = true while fresh data has not yet arrived from server
  const [loading, setLoading] = useState(() => {
    const raw = referenceCache.get(cacheKey) || readSessionCache(cacheKey);
    // If we have valid server data already, no need to show loader
    if (isValidCache(raw)) return false;
    return true;
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const memCached = referenceCache.get(cacheKey) || readSessionCache(cacheKey);
    if (isValidCache(memCached)) {
      setData(memCached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchExamData(examSlug, (result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
        setError(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [examSlug, cacheKey]);

  return { ...data, loading, error };
}