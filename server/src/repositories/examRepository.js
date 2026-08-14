import { pool } from "../config/database.js";

export const examRepository = {
  async list() {
    const { rows } = await pool.query(
      "SELECT id, slug, short_name, name, description, is_active FROM exams ORDER BY short_name"
    );
    return rows;
  },

  async findBySlug(slug) {
    const { rows } = await pool.query(
      "SELECT id, slug, short_name, name, description, is_active FROM exams WHERE slug = $1",
      [slug]
    );
    return rows[0] ?? null;
  },
};
