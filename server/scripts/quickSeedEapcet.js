import { pool } from "../src/config/database.js";

async function quickSeed() {
  const client = await pool.connect();
  try {
    await client.query("SET statement_timeout = 0");
    const examId = 2; // tg-eapcet
    const yearId = 32; // 2025

    const colleges = (await client.query("SELECT id FROM colleges WHERE exam_id = $1", [examId])).rows;
    const courses = (await client.query("SELECT id, code FROM courses WHERE exam_id = $1 AND code IN ('CSE', 'ECE', 'EEE', 'CIV', 'MEC', 'INF', 'CSD', 'CSM')", [examId])).rows;
    const categories = (await client.query("SELECT id, code FROM categories WHERE exam_id = $1", [examId])).rows;

    console.log(`Colleges: ${colleges.length}, Target Courses: ${courses.length}, Categories: ${categories.length}`);

    // Insert top 40 colleges cutoffs
    let count = 0;
    for (let i = 0; i < Math.min(40, colleges.length); i++) {
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

            await client.query(
              "INSERT INTO cutoffs (exam_id, college_id, course_id, category_id, year_id, gender, cutoff_rank) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING",
              [examId, colId, crs.id, cat.id, yearId, gender, cutoffRank]
            );
            count++;
          }
        }
      }
    }

    console.log(`Finished inserting ${count} cutoff records for EAPCET!`);
  } catch (e) {
    console.error("Error in quickSeed:", e);
  } finally {
    client.release();
    await pool.end();
  }
}

quickSeed();
