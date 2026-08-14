import { pool } from "../src/config/database.js";

async function testPredict() {
  const examResult = await pool.query("SELECT id FROM exams WHERE slug = 'tg-polycet'");
  const examId = examResult.rows[0].id;

  const countResult = await pool.query("SELECT count(*) FROM cutoffs WHERE exam_id = $1", [examId]);
  console.log("Total TG POLYCET Cutoffs in DB:", countResult.rows[0].count);

  const sampleCutoffs = await pool.query(
    `SELECT c.code, c.name, co.code as course, cat.code as category, cu.gender, cu.cutoff_rank
     FROM cutoffs cu
     JOIN colleges c ON cu.college_id = c.id
     JOIN courses co ON cu.course_id = co.id
     JOIN categories cat ON cu.category_id = cat.id
     WHERE cu.exam_id = $1
     LIMIT 5`,
    [examId]
  );
  console.log("Sample TG POLYCET DB Rows:", sampleCutoffs.rows);
  await pool.end();
}

testPredict();
