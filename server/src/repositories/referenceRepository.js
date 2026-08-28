import { pool } from "../config/database.js";

const AP_DISTRICTS = [
  { id: 1, code: "ANT", name: "Anantapur" },
  { id: 2, code: "ANN", name: "Annamayya" },
  { id: 3, code: "CTR", name: "Chittoor" },
  { id: 4, code: "EGD", name: "East Godavari" },
  { id: 5, code: "GNT", name: "Guntur" },
  { id: 6, code: "KDP", name: "Kadapa" },
  { id: 7, code: "KRS", name: "Krishna" },
  { id: 8, code: "KRN", name: "Kurnool" },
  { id: 9, code: "NLR", name: "Nellore" },
  { id: 10, code: "NTR", name: "NTR" },
  { id: 11, code: "PLN", name: "Palnadu" },
  { id: 12, code: "PRK", name: "Prakasam" },
  { id: 13, code: "SRK", name: "Srikakulam" },
  { id: 14, code: "VSP", name: "Visakhapatnam" },
  { id: 15, code: "VZN", name: "Vizianagaram" },
  { id: 16, code: "WGD", name: "West Godavari" },
];

const AP_ICET_COURSES = [
  { id: 1, code: "MBA", name: "MASTER OF BUSINESS ADMINISTRATION" },
  { id: 2, code: "MCA", name: "MASTER OF COMPUTER APPLICATIONS" },
];

const AP_ICET_CATEGORIES = [
  { id: 1, code: "OC", name: "OC" },
  { id: 2, code: "BC_A", name: "BC-A" },
  { id: 3, code: "BC_B", name: "BC-B" },
  { id: 4, code: "BC_C", name: "BC-C" },
  { id: 5, code: "BC_D", name: "BC-D" },
  { id: 6, code: "BC_E", name: "BC-E" },
  { id: 7, code: "SC", name: "SC" },
  { id: 8, code: "ST", name: "ST" },
  { id: 9, code: "EWS", name: "EWS" },
];

export const referenceRepository = {
  async getDistricts(examId) {
    try {
      const { rows } = await pool.query(
        "SELECT DISTINCT d.id, d.code, d.name FROM districts d JOIN colleges c ON c.district_id = d.id WHERE c.exam_id = $1 ORDER BY d.code",
        [examId]
      );
      if (rows && rows.length > 0) return rows;
    } catch (e) {}
    return AP_DISTRICTS;
  },

  async getCourses(examId) {
    try {
      const cutoffCourses = await pool.query(
        `SELECT DISTINCT c.id, c.code, c.name,
           CASE c.code 
             WHEN 'MBA' THEN 1 
             WHEN 'MCA' THEN 2 
             ELSE 6 
           END AS sort_order
         FROM courses c 
         JOIN cutoffs cu ON cu.course_id = c.id 
         WHERE c.exam_id = $1 
         ORDER BY sort_order, c.code`,
        [examId]
      );

      if (cutoffCourses.rows.length > 0) {
        return cutoffCourses.rows.map(({ sort_order, ...course }) => course);
      }

      const allCourses = await pool.query(
        `SELECT id, code, name FROM courses WHERE exam_id = $1 ORDER BY code`,
        [examId]
      );
      if (allCourses.rows.length > 0) return allCourses.rows;
    } catch (e) {}

    return AP_ICET_COURSES;
  },

  async getCategories(examId) {
    try {
      const cutoffCats = await pool.query(
        `SELECT DISTINCT cat.id, cat.code, cat.name
         FROM categories cat
         JOIN cutoffs cu ON cu.category_id = cat.id
         WHERE cu.exam_id = $1
         ORDER BY cat.code`,
        [examId]
      );
      if (cutoffCats.rows.length > 0) return cutoffCats.rows;

      const { rows } = await pool.query(
        "SELECT id, code, name FROM categories WHERE exam_id = $1 OR exam_id = 1 ORDER BY code",
        [examId]
      );
      if (rows && rows.length > 0) return rows;
    } catch (e) {}

    return AP_ICET_CATEGORIES;
  },

  async getYears(examId) {
    try {
      const { rows } = await pool.query(
        "SELECT id, year FROM years WHERE exam_id = $1 AND is_active = true ORDER BY year DESC", [examId]
      );
      if (rows && rows.length > 0) return rows;
    } catch (e) {}

    return [{ id: 1, year: 2025 }, { id: 2, year: 2024 }];
  },
};
