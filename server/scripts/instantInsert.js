import { pool } from "../src/config/database.js";

async function instantInsert() {
  const client = await pool.connect();
  try {
    const examId = 2; // tg-eapcet
    const yearId = 32; // 2025

    const colleges = (await client.query("SELECT id FROM colleges WHERE exam_id = $1 LIMIT 50", [examId])).rows;
    const courses = (await client.query("SELECT id, code FROM courses WHERE exam_id = $1 AND code IN ('CSE', 'ECE', 'EEE', 'CIV', 'MEC', 'INF', 'CSD', 'CSM')", [examId])).rows;
    const categories = (await client.query("SELECT id, code FROM categories WHERE exam_id = $1", [examId])).rows;

    const values = [];
    const params = [];
    let pIdx = 1;

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

            values.push(`($${pIdx}, $${pIdx+1}, $${pIdx+2}, $${pIdx+3}, $${pIdx+4}, $${pIdx+5}, $${pIdx+6})`);
            params.push(examId, colId, crs.id, cat.id, yearId, gender, cutoffRank);
            pIdx += 7;
          }
        }
      }
    }

    console.log(`Executing 1 single multi-row query for ${values.length} rows...`);
    const sql = `INSERT INTO cutoffs (exam_id, college_id, course_id, category_id, year_id, gender, cutoff_rank) VALUES ${values.join(", ")} ON CONFLICT (exam_id, year_id, college_id, course_id, category_id, gender) DO NOTHING`;
    await client.query(sql, params);

    const countRes = await client.query("SELECT count(*) FROM cutoffs WHERE exam_id = $1", [examId]);
    console.log("SUCCESS! Instant EAPCET Cutoffs Count in DB:", countRes.rows[0].count);
  } catch (err) {
    console.error("Instant insert error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

instantInsert();
