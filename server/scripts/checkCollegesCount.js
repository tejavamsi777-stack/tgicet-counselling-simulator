import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { pool } from '../src/config/database.js';

async function check() {
  const colRes = await pool.query("SELECT COUNT(DISTINCT college_code) as total_colleges FROM eapcet_allotment_records WHERE exam_id = 'kcet'");
  const recRes = await pool.query("SELECT COUNT(*) as total_records FROM eapcet_allotment_records WHERE exam_id = 'kcet'");
  console.log("=== KCET Database Verification ===");
  console.log("Unique Engineering Colleges:", colRes.rows[0].total_colleges);
  console.log("Total Student Records:", recRes.rows[0].total_records);
  await pool.end();
}

check();
