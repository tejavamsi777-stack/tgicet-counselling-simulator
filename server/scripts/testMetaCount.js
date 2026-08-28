import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { pool } from '../src/config/database.js';

async function test() {
  const colRes = await pool.query(
    `SELECT DISTINCT college_code AS code, college_name AS name 
     FROM eapcet_allotment_records 
     WHERE exam_id = 'kcet' 
     ORDER BY college_code`
  );
  console.log("=== DB Meta Query Result ===");
  console.log("Colleges returned by SQL:", colRes.rows.length);
  console.log("First 3 colleges:", colRes.rows.slice(0, 3));
  console.log("Last 3 colleges:", colRes.rows.slice(-3));
  await pool.end();
}

test();
