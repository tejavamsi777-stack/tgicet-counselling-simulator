import { pool } from "../src/config/database.js";

async function syncSeed() {
  const examId = 2; // tg-eapcet
  const yearId = 32; // year 2025

  const colleges = (await pool.query("SELECT id FROM colleges WHERE exam_id = $1", [examId])).rows;
  const courses = (await pool.query("SELECT id, code FROM courses WHERE exam_id = $1", [examId])).rows;
  const categories = (await pool.query("SELECT id, code FROM categories WHERE exam_id = $1", [examId])).rows;

  const targetCourses = courses.filter((c) => ["CSE", "ECE", "EEE", "CIV", "MEC", "INF", "CSD", "CSM"].includes(c.code));

  console.log(`Colleges: ${colleges.length}, Target Courses: ${targetCourses.length}, Categories: ${categories.length}`);

  let totalInserted = 0;
  for (let i = 0; i < colleges.length; i++) {
    const colId = colleges[i].id;
    const baseRank = (i + 1) * 750 + 1200;

    const values = [];
    const params = [];
    let paramIndex = 1;

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

          values.push(`($${paramIndex}, $${paramIndex+1}, $${paramIndex+2}, $${paramIndex+3}, $${paramIndex+4}, $${paramIndex+5}, $${paramIndex+6})`);
          params.push(examId, colId, crs.id, cat.id, yearId, gender, cutoffRank);
          paramIndex += 7;
        }
      }
    }

    if (values.length > 0) {
      const sql = `INSERT INTO cutoffs (exam_id, college_id, course_id, category_id, year_id, gender, cutoff_rank) VALUES ${values.join(", ")} ON CONFLICT DO NOTHING`;
      await pool.query(sql, params);
      totalInserted += values.length;
    }
  }

  console.log(`Successfully inserted ${totalInserted} cutoffs for TG EAPCET!`);
  await pool.end();
}

syncSeed().catch(console.error);
