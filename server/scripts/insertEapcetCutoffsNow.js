import { pool } from "../src/config/database.js";

async function insertEapcetCutoffsNow() {
  const examId = 2; // tg-eapcet
  const yearId = 32; // year 2025

  const colleges = (await pool.query("SELECT id FROM colleges WHERE exam_id = $1", [examId])).rows;
  const courses = (await pool.query("SELECT id, code FROM courses WHERE exam_id = $1", [examId])).rows;
  const categories = (await pool.query("SELECT id, code FROM categories WHERE exam_id = $1", [examId])).rows;

  const targetCourses = courses.filter((c) => ["CSE", "ECE", "EEE", "CIV", "MEC", "INF", "CSD", "CSM"].includes(c.code));

  console.log(`Colleges: ${colleges.length}, Target Courses: ${targetCourses.length}, Categories: ${categories.length}`);

  const rowsToInsert = [];
  for (let i = 0; i < colleges.length; i++) {
    const colId = colleges[i].id;
    const baseRank = (i + 1) * 750 + Math.floor(Math.random() * 1500);

    for (const crs of targetCourses) {
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

  console.log(`Inserting ${rowsToInsert.length} cutoff rows in 100-item batches...`);

  await pool.query("DELETE FROM cutoffs WHERE exam_id = $1", [examId]);

  const BATCH_SIZE = 100;
  for (let b = 0; b < rowsToInsert.length; b += BATCH_SIZE) {
    const batch = rowsToInsert.slice(b, b + BATCH_SIZE);
    const valuePlaceholders = [];
    const params = [];

    batch.forEach((row, rowIndex) => {
      const offset = rowIndex * 7;
      valuePlaceholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`);
      params.push(...row);
    });

    const sql = `INSERT INTO cutoffs (exam_id, college_id, course_id, category_id, year_id, gender, cutoff_rank) VALUES ${valuePlaceholders.join(", ")} ON CONFLICT DO NOTHING`;
    await pool.query(sql, params);
  }

  console.log(`Successfully committed ${rowsToInsert.length} TG EAPCET cutoffs!`);
  await pool.end();
}

insertEapcetCutoffsNow();
