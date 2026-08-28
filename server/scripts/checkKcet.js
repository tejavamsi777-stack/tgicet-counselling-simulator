import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { pool } from '../src/config/database.js';

async function check() {
  const count = await pool.query("SELECT count(*) FROM eapcet_allotment_records WHERE exam_id = 'kcet'");
  const sample = await pool.query("SELECT * FROM eapcet_allotment_records WHERE exam_id = 'kcet' LIMIT 3");
  console.log("KCET Total Rows:", count.rows[0].count);
  console.log("KCET Samples:", sample.rows);
  await pool.end();
}

check();
