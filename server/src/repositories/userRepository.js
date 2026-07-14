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

  // Partial update — only fields actually passed in `fields` get touched.
  // Accepts: firstName, lastName, passwordHash
  async update(id, fields) {
    const columnMap = {
      firstName: "first_name",
      lastName: "last_name",
      passwordHash: "password_hash",
    };

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, column] of Object.entries(columnMap)) {
      if (fields[key] !== undefined) {
        setClauses.push(`${column} = $${paramIndex}`);
        values.push(fields[key]);
        paramIndex += 1;
      }
    }

    if (setClauses.length === 0) {
      // nothing to update — just return the current row
      return this.findById(id);
    }

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return rows[0] ?? null;
  },
};