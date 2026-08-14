import * as XLSX from "xlsx";
import { pool } from "../config/database.js";

const REQUIRED_COLUMNS = [
  "code", "name", "district", "course", "courseName", "category", "gender", "cutoff",
];

function parseWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

function validateRows(rows) {
  const errors = [];
  const seen = new Set();
  const duplicates = [];

  if (rows.length === 0) {
    errors.push({ row: 0, message: "Spreadsheet has no data rows" });
    return { errors, duplicates };
  }

  const headers = Object.keys(rows[0]);
  const missingColumns = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  if (missingColumns.length > 0) {
    errors.push({ row: 0, message: `Missing required columns: ${missingColumns.join(", ")}` });
    return { errors, duplicates };
  }

  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    REQUIRED_COLUMNS.forEach((col) => {
      if (row[col] === "" || row[col] === undefined || row[col] === null) {
        errors.push({ row: rowNum, message: `Missing value for '${col}'` });
      }
    });
    if (row.cutoff && isNaN(Number(row.cutoff))) {
      errors.push({ row: rowNum, message: `'cutoff' must be a number, got: ${row.cutoff}` });
    }
    if (!["Male", "Female"].includes(row.gender)) {
      errors.push({ row: rowNum, message: `'gender' must be Male or Female, got: ${row.gender}` });
    }

    const dupKey = `${row.code}::${row.course}::${row.category}::${row.gender}`;
    if (seen.has(dupKey)) {
      duplicates.push({ row: rowNum, key: dupKey });
    }
    seen.add(dupKey);
  });

  return { errors, duplicates };
}

// Builds "($1,$2),($3,$4),..." plus the flat params array, for a bulk INSERT.
function buildValuesClause(tuples) {
  const params = [];
  const clauses = tuples.map((tuple) => {
    const placeholders = tuple.map((val) => {
      params.push(val);
      return `$${params.length}`;
    });
    return `(${placeholders.join(",")})`;
  });
  return { clause: clauses.join(","), params };
}

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Map optional 'collegeType' Excel column value to DB boolean/text fields.
 * Accepted values (case-insensitive): UNIV, SF, GIRLS, MINORITY, PVT (default).
 */
function parseCollegeTypeFlags(raw) {
  const t = (raw ?? "").toString().trim().toUpperCase();
  return {
    ownershipType: ["UNIV", "PVT", "PVTSF", "SF"].includes(t) ? t : (t || null),
    isGirls: t === "GIRLS",
    isMinority: t === "MINORITY",
    isSelfFinance: t === "SF" || t === "PVTSF",
  };
}

async function idMapByCode(client, table, codes, examId = null) {
  if (codes.length === 0) return new Map();
  const sql = examId === null
    ? `SELECT id, code FROM ${table} WHERE code = ANY($1)`
    : `SELECT id, code FROM ${table} WHERE code = ANY($1) AND exam_id = $2`;
  const { rows } = await client.query(sql, examId === null ? [codes] : [codes, examId]);
  const map = new Map();
  rows.forEach((r) => map.set(r.code, r.id));
  return map;
}

/**
 * Normalize a category code so that both "BC-A" and "BC_A" produce "BC_A".
 * Rules: uppercase, replace dashes with underscores.
 * Examples: bc-a → BC_A, SC-II → SC_II, EWS → EWS
 */
function normalizeCategoryCode(raw) {
  return (raw ?? "").toString().trim().toUpperCase().replace(/-/g, "_");
}

export const excelImportService = {
  parseAndValidate(buffer) {
    const rows = parseWorkbook(buffer);
    const { errors, duplicates } = validateRows(rows);
    return {
      totalRows: rows.length,
      isValid: errors.length === 0,
      errors: errors.slice(0, 50),
      duplicates: duplicates.slice(0, 50),
      preview: rows.slice(0, 10),
    };
  },

  async commitImport(buffer, { year, examSlug = "tg-icet" }) {
    const rows = parseWorkbook(buffer);
    const { errors } = validateRows(rows);
    if (errors.length > 0) {
      const err = new Error("File failed validation — fix errors before importing");
      err.status = 400;
      err.details = errors;
      throw err;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const examResult = await client.query("SELECT id FROM exams WHERE slug = $1", [examSlug]);
      if (examResult.rows.length === 0) {
        const err = new Error("Unknown exam");
        err.status = 404;
        throw err;
      }
      const examId = examResult.rows[0].id;

      // ---------- Year ----------
      await client.query(
        `INSERT INTO years (exam_id, year, is_active) VALUES ($1, $2, true)
         ON CONFLICT (exam_id, year) DO UPDATE SET is_active = true`,
        [examId, year]
      );
      const yearId = (await client.query("SELECT id FROM years WHERE exam_id = $1 AND year = $2", [examId, year])).rows[0].id;

      // *** Clean slate: delete ALL existing cutoffs for this exam+year before re-importing ***
      // This ensures rows removed from the new file don't persist from old imports.
      await client.query("DELETE FROM cutoffs WHERE exam_id = $1 AND year_id = $2", [examId, yearId]);

      // ---------- Districts (bulk) ----------
      const districtCodes = [...new Set(rows.map((r) => r.district))];
      {
        const { clause, params } = buildValuesClause(districtCodes.map((c) => [c]));
        await client.query(
          `INSERT INTO districts (code) VALUES ${clause} ON CONFLICT (code) DO NOTHING`,
          params
        );
      }
      const districtMap = await idMapByCode(client, "districts", districtCodes);

      // ---------- Courses (bulk) — last occurrence per code wins, same as before ----------
      const courseNameByCode = new Map();
      rows.forEach((r) => courseNameByCode.set(r.course, r.courseName));
      {
        const tuples = [...courseNameByCode.entries()].map(([code, name]) => [examId, code, name]);
        const { clause, params } = buildValuesClause(tuples);
        await client.query(
          `INSERT INTO courses (exam_id, code, name) VALUES ${clause}
           ON CONFLICT (exam_id, code) DO UPDATE SET name = EXCLUDED.name`,
          params
        );
      }
      const courseMap = await idMapByCode(client, "courses", [...courseNameByCode.keys()], examId);

      // ---------- Categories (bulk) ----------
      // Normalize codes first so "BC-A" and "BC_A" collapse to the same canonical form.
      const categoryCodes = [...new Set(rows.map((r) => normalizeCategoryCode(r.category)))];
      {
        const { clause, params } = buildValuesClause(categoryCodes.map((c) => [examId, c, c]));
        await client.query(
          `INSERT INTO categories (exam_id, code, name) VALUES ${clause} ON CONFLICT (exam_id, code) DO NOTHING`,
          params
        );
      }
      const categoryMap = await idMapByCode(client, "categories", categoryCodes, examId);

      // ---------- Colleges (bulk) — last occurrence per code wins ----------
      const collegeByCode = new Map();
     rows.forEach((r) => {
        const flags = parseCollegeTypeFlags(r.collegeType);
        collegeByCode.set(r.code, {
          name: r.name,
          districtId: districtMap.get(r.district),
          place: r.place ?? null,
          university: r.university ?? null,
          ownershipType: flags.ownershipType,
          isGirls: flags.isGirls,
          isMinority: flags.isMinority,
          isSelfFinance: flags.isSelfFinance,
        });
      });
      for (const batch of chunkArray([...collegeByCode.entries()], 500)) {
        const tuples = batch.map(([code, c]) => [
          examId, code, c.name, c.districtId, c.place, c.university,
          c.ownershipType, c.isGirls, c.isMinority, c.isSelfFinance,
        ]);
        const { clause, params } = buildValuesClause(tuples);
        await client.query(
          `INSERT INTO colleges (exam_id, code, name, district_id, place, university, ownership_type, is_girls, is_minority, is_self_finance)
           VALUES ${clause}
           ON CONFLICT (exam_id, code) DO UPDATE SET
             name = EXCLUDED.name, district_id = EXCLUDED.district_id,
             place = EXCLUDED.place, university = EXCLUDED.university,
             ownership_type = EXCLUDED.ownership_type, is_girls = EXCLUDED.is_girls,
             is_minority = EXCLUDED.is_minority, is_self_finance = EXCLUDED.is_self_finance,
             updated_at = NOW()`,
          params
        );
      }
      const collegeMap = await idMapByCode(client, "colleges", [...collegeByCode.keys()], examId);

      // ---------- college_courses (bulk, fee) ----------
      const collegeCourseFee = new Map(); // "code::course" -> fee
      rows.forEach((r) => collegeCourseFee.set(`${r.code}::${r.course}`, r.fee ?? null));
      for (const batch of chunkArray([...collegeCourseFee.entries()], 500)) {
        const tuples = batch.map(([key, fee]) => {
          const [code, course] = key.split("::");
          return [examId, collegeMap.get(code), courseMap.get(course), fee];
        });
        const { clause, params } = buildValuesClause(tuples);
        await client.query(
          `INSERT INTO college_courses (exam_id, college_id, course_id, fee)
           VALUES ${clause}
           ON CONFLICT (exam_id, college_id, course_id) DO UPDATE SET fee = EXCLUDED.fee`,
          params
        );
      }

      // ---------- Cutoffs (bulk, the big one) ----------
      for (const batch of chunkArray(rows, 800)) {
        const tuples = batch.map((r) => [
          examId, yearId,
          collegeMap.get(r.code),
          courseMap.get(r.course),
          categoryMap.get(normalizeCategoryCode(r.category)),
          r.gender,
          Number(r.cutoff),
        ]);
        const { clause, params } = buildValuesClause(tuples);
        await client.query(
          `INSERT INTO cutoffs (exam_id, year_id, college_id, course_id, category_id, gender, cutoff_rank)
           VALUES ${clause}
           ON CONFLICT (exam_id, year_id, college_id, course_id, category_id, gender)
           DO UPDATE SET cutoff_rank = EXCLUDED.cutoff_rank`,
          params
        );
      }

      // ---------- Cleanup: remove orphaned college_courses & colleges for this exam ----------
      // After re-import, colleges/courses that were in the OLD file but not the NEW file
      // would otherwise stay in the DB and show on the website.
      await client.query(
        `DELETE FROM college_courses
         WHERE exam_id = $1
           AND college_id NOT IN (
             SELECT DISTINCT college_id FROM cutoffs WHERE exam_id = $1
           )`,
        [examId]
      );
      await client.query(
        `DELETE FROM colleges
         WHERE exam_id = $1
           AND id NOT IN (
             SELECT DISTINCT college_id FROM cutoffs WHERE exam_id = $1
           )`,
        [examId]
      );

      await client.query("COMMIT");
      return { success: true, rowsProcessed: rows.length };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};
