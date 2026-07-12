import { pool } from "../config/database.js";

export const userRepository = {
  async findByEmail(email) {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return rows[0] ?? null;
  },
  async findById(id) {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return rows[0] ?? null;
  },
  async create({ email, passwordHash, name }) {
    const { rows } = await pool.query(
      "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *",
      [email, passwordHash, name]
    );
    return rows[0];
  },
};