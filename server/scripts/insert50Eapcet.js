import { pool } from "../src/config/database.js";

async function run() {
  const examId = 2; // tg-eapcet
  const yearId = 32; // 2025

  const colleges = (await pool.query("SELECT id FROM colleges WHERE exam_id = $1 LIMIT 30", [examId])).rows;
  const courses = (await pool.query("SELECT id, code FROM courses WHERE exam_id = $1 AND code IN ('CSE', 'ECE', 'EEE', 'CIV', 'MEC', 'INF', 'CSD', 'CSM')", [examId])).rows;
  const categories = (await pool.query("SELECT id, code FROM categories WHERE exam_id = $1", [examId])).rows;

  console.log(`Inserting cutoffs for ${colleges.length} colleges...`);

  let count = 0;
  for (let i = 0; i < colleges.length; i++) {
    const colId = colleges[i].id;
    const baseRank = (i + 1) * 700 + 1000;

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

          await pool.query(
            `INSERT INTO cutoffs (exam_id, college_id, course_id, category_id, year_id, gender, cutoff_rank)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (exam_id, year_id, college_id, course_id, category_id, gender) DO NOTHING`,
            [examId, colId, crs.id, cat.id, yearId, gender, cutoffRank]
          );
          count++;
        }
      }
    }
  }

  console.log(`Successfully inserted ${count} TG EAPCET cutoffs!`);
  await pool.end();
}

run().catch(console.error);
