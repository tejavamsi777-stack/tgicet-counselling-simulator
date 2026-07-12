import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { pool } from "../src/config/database.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Adjust this if your client's data folder lives somewhere else relative to /server
const DATA_DIR = path.join(__dirname, "..", "..", "client", "src", "data");

const CATEGORY_NAMES = {
  OC: "Open Category",
  EWS: "Economically Weaker Section",
  "BC-A": "Backward Class A",
  "BC-B": "Backward Class B",
  "BC-C": "Backward Class C",
  "BC-D": "Backward Class D",
  "BC-E": "Backward Class E",
  SC: "Scheduled Caste",
  ST: "Scheduled Tribe",
};

function readJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`WARNING: ${filePath} not found — skipping.`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

async function upsertRows(client, table, columns, conflictColumns, rows, updateColumns = []) {
  if (rows.length === 0) return;
  const chunkSize = 300;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const values = [];
    const placeholders = chunk.map((row, rowIdx) => {
      const rowPlaceholders = columns.map((_, colIdx) => {
        values.push(row[colIdx]);
        return `$${rowIdx * columns.length + colIdx + 1}`;
      });
      return `(${rowPlaceholders.join(", ")})`;
    });

    let sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES ${placeholders.join(", ")}`;
    if (updateColumns.length > 0) {
      const setClause = updateColumns.map((c) => `${c} = EXCLUDED.${c}`).join(", ");
      sql += ` ON CONFLICT (${conflictColumns.join(", ")}) DO UPDATE SET ${setClause}`;
    } else {
      sql += ` ON CONFLICT (${conflictColumns.join(", ")}) DO NOTHING`;
    }

    await client.query(sql, values);
  }
}

async function fetchIdMap(client, table, keyColumn) {
  const result = await client.query(`SELECT id, ${keyColumn} FROM ${table}`);
  const map = new Map();
  result.rows.forEach((row) => map.set(row[keyColumn], row.id));
  return map;
}

async function migrate() {
  const colleges2023 = readJSON("colleges.json") ?? [];
  const colleges2024 = readJSON("colleges2024.json") ?? [];
  const collegeTypes = readJSON("collegeTypes.json") ?? {};

  const allRows = [...colleges2023, ...colleges2024];
  if (allRows.length === 0) {
    console.error("No data found in colleges.json / colleges2024.json — check DATA_DIR path.");
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ---------- Districts ----------
    const districtCodes = [...new Set(allRows.map((r) => r.district))];
    await upsertRows(
      client,
      "districts",
      ["code"],
      ["code"],
      districtCodes.map((code) => [code])
    );

    // ---------- Courses ----------
    const courseMap = new Map();
    allRows.forEach((r) => courseMap.set(r.course, r.courseName));
    await upsertRows(
      client,
      "courses",
      ["code", "name"],
      ["code"],
      [...courseMap.entries()].map(([code, name]) => [code, name])
    );

    // ---------- Categories ----------
    const categoryCodes = [...new Set(allRows.map((r) => r.category))];
    await upsertRows(
      client,
      "categories",
      ["code", "name"],
      ["code"],
      categoryCodes.map((code) => [code, CATEGORY_NAMES[code] ?? code])
    );

    // ---------- Years ----------
    const yearNumbers = [...new Set(allRows.map((r) => r.year))];
    await upsertRows(
      client,
      "years",
      ["year"],
      ["year"],
      yearNumbers.map((y) => [y])
    );

    // Fetch ID maps now that reference tables are populated
    const districtIds = await fetchIdMap(client, "districts", "code");
    const courseIds = await fetchIdMap(client, "courses", "code");
    const categoryIds = await fetchIdMap(client, "categories", "code");
    const yearIds = await fetchIdMap(client, "years", "year");

    // ---------- Colleges (deduped by code) ----------
    const collegeMap = new Map();
    allRows.forEach((r) => {
      if (!collegeMap.has(r.code)) {
        const typeInfo = collegeTypes[r.code];
        collegeMap.set(r.code, {
          code: r.code,
          name: r.name,
          district_id: districtIds.get(r.district),
          place: r.place,
          university: r.university,
          ownership_type: typeInfo?.ownershipLabel ?? null,
          is_minority: typeInfo?.minority ?? false,
          is_girls: typeInfo ? !typeInfo.coEd : false,
          is_self_finance: typeInfo?.type === "sf",
        });
      }
    });

    const missingTypeCount = [...collegeMap.values()].filter((c) => c.ownership_type === null).length;
    if (missingTypeCount > 0) {
      console.warn(
        `NOTE: ${missingTypeCount} colleges have no institution-type data (not in collegeTypes.json) — ownership_type left NULL for those, not guessed.`
      );
    }

    await upsertRows(
      client,
      "colleges",
      [
        "code",
        "name",
        "district_id",
        "place",
        "university",
        "ownership_type",
        "is_minority",
        "is_girls",
        "is_self_finance",
      ],
      ["code"],
      [...collegeMap.values()].map((c) => [
        c.code,
        c.name,
        c.district_id,
        c.place,
        c.university,
        c.ownership_type,
        c.is_minority,
        c.is_girls,
        c.is_self_finance,
      ]),
      ["name", "district_id", "place", "university", "ownership_type", "is_minority", "is_girls", "is_self_finance"]
    );

    const collegeIds = await fetchIdMap(client, "colleges", "code");

    // ---------- College <-> Course links (with fee, first value seen) ----------
    const collegeCourseMap = new Map();
    allRows.forEach((r) => {
      const key = `${r.code}::${r.course}`;
      if (!collegeCourseMap.has(key)) {
        collegeCourseMap.set(key, {
          college_id: collegeIds.get(r.code),
          course_id: courseIds.get(r.course),
          fee: r.fee ?? null,
        });
      }
    });

    await upsertRows(
      client,
      "college_courses",
      ["college_id", "course_id", "fee"],
      ["college_id", "course_id"],
      [...collegeCourseMap.values()].map((cc) => [cc.college_id, cc.course_id, cc.fee]),
      ["fee"]
    );

    // ---------- Cutoffs ----------
    const cutoffRows = allRows.map((r) => [
      yearIds.get(r.year),
      collegeIds.get(r.code),
      courseIds.get(r.course),
      categoryIds.get(r.category),
      r.gender,
      r.cutoff,
    ]);

    await upsertRows(
      client,
      "cutoffs",
      ["year_id", "college_id", "course_id", "category_id", "gender", "cutoff_rank"],
      ["year_id", "college_id", "course_id", "category_id", "gender"],
      cutoffRows,
      ["cutoff_rank"]
    );

    await client.query("COMMIT");

    console.log("Migration complete.");
    console.log(`  Districts: ${districtCodes.length}`);
    console.log(`  Courses: ${courseMap.size}`);
    console.log(`  Categories: ${categoryCodes.length}`);
    console.log(`  Years: ${yearNumbers.length}`);
    console.log(`  Colleges: ${collegeMap.size}`);
    console.log(`  College-course links: ${collegeCourseMap.size}`);
    console.log(`  Cutoff rows: ${cutoffRows.length}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed, rolled back:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();