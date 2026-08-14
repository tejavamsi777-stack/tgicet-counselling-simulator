import { useEffect, useState } from "react";
import { api } from "../lib/api";

// Canonical order: OC → EWS → BC_A to BC_E → SC_I to SC_III / SC → ST
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

export function sortCategories(categories) {
  return [...categories].sort((a, b) => {
    const codeA = a?.code ?? a ?? "";
    const codeB = b?.code ?? b ?? "";
    const rankA = getCategoryRank(codeA);
    const rankB = getCategoryRank(codeB);
    if (rankA !== rankB) return rankA - rankB;
    return codeA.localeCompare(codeB);
  });
}

/**
 * Fetches courses/categories/districts/years once and shares them.
 */
export function useReferenceData(examSlug = "tg-icet") {
  const [data, setData] = useState({
    courses: [],
    categories: [],
    districts: [],
    years: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
        if (!cancelled) {
          setData({ courses, categories: sortCategories(categories), districts, years });
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
  }, [examSlug]);

  return { ...data, loading, error };
}