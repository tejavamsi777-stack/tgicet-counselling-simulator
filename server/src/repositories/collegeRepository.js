import { pool } from "../config/database.js";

export const collegeRepository = {
  async getColleges({ course, district } = {}) {
    const conditions = [];
    const values = [];

    let sql = `
      SELECT
        c.id, c.code, c.name, c.place, c.university,
        c.ownership_type, c.is_minority, c.is_girls, c.is_self_finance,
        d.code AS district_code
      FROM colleges c
      LEFT JOIN districts d ON d.id = c.district_id
      WHERE c.is_active = true
    `;

    if (district) {
      values.push(district);
      conditions.push(`d.code = $${values.length}`);
    }

    if (course) {
      values.push(course);
      conditions.push(`
        EXISTS (
          SELECT 1 FROM college_courses cc
          JOIN courses co ON co.id = cc.course_id
          WHERE cc.college_id = c.id AND co.code = $${values.length}
        )
      `);
    }

    if (conditions.length > 0) {
      sql += " AND " + conditions.join(" AND ");
    }

    sql += " ORDER BY c.code";

    const { rows } = await pool.query(sql, values);
    return rows;
  },
};