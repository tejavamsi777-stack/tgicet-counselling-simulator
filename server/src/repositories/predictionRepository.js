import { pool } from "../config/database.js";

export const predictionRepository = {
  async findMatches({ rank, category, gender, courses = [], districts = [], years = [], year, examId }) {
    const yearList = Array.isArray(years) && years.length > 0 ? years : (year ? [Number(year)] : []);
    const params = [examId, category, gender, rank];

    let sql = `
      SELECT
        col.code, col.name, col.place, col.university,
        col.ownership_type, col.is_minority, col.is_girls, col.is_self_finance,
        d.code AS district_code,
        d.name AS district_name,
        cu.cutoff_rank,
        cu.gender AS gender,
        crs.code AS course_code, crs.name AS course_name,
        cat.code AS category_code,
        y.year AS year,
        cc.fee
      FROM cutoffs cu
      JOIN colleges col ON col.id = cu.college_id
      JOIN districts d ON d.id = col.district_id
      JOIN courses crs ON crs.id = cu.course_id
      JOIN categories cat ON cat.id = cu.category_id
      JOIN years y ON y.id = cu.year_id
      LEFT JOIN college_courses cc ON cc.college_id = col.id AND cc.course_id = cu.course_id
      WHERE cu.exam_id = $1
        AND col.exam_id = $1
        AND crs.exam_id = $1
        AND cat.exam_id = $1
        AND y.exam_id = $1
        AND cat.code = $2
        AND cu.gender = $3
        AND cu.cutoff_rank >= FLOOR($4 * 0.85)
        AND col.is_active = true
    `;

    if (Array.isArray(yearList) && yearList.length > 0 && !yearList.includes("ALL")) {
      params.push(yearList);
      sql += ` AND y.year = ANY($${params.length}::int[])`;
    }

    if (Array.isArray(courses) && courses.length > 0 && !courses.includes("ALL")) {
      params.push(courses);
      sql += ` AND crs.code = ANY($${params.length}::text[])`;
    }

    if (Array.isArray(districts) && districts.length > 0 && !districts.includes("ALL")) {
      params.push(districts);
      sql += ` AND (d.code = ANY($${params.length}::text[]) OR UPPER(d.name) = ANY($${params.length}::text[]))`;
    }

    sql += ` ORDER BY cu.cutoff_rank ASC`;

    const { rows } = await pool.query(sql, params);
    return rows;
  },
};

