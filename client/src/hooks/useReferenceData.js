import { useEffect, useState } from "react";
import { api } from "../lib/api";

// Canonical category order: OC → EWS → BC_A to BC_E → SC_I to SC_III / SC → ST
const CATEGORY_ORDER = [
  "OC", "EWS",
  "BC_A", "BC-A", "BCA",
  "BC_B", "BC-B", "BCB",
  "BC_C", "BC-C", "BCC",
  "BC_D", "BC-D", "BCD",
  "BC_E", "BC-E", "BCE",
  "SC_I", "SC-I", "SC1", "SC_1",
  "SC_II", "SC-II", "SC2", "SC_2",
  "SC_III", "SC-III", "SC3", "SC_3",
  "SC",
  "ST",
];

function getCategoryRank(code) {
  const norm = (code ?? "").toString().trim().toUpperCase();
  const idx = CATEGORY_ORDER.findIndex((c) => c.toUpperCase() === norm);
  return idx === -1 ? 999 : idx;
}

export function sortCategories(categories = []) {
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

// In-memory cache across all dropdown instances and page navigations
const referenceCache = new Map();

/**
 * Fetches courses/categories/districts/years once and caches them.
 */
export function useReferenceData(examSlug = "tg-icet") {
  const cacheKey = examSlug || "default";
  const cached = referenceCache.get(cacheKey);

  const [data, setData] = useState(() => {
    if (cached) return cached;
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
    if (referenceCache.has(cacheKey)) {
      setData(referenceCache.get(cacheKey));
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
          categories: sortCategories(categories),
          districts,
          years,
        };
        referenceCache.set(cacheKey, result);
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