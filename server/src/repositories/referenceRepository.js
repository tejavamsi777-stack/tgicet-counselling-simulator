import { pool } from "../config/database.js";

export const referenceRepository = {
  async getDistricts(examId) {
    const { rows } = await pool.query(
      "SELECT DISTINCT d.id, d.code, d.name FROM districts d JOIN colleges c ON c.district_id = d.id WHERE c.exam_id = $1 ORDER BY d.code",
      [examId]
    );
    return rows;
  },
  async getCourses(examId) {
    const cutoffCourses = await pool.query(
      `SELECT DISTINCT c.id, c.code, c.name,
         CASE c.code 
           WHEN 'MBA' THEN 1 
           WHEN 'MCA' THEN 2 
           WHEN 'MBT' THEN 3 
           WHEN 'MTM' THEN 4 
           WHEN 'MTH' THEN 5 
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
    return allCourses.rows;
  },
  async getCategories(examId) {
    const { rows } = await pool.query("SELECT id, code, name FROM categories WHERE exam_id = $1 ORDER BY code", [examId]);
    return rows;
  },
  async getYears(examId) {
    const { rows } = await pool.query(
      "SELECT id, year FROM years WHERE exam_id = $1 AND is_active = true ORDER BY year DESC", [examId]
    );
    if (rows.length > 0) return rows;
    return [{ id: 0, year: 2025 }];
  },
};
