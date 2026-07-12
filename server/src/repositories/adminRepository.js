import { pool } from "../config/database.js";

export const adminRepository = {
  async findByEmail(email) {
    const sql = `
      SELECT a.*, r.name AS role_name
      FROM admins a
      JOIN roles r ON r.id = a.role_id
      WHERE a.email = $1
    `;
    const { rows } = await pool.query(sql, [email]);
    return rows[0] ?? null;
  },
  async findById(id) {
    const sql = `
      SELECT a.*, r.name AS role_name
      FROM admins a
      JOIN roles r ON r.id = a.role_id
      WHERE a.id = $1
    `;
    const { rows } = await pool.query(sql, [id]);
    return rows[0] ?? null;
  },
  async create({ email, passwordHash, name, roleId }) {
    const { rows } = await pool.query(
      "INSERT INTO admins (email, password_hash, name, role_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [email, passwordHash, name, roleId]
    );
    return rows[0];
  },

  async updatePassword(id, passwordHash) {
    const { rows } = await pool.query(
      "UPDATE admins SET password_hash = $1 WHERE id = $2 RETURNING id",
      [passwordHash, id]
    );
    return rows[0] ?? null;
  },
};
