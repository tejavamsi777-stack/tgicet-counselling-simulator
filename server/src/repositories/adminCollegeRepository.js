import { pool } from "../config/database.js";

export const adminCollegeRepository = {
  async list({ search, isActive, page = 1, pageSize = 50 }) {
    const conditions = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(c.code ILIKE $${values.length} OR c.name ILIKE $${values.length})`);
    }
    if (isActive !== undefined) {
      values.push(isActive);
      conditions.push(`c.is_active = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM colleges c ${whereClause}`,
      values
    );

    values.push(pageSize, (page - 1) * pageSize);
    const dataResult = await pool.query(
      `
      SELECT c.*, d.code AS district_code
      FROM colleges c
      LEFT JOIN districts d ON d.id = c.district_id
      ${whereClause}
      ORDER BY c.code
      LIMIT $${values.length - 1} OFFSET $${values.length}
      `,
      values
    );

    return {
      total: Number(countResult.rows[0].count),
      page,
      pageSize,
      colleges: dataResult.rows,
    };
  },

  async getById(id) {
    const { rows } = await pool.query(
      `SELECT c.*, d.code AS district_code FROM colleges c LEFT JOIN districts d ON d.id = c.district_id WHERE c.id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async findByCode(code) {
    const { rows } = await pool.query("SELECT * FROM colleges WHERE code = $1", [code]);
    return rows[0] ?? null;
  },

  async create(data) {
    const { rows } = await pool.query(
      `
      INSERT INTO colleges
        (code, name, district_id, place, university, ownership_type, is_minority, is_girls, is_self_finance, website, address, phone, email)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *
      `,
      [
        data.code, data.name, data.districtId, data.place, data.university,
        data.ownershipType, data.isMinority ?? false, data.isGirls ?? false,
        data.isSelfFinance ?? false, data.website, data.address, data.phone, data.email,
      ]
    );
    return rows[0];
  },

  async update(id, data) {
    const { rows } = await pool.query(
      `
      UPDATE colleges SET
        name = $1, district_id = $2, place = $3, university = $4,
        ownership_type = $5, is_minority = $6, is_girls = $7, is_self_finance = $8,
        website = $9, address = $10, phone = $11, email = $12, updated_at = NOW()
      WHERE id = $13
      RETURNING *
      `,
      [
        data.name, data.districtId, data.place, data.university,
        data.ownershipType, data.isMinority, data.isGirls, data.isSelfFinance,
        data.website, data.address, data.phone, data.email, id,
      ]
    );
    return rows[0] ?? null;
  },

  async setActive(id, isActive) {
    const { rows } = await pool.query(
      "UPDATE colleges SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [isActive, id]
    );
    return rows[0] ?? null;
  },

  async remove(id) {
    const { rowCount } = await pool.query("DELETE FROM colleges WHERE id = $1", [id]);
    return rowCount > 0;
  },
};