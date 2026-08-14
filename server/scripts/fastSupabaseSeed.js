import { pool } from "../src/config/database.js";

async function fastSeed() {
  const client = await pool.connect();
  try {
    const examId = 2; // tg-eapcet
    const yearId = 32; // 2025

    const colleges = (await client.query("SELECT id FROM colleges WHERE exam_id = $1", [examId])).rows;
    const courses = (await client.query("SELECT id, code FROM courses WHERE exam_id = $1 AND code IN ('CSE', 'ECE', 'EEE', 'CIV', 'MEC', 'INF', 'CSD', 'CSM')", [examId])).rows;
    const categories = (await client.query("SELECT id, code FROM categories WHERE exam_id = $1", [examId])).rows;

    console.log(`Supabase Seed: ${colleges.length} colleges, ${courses.length} courses, ${categories.length} categories.`);

    const rowsToInsert = [];
    for (let i = 0; i < colleges.length; i++) {
      const colId = colleges[i].id;
      const baseRank = (i + 1) * 650 + 1000;

      for (const crs of courses) {
        for (const cat of categories) {
          for (const gender of ["Male", "Female"]) {
            let catMultiplier = 1.0;
            const code = cat.code.toUpperCase();
            if (code.includes("EWS")) catMultiplier = 1.25;
            else if (code.includes("BC")) catMultiplier = 1.45;
            else if (code.includes("SC")) catMultiplier = 2.1;
            else if (code.includes("ST")) catMultiplier = 2.4;

            const cutoffRank = Math.min(125000, Math.max(1000, Math.round(baseRank * catMultiplier + (gender === "Female" ? 350 : 0))));
            rowsToInsert.push([examId, colId, crs.id, cat.id, yearId, gender, cutoffRank]);
          }
        }
      }
    }

    console.log(`Inserting ${rowsToInsert.length} rows in chunks of 150...`);

    const CHUNK_SIZE = 150;
    let count = 0;

    for (let i = 0; i < rowsToInsert.length; i += CHUNK_SIZE) {
      const chunk = rowsToInsert.slice(i, i + CHUNK_SIZE);
      const valueStrings = [];
      const params = [];

      chunk.forEach((row, rIdx) => {
        const offset = rIdx * 7;
        valueStrings.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`);
        params.push(...row);
      });

      const sql = `INSERT INTO cutoffs (exam_id, college_id, course_id, category_id, year_id, gender, cutoff_rank) VALUES ${valueStrings.join(", ")} ON CONFLICT (exam_id, year_id, college_id, course_id, category_id, gender) DO NOTHING`;
      await client.query(sql, params);
      count += chunk.length;
    }

    console.log(`Successfully committed ${count} TG EAPCET cutoffs to Supabase!`);
  } catch (err) {
    console.error("Fast seed error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

fastSeed();
