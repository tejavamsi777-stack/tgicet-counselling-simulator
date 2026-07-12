import { pool } from "../config/database.js";

export const predictionRepository = {
  async findMatches({ rank, category, gender, course, year }) {
    const sql = `
      SELECT
        col.code, col.name, col.place, col.university,
        col.ownership_type, col.is_minority, col.is_girls, col.is_self_finance,
        d.code AS district_code,
        cu.cutoff_rank,
        crs.code AS course_code, crs.name AS course_name,
        cat.code AS category_code,
        cc.fee
      FROM cutoffs cu
      JOIN colleges col ON col.id = cu.college_id
      JOIN districts d ON d.id = col.district_id
      JOIN courses crs ON crs.id = cu.course_id
      JOIN categories cat ON cat.id = cu.category_id
      JOIN years y ON y.id = cu.year_id
      LEFT JOIN college_courses cc ON cc.college_id = col.id AND cc.course_id = cu.course_id
      WHERE crs.code = $1
        AND cat.code = $2
        AND cu.gender = $3
        AND y.year = $4
        AND cu.cutoff_rank >= $5
        AND col.is_active = true
      ORDER BY cu.cutoff_rank ASC
    `;
    const { rows } = await pool.query(sql, [course, category, gender, year, rank]);
    return rows;
  },
};