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
    await validateOfferedCourses(data.offeredCourses);
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
    await validateOfferedCourses(data.offeredCourses);
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

async function validateOfferedCourses(offeredCourses) {
  if (offeredCourses === undefined || offeredCourses.length === 0) return;
  const ids = offeredCourses.map((course) => Number(course.courseId));
  const { rows } = await pool.query("SELECT id FROM courses WHERE id = ANY($1::int[])", [ids]);
  if (rows.length !== ids.length) {
    const err = new Error("One or more selected courses no longer exist");
    err.status = 400;
    throw err;
  }
}
