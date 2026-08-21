import 'dotenv/config';
import { pool } from '../src/config/database.js';

async function main() {
  const r = await pool.query(`
    SELECT c.code AS col, co.code AS crs, cat.code AS cat, cu.cutoff_rank
    FROM cutoffs cu
    JOIN colleges c ON c.id = cu.college_id
    JOIN courses co ON co.id = cu.course_id
    JOIN categories cat ON cat.id = cu.category_id
    WHERE cu.exam_id = 11 AND c.code IN ('VITAPU', 'GVPE') AND co.code IN ('CSE', 'MEC')
    ORDER BY c.code, co.code, cat.code
    LIMIT 60
  `);
  console.log('Total sample cutoff rows:', r.rows.length);
  console.log(r.rows);
  await pool.end();
}

main();
