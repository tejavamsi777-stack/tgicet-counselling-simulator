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
    const rowNum = idx + 2; // +2 accounts for header row + 1-indexing
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

export const excelImportService = {
  parseAndValidate(buffer) {
    const rows = parseWorkbook(buffer);
    const { errors, duplicates } = validateRows(rows);
    return {
      totalRows: rows.length,
      isValid: errors.length === 0,
      errors: errors.slice(0, 50), // cap so a bad file doesn't return thousands of error lines
      duplicates: duplicates.slice(0, 50),
      preview: rows.slice(0, 10), // first 10 rows only, for the admin to eyeball
    };
  },

  async commitImport(buffer, { year }) {
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

      // Ensure the year exists
      await client.query(
        "INSERT INTO years (year) VALUES ($1) ON CONFLICT (year) DO NOTHING",
        [year]
      );
      const yearResult = await client.query("SELECT id FROM years WHERE year = $1", [year]);
      const yearId = yearResult.rows[0].id;

      let insertedCount = 0;

      for (const row of rows) {
        // Ensure district exists
        await client.query(
          "INSERT INTO districts (code) VALUES ($1) ON CONFLICT (code) DO NOTHING",
          [row.district]
        );
        const districtRes = await client.query("SELECT id FROM districts WHERE code = $1", [row.district]);
        const districtId = districtRes.rows[0].id;

        // Ensure course exists
        await client.query(
          "INSERT INTO courses (code, name) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING",
          [row.course, row.courseName]
        );
        const courseRes = await client.query("SELECT id FROM courses WHERE code = $1", [row.course]);
        const courseId = courseRes.rows[0].id;

        // Ensure category exists
        await client.query(
          "INSERT INTO categories (code, name) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING",
          [row.category, row.category]
        );
        const categoryRes = await client.query("SELECT id FROM categories WHERE code = $1", [row.category]);
        const categoryId = categoryRes.rows[0].id;

        // Upsert college
        await client.query(
          `
          INSERT INTO colleges (code, name, district_id, place, university)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name, district_id = EXCLUDED.district_id,
            place = EXCLUDED.place, university = EXCLUDED.university, updated_at = NOW()
          `,
          [row.code, row.name, districtId, row.place ?? null, row.university ?? null]
        );
        const collegeRes = await client.query("SELECT id FROM colleges WHERE code = $1", [row.code]);
        const collegeId = collegeRes.rows[0].id;

        // Upsert college_courses (fee)
        await client.query(
          `
          INSERT INTO college_courses (college_id, course_id, fee)
          VALUES ($1, $2, $3)
          ON CONFLICT (college_id, course_id) DO UPDATE SET fee = EXCLUDED.fee
          `,
          [collegeId, courseId, row.fee ?? null]
        );

        // Upsert cutoff
        await client.query(
          `
          INSERT INTO cutoffs (year_id, college_id, course_id, category_id, gender, cutoff_rank)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (year_id, college_id, course_id, category_id, gender)
          DO UPDATE SET cutoff_rank = EXCLUDED.cutoff_rank
          `,
          [yearId, collegeId, courseId, categoryId, row.gender, Number(row.cutoff)]
        );

        insertedCount++;
      }

      await client.query("COMMIT");
      return { success: true, rowsProcessed: insertedCount };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};