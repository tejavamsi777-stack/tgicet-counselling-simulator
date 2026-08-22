import { useEffect, useState } from "react";
import { api } from "../lib/api";

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

function readSessionCache(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`tg_ref_v4_${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSessionCache(key, val) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`tg_ref_v4_${key}`, JSON.stringify(val));
  } catch {
    // ignore quota
  }
}

/**
 * Fetches courses/categories/districts/years once and caches them.
 */
export function useReferenceData(examSlug = "tg-icet") {
  const cacheKey = examSlug || "default";
  const cached = referenceCache.get(cacheKey) || readSessionCache(cacheKey);

  const [data, setData] = useState(() => {
    if (cached) {
      referenceCache.set(cacheKey, cached);
      return cached;
    }
    return {
      courses: [],
      categories: [],
      districts: [],
      years: [],
    };
  });
  const [loading, setLoading] = useState(() => !cached);
  const [error, setError] = useState(null);

  useEffect(() => {
    const memCached = referenceCache.get(cacheKey) || readSessionCache(cacheKey);
    if (memCached) {
      setData(memCached);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const query = examSlug ? `?exam=${examSlug}` : "";
        const [courses, categories, districts, years] = await Promise.all([
          api.get(`/courses${query}`),
          api.get(`/categories${query}`),
          api.get(`/districts${query}`),
          api.get(`/years${query}`),
        ]);
        const result = {
          courses: sortCourses(courses, examSlug),
          categories: sortCategories(categories, examSlug),
          districts,
          years,
        };
        referenceCache.set(cacheKey, result);
        writeSessionCache(cacheKey, result);
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [examSlug, cacheKey]);

  return { ...data, loading, error };
}