import { pool } from "../config/database.js";

export const collegeRepository = {
  async getColleges({ district } = {}) {
    const conditions = ["c.is_active = true"];
    const values = [];

    if (district) {
      values.push(district);
      conditions.push(`d.code = $${values.length}`);
    }

    const sql = `
      SELECT
        c.id, c.code, c.name, c.place, c.university,
        c.ownership_type, c.is_minority, c.is_girls, c.is_self_finance,
        d.code AS district_code, d.name AS district_name,
        COALESCE(
          json_agg(co.code ORDER BY co.code) FILTER (WHERE co.code IS NOT NULL),
          '[]'
        ) AS courses,
        COALESCE(
          json_agg(
            json_build_object('code', co.code, 'name', co.name, 'fee', cc.fee)
            ORDER BY co.code
          ) FILTER (WHERE co.code IS NOT NULL),
          '[]'
        ) AS "courseFees"
      FROM colleges c
      LEFT JOIN districts d ON d.id = c.district_id
      LEFT JOIN college_courses cc ON cc.college_id = c.id
      LEFT JOIN courses co ON co.id = cc.course_id
      WHERE ${conditions.join(" AND ")}
      GROUP BY c.id, d.code, d.name
      ORDER BY c.code
    `;

    const { rows } = await pool.query(sql, values);
    return rows;
  },
};
