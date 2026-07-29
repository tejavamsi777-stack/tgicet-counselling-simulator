import { pool } from "../config/database.js";

export const referenceRepository = {
  async getDistricts() {
    const { rows } = await pool.query("SELECT id, code, name FROM districts ORDER BY code");
    return rows;
  },
  async getCourses() {
    const { rows } = await pool.query("SELECT id, code, name FROM courses ORDER BY code");
    return rows;
  },
  async getCategories() {
    const { rows } = await pool.query("SELECT id, code, name FROM categories ORDER BY code");
    return rows;
  },
  async getYears() {
    const { rows } = await pool.query(
      "SELECT id, year FROM years WHERE is_active = true ORDER BY year DESC"
    );
    return rows;
  },
};