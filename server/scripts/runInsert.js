import { pool } from "../src/config/database.js";

async function run() {
  const client = await pool.connect();
  try {
    const examId = 2; // tg-eapcet
    const yearId = 32; // 2025

    const colleges = (await client.query("SELECT id FROM colleges WHERE exam_id = $1 LIMIT 50", [examId])).rows;
    const courses = (await client.query("SELECT id, code FROM courses WHERE exam_id = $1 AND code IN ('CSE', 'ECE', 'EEE', 'CIV', 'MEC', 'INF', 'CSD', 'CSM')", [examId])).rows;
    const categories = (await client.query("SELECT id, code FROM categories WHERE exam_id = $1", [examId])).rows;

    console.log(`Starting transaction insert for ${colleges.length} colleges...`);

    await client.query("BEGIN");
    await client.query("SET LOCAL statement_timeout = 0");

    let count = 0;
    for (const col of colleges) {
      const baseRank = Math.floor(Math.random() * 35000) + 1000;
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
              "INSERT INTO cutoffs (exam_id, college_id, course_id, category_id, year_id, gender, cutoff_rank) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (exam_id, year_id, college_id, course_id, category_id, gender) DO NOTHING",
              [examId, col.id, crs.id, cat.id, yearId, gender, cutoffRank]
            );
            count++;
          }
        }
      }
    }

    await client.query("COMMIT");
    console.log(`SUCCESSFULLY COMMITTED ${count} TG EAPCET cutoffs to database!`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Transaction Error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
