import { pool } from "../config/database.js";

let cachedExams = null;
let lastExamFetch = 0;
const EXAM_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function getOrFetchExams() {
  if (cachedExams && Date.now() - lastExamFetch < EXAM_CACHE_TTL) {
    return cachedExams;
  }
  const { rows } = await pool.query(
    "SELECT id, slug, short_name, name, description, is_active FROM exams ORDER BY short_name"
  );
  cachedExams = rows;
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
    return exams.find((e) => e.slug?.toLowerCase() === s || e.short_name?.toLowerCase() === s || e.slug?.replace(/-/g, '_').toLowerCase() === s.replace(/-/g, '_')) ?? null;
  },
};
