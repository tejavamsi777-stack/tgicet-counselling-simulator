import { pool } from "../config/database.js";
import { adminCollegeRepository } from "../repositories/adminCollegeRepository.js";

async function resolveDistrictId(districtCode) {
  if (!districtCode) return null;
  const { rows } = await pool.query("SELECT id FROM districts WHERE code = $1", [districtCode]);
  if (rows.length === 0) {
    const err = new Error(`Unknown district code: ${districtCode}`);
    err.status = 400;
    throw err;
  }
  return rows[0].id;
}

export const adminCollegeService = {
  list: (filters) => adminCollegeRepository.list(filters),
  getById: (id) => adminCollegeRepository.getById(id),

  async create(data) {
    const existing = await adminCollegeRepository.findByCode(data.code);
    if (existing) {
      const err = new Error(`College code '${data.code}' already exists`);
      err.status = 409;
      throw err;
    }
    const districtId = await resolveDistrictId(data.district);
    return adminCollegeRepository.create({ ...data, districtId });
  },

  async update(id, data) {
    const existing = await adminCollegeRepository.getById(id);
    if (!existing) {
      const err = new Error("College not found");
      err.status = 404;
      throw err;
    }
    const districtId = await resolveDistrictId(data.district);
    return adminCollegeRepository.update(id, { ...data, districtId });
  },

  async setActive(id, isActive) {
    const result = await adminCollegeRepository.setActive(id, isActive);
    if (!result) {
      const err = new Error("College not found");
      err.status = 404;
      throw err;
    }
    return result;
  },

  async remove(id) {
    const deleted = await adminCollegeRepository.remove(id);
    if (!deleted) {
      const err = new Error("College not found");
      err.status = 404;
      throw err;
    }
  },
};