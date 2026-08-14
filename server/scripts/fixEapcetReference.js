import { pool } from "../src/config/database.js";

async function fixReference() {
  await pool.query("UPDATE exams SET is_active = true WHERE slug = 'tg-eapcet'");
  const examsResult = await pool.query("SELECT id, slug FROM exams");

  for (const ex of examsResult.rows) {
    const y = await pool.query("SELECT * FROM years WHERE exam_id = $1 AND year = 2025", [ex.id]);
    if (y.rows.length === 0) {
      await pool.query("INSERT INTO years (exam_id, year, is_active) VALUES ($1, 2025, true)", [ex.id]);
      console.log("Inserted year 2025 for exam:", ex.slug);
    }
  }

  console.log("EAPCET reference data fix complete!");
  await pool.end();
}

fixReference();
