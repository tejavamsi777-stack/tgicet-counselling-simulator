import { pool } from "../config/database.js";

export const adminCutoffRepository = {
  async list({ search, courseCode, categoryCode, gender, year, page = 1, pageSize = 50 }) {
    const conditions = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(col.code ILIKE $${values.length} OR col.name ILIKE $${values.length})`);
    }
    if (courseCode) {
      values.push(courseCode);
      conditions.push(`crs.code = $${values.length}`);
    }
    if (categoryCode) {
      values.push(categoryCode);
      conditions.push(`cat.code = $${values.length}`);
    }
    if (gender) {
      values.push(gender);
      conditions.push(`cu.gender = $${values.length}`);
    }
    if (year) {
      values.push(year);
      conditions.push(`y.year = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await pool.query(
      `
      SELECT COUNT(*) FROM cutoffs cu
      JOIN colleges col ON col.id = cu.college_id
      JOIN courses crs ON crs.id = cu.course_id
      JOIN categories cat ON cat.id = cu.category_id
      JOIN years y ON y.id = cu.year_id
      ${whereClause}
      `,
      values
    );

    values.push(pageSize, (page - 1) * pageSize);
    const dataResult = await pool.query(
      `
      SELECT
        cu.id,
        cu.college_id,
        col.code AS college_code,
        col.name AS college_name,
        cu.course_id,
        crs.code AS course_code,
        crs.name AS course_name,
        cu.category_id,
        cat.code AS category_code,
        cat.name AS category_name,
        cu.year_id,
        y.year,
        cu.gender,
        cu.cutoff_rank
      FROM cutoffs cu
      JOIN colleges col ON col.id = cu.college_id
      JOIN courses crs ON crs.id = cu.course_id
      JOIN categories cat ON cat.id = cu.category_id
      JOIN years y ON y.id = cu.year_id
      ${whereClause}
      ORDER BY col.code, crs.code, cat.code, cu.gender
      LIMIT $${values.length - 1} OFFSET $${values.length}
      `,
      values
    );

    return {
      total: Number(countResult.rows[0].count),
      page,
      pageSize,
      cutoffs: dataResult.rows,
    };
  },

  async getById(id) {
    const { rows } = await pool.query(
      `
      SELECT
        cu.id, cu.college_id, col.code AS college_code, col.name AS college_name,
        cu.course_id, crs.code AS course_code, crs.name AS course_name,
        cu.category_id, cat.code AS category_code, cat.name AS category_name,
        cu.year_id, y.year, cu.gender, cu.cutoff_rank
      FROM cutoffs cu
      JOIN colleges col ON col.id = cu.college_id
      JOIN courses crs ON crs.id = cu.course_id
      JOIN categories cat ON cat.id = cu.category_id
      JOIN years y ON y.id = cu.year_id
      WHERE cu.id = $1
      `,
      [id]
    );
    return rows[0] ?? null;
  },

  async findExisting({ collegeId, courseId, categoryId, yearId, gender }) {
    const { rows } = await pool.query(
      `SELECT id FROM cutoffs
       WHERE college_id = $1 AND course_id = $2 AND category_id = $3 AND year_id = $4 AND gender = $5`,
      [collegeId, courseId, categoryId, yearId, gender]
    );
    return rows[0] ?? null;
  },

  async create({ collegeId, courseId, categoryId, yearId, gender, cutoffRank }) {
    const { rows } = await pool.query(
      `INSERT INTO cutoffs (college_id, course_id, category_id, year_id, gender, cutoff_rank)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [collegeId, courseId, categoryId, yearId, gender, cutoffRank]
    );
    return this.getById(rows[0].id);
  },

  async update(id, { gender, cutoffRank }) {
    const { rows } = await pool.query(
      `UPDATE cutoffs SET
         gender = COALESCE($2, gender),
         cutoff_rank = COALESCE($3, cutoff_rank)
       WHERE id = $1
       RETURNING id`,
      [id, gender ?? null, cutoffRank ?? null]
    );
    if (rows.length === 0) return null;
    return this.getById(rows[0].id);
  },

  async remove(id) {
    const { rowCount } = await pool.query("DELETE FROM cutoffs WHERE id = $1", [id]);
    return rowCount > 0;
  },
};