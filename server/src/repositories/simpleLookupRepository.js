import { pool } from "../config/database.js";

export function createLookupRepository(tableName) {
  return {
    async list() {
      const { rows } = await pool.query(`SELECT * FROM ${tableName} ORDER BY code`);
      return rows;
    },
    async getById(id) {
      const { rows } = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
      return rows[0] ?? null;
    },
    async findByCode(code) {
      const { rows } = await pool.query(`SELECT * FROM ${tableName} WHERE code = $1`, [code]);
      return rows[0] ?? null;
    },
    async create({ code, name }) {
      const { rows } = await pool.query(
        `INSERT INTO ${tableName} (code, name) VALUES ($1, $2) RETURNING *`,
        [code, name]
      );
      return rows[0];
    },
    async update(id, { name }) {
      const { rows } = await pool.query(
        `UPDATE ${tableName} SET name = $1 WHERE id = $2 RETURNING *`,
        [name, id]
      );
      return rows[0] ?? null;
    },
    async remove(id) {
      const { rowCount } = await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
      return rowCount > 0;
    },
  };
}