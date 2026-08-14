import { pool } from "../config/database.js";

export const adminYearRepository = {
  async list(examSlug = null) {
    let sql = `
      SELECT 
        y.id, 
        y.year, 
        y.is_active, 
        y.is_archived, 
        y.exam_id, 
        e.slug AS exam_slug, 
        e.short_name AS exam_short_name, 
        e.name AS exam_name,
        COALESCE(c.cutoff_count, 0)::int AS cutoff_count
      FROM years y
      JOIN exams e ON y.exam_id = e.id
      LEFT JOIN (
        SELECT year_id, COUNT(*) AS cutoff_count 
        FROM cutoffs 
        GROUP BY year_id
      ) c ON c.year_id = y.id
    `;
    const params = [];

    if (examSlug && examSlug !== "all") {
      sql += " WHERE e.slug = $1";
      params.push(examSlug);
    }

    sql += " ORDER BY e.short_name ASC, y.year DESC";

    const { rows } = await pool.query(sql, params);
    return rows;
  },

  async setActive(id, isActive) {
    const { rows } = await pool.query(
      "UPDATE years SET is_active = $1 WHERE id = $2 RETURNING id, year, is_active, is_archived",
      [isActive, id]
    );
    return rows[0] ?? null;
  },

  async remove(id) {
    // Delete dependent cutoff rows first — cutoffs reference years via year_id
    await pool.query("DELETE FROM cutoffs WHERE year_id = $1", [id]);
    const { rows } = await pool.query(
      "DELETE FROM years WHERE id = $1 RETURNING id, year",
      [id]
    );
    return rows[0] ?? null;
  },
};