import { pool } from "../config/database.js";
import { adminCutoffRepository } from "../repositories/adminCutoffRepository.js";

async function resolveId(table, code, label) {
  if (!code) return null;
  const { rows } = await pool.query(`SELECT id FROM ${table} WHERE code = $1`, [code]);
  if (rows.length === 0) {
    const err = new Error(`Unknown ${label} code: ${code}`);
    err.status = 400;
    throw err;
  }
  return rows[0].id;
}

async function resolveActiveYearId() {
  const { rows } = await pool.query(
    "SELECT id FROM years WHERE is_active = true ORDER BY year DESC LIMIT 1"
  );
  if (rows.length === 0) {
    const err = new Error("No active year is configured in the years table");
    err.status = 400;
    throw err;
  }
  return rows[0].id;
}

export const adminCutoffService = {
  list: (filters) => adminCutoffRepository.list(filters),
  getById: (id) => adminCutoffRepository.getById(id),

  async create(data) {
    const [courseId, categoryId, yearId] = await Promise.all([
      resolveId("courses", data.course, "course"),
      resolveId("categories", data.category, "category"),
      resolveActiveYearId(),
    ]);

    const existing = await adminCutoffRepository.findExisting({
      collegeId: Number(data.collegeId),
      courseId,
      categoryId,
      yearId,
      gender: data.gender,
    });
    if (existing) {
      const err = new Error(
        "A cutoff row for this college + course + category + gender already exists for the active year — edit it instead."
      );
      err.status = 409;
      throw err;
    }

    return adminCutoffRepository.create({
      collegeId: Number(data.collegeId),
      courseId,
      categoryId,
      yearId,
      gender: data.gender,
      cutoffRank: Number(data.cutoffRank),
    });
  },

  async update(id, data) {
    const existing = await adminCutoffRepository.getById(id);
    if (!existing) {
      const err = new Error("Cutoff row not found");
      err.status = 404;
      throw err;
    }
    return adminCutoffRepository.update(id, {
      gender: data.gender,
      cutoffRank: data.cutoffRank !== undefined ? Number(data.cutoffRank) : undefined,
    });
  },

  async remove(id) {
    const deleted = await adminCutoffRepository.remove(id);
    if (!deleted) {
      const err = new Error("Cutoff row not found");
      err.status = 404;
      throw err;
    }
  },
};