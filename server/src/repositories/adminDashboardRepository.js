import { pool } from "../config/database.js";

export const adminDashboardRepository = {
  async getCounts() {
    const [colleges, courses, categories, districts] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM colleges"),
      pool.query("SELECT COUNT(*) FROM courses"),
      pool.query("SELECT COUNT(*) FROM categories"),
      pool.query("SELECT COUNT(*) FROM districts"),
    ]);

    return {
      totalColleges: Number(colleges.rows[0].count),
      totalCourses: Number(courses.rows[0].count),
      totalCategories: Number(categories.rows[0].count),
      totalDistricts: Number(districts.rows[0].count),
    };
  },

  // No dedicated audit-log table exists yet, so "recent activity" is derived
  // from colleges.created_at / updated_at. Good enough for now — if a real
  // audit trail is needed later (e.g. tracking admin user + action type),
  // that's a separate table + write-through from every admin mutation.
  async getRecentActivity(limit = 10) {
    const { rows } = await pool.query(
      `
      SELECT
        c.code, c.name, c.created_at, c.updated_at,
        CASE WHEN c.created_at = c.updated_at THEN 'created' ELSE 'updated' END AS action
      FROM colleges c
      ORDER BY c.updated_at DESC
      LIMIT $1
      `,
      [limit]
    );
    return rows;
  },
};