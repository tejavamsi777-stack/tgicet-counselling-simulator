import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { pool } from '../src/config/database.js';

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'eapcet_allotment_records'
      ORDER BY ordinal_position;
    `);
    console.log("Columns in eapcet_allotment_records:");
    console.log(res.rows);
  } catch (err) {
    console.error("Schema check error:", err);
  } finally {
    await pool.end();
  }
}

checkSchema();
