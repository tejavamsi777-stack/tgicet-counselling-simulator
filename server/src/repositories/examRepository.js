import { pool } from "../config/database.js";

const STATIC_EXAMS = [
  { id: 1, slug: "tg-icet", short_name: "TG ICET", name: "Telangana Integrated Common Entrance Test", is_active: true },
  { id: 2, slug: "tg-eapcet", short_name: "TG EAPCET", name: "Telangana Engineering Common Entrance Test", is_active: true },
  { id: 4, slug: "ap-eapcet", short_name: "AP EAPCET", name: "Andhra Pradesh Engineering Common Entrance Test", is_active: true },
  { id: 5, slug: "kcet", short_name: "KCET", name: "Karnataka Common Entrance Test", is_active: true },
  { id: 6, slug: "tg-ecet", short_name: "TG ECET", name: "Telangana Engineering Common Entrance Test", is_active: true },
  { id: 7, slug: "tg-polycet", short_name: "TG POLYCET", name: "Telangana Polytechnic Common Entrance Test", is_active: true },
  { id: 8, slug: "tg-pgecet", short_name: "TG PGECET", name: "Telangana Post Graduate Common Entrance Test", is_active: true },
];

let cachedExams = null;
let lastExamFetch = 0;
const EXAM_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function getOrFetchExams() {
  if (cachedExams && Date.now() - lastExamFetch < EXAM_CACHE_TTL) {
    return cachedExams;
  }
  try {
    const { rows } = await pool.query(
      "SELECT id, slug, short_name, name, description, is_active FROM exams ORDER BY short_name"
    );
    if (rows && rows.length > 0) {
      // Merge with static exams to ensure ap-icet, ap-eapcet, etc. exist
      const merged = [...rows];
      STATIC_EXAMS.forEach((se) => {
        if (!merged.some((r) => r.slug === se.slug)) {
          merged.push(se);
        }
      });
      cachedExams = merged;
      lastExamFetch = Date.now();
      return cachedExams;
    }
  } catch (err) {
    console.warn("[ExamRepository] DB query failed, using static exams list:", err.message);
  }
  cachedExams = STATIC_EXAMS;
  lastExamFetch = Date.now();
  return cachedExams;
}

export const examRepository = {
  async list() {
    return getOrFetchExams();
  },

  async findBySlug(slug) {
    const exams = await getOrFetchExams();
    const s = String(slug || '').trim().toLowerCase();
    let found = exams.find((e) => e.slug?.toLowerCase() === s || e.short_name?.toLowerCase() === s || e.slug?.replace(/-/g, '_').toLowerCase() === s.replace(/-/g, '_'));
    if (!found) {
      found = STATIC_EXAMS.find((e) => e.slug?.toLowerCase() === s || e.short_name?.toLowerCase() === s || e.slug?.replace(/-/g, '_').toLowerCase() === s.replace(/-/g, '_'));
    }
    return found ?? { id: 99, slug: s, short_name: s.toUpperCase(), name: s.toUpperCase(), is_active: true };
  },
};
