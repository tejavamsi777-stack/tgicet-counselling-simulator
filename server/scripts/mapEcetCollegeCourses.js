import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function mapCollegeCourses() {
  const examId = 5;
  console.log('⚡ Populating college_courses for TG ECET...');

  const q = await pool.query(`
    SELECT DISTINCT college_id, course_id 
    FROM cutoffs 
    WHERE exam_id = $1
  `, [examId]);

  console.log(`✓ Found ${q.rows.length} unique college-branch pairs.`);

  let inserted = 0;
  for (const row of q.rows) {
    const exist = await pool.query(
      'SELECT id FROM college_courses WHERE college_id = $1 AND course_id = $2',
      [row.college_id, row.course_id]
    );
    if (exist.rows.length === 0) {
      await pool.query(
        'INSERT INTO college_courses (college_id, course_id, fee, exam_id) VALUES ($1, $2, 105000, $3)',
        [row.college_id, row.course_id, examId]
      );
      inserted++;
    }
  }

  console.log(`🎉 Successfully mapped ${inserted} college-courses for TG ECET!`);
  await pool.end();
}

mapCollegeCourses().catch(err => {
  console.error(err);
  process.exit(1);
});
