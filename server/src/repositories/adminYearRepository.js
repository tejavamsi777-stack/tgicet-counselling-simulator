import { pool } from "../config/database.js";

export const adminYearRepository = {
  async list() {
    const { rows } = await pool.query(
      "SELECT id, year, is_active, is_archived FROM years ORDER BY year DESC"
    );
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