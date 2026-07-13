import { pool } from "../config/database.js";

export const userRepository = {
  async findByEmail(email) {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return rows[0] ?? null;
  },

  async findById(id) {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );
    return rows[0] ?? null;
  },

  async findByGoogleId(googleId) {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE google_id = $1",
      [googleId]
    );
    return rows[0] ?? null;
  },

  async create({ firstName, lastName, email, passwordHash, googleId }) {
    const { rows } = await pool.query(
      `INSERT INTO users
      (first_name, last_name, email, password_hash, google_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [firstName, lastName, email, passwordHash, googleId]
    );

    return rows[0];
  },

  async linkGoogleId(userId, googleId) {
    const { rows } = await pool.query(
      "UPDATE users SET google_id = $1 WHERE id = $2 RETURNING *",
      [googleId, userId]
    );
    return rows[0];
  },
};