import { useEffect, useState } from "react";
import { api } from "../lib/api";

// Custom display order — overrides the database's alphabetical ORDER BY.
const CATEGORY_ORDER = ["OC", "EWS", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC", "ST"];

function sortCategories(categories) {
  return [...categories].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.code);
    const bi = CATEGORY_ORDER.indexOf(b.code);
    // Anything not in the list (shouldn't normally happen) falls to the end, alphabetically among themselves.
    if (ai === -1 && bi === -1) return a.code.localeCompare(b.code);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

/**
 * Fetches courses/categories/districts/years once and shares them.
 * Falls back to empty arrays on error (form just shows no options rather than crashing).
 */
export function useReferenceData() {
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
        const [courses, categories, districts, years] = await Promise.all([
          api.get("/courses"),
          api.get("/categories"),
          api.get("/districts"),
          api.get("/years"),
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
  }, []);

  return { ...data, loading, error };
}