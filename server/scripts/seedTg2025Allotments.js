import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { pool } from '../src/config/database.js';
const JSON_PATH = path.resolve(__dirname, '../src/data/tg_eapcet_2025_final_allotments.json');

export async function seedTg2025Allotments() {
  if (!fs.existsSync(JSON_PATH)) {
    console.error('File does not exist:', JSON_PATH);
    return;
  }

  const raw = fs.readFileSync(JSON_PATH, 'utf8');
  const root = JSON.parse(raw);
  const collegeMap = root.data || {};

  console.log(`Loaded ${Object.keys(collegeMap).length} colleges from TG EAPCET 2025 JSON.`);

  const client = await pool.connect();
  try {
    console.log('Cleaning existing tg-eapcet 2025 final phase allotment records...');
    await client.query("DELETE FROM eapcet_allotment_records WHERE exam_id = 'tg-eapcet' AND admission_year = 2025 AND phase = 'final'");

    console.log('Inserting 2025 candidate records into PostgreSQL database...');
    let totalInserted = 0;
    let totalSkipped = 0;

    await client.query('BEGIN');

    const BATCH_SIZE = 500;
    let batchValues = [];

    for (const cCode of Object.keys(collegeMap)) {
      const col = collegeMap[cCode];
      const collegeCode = (col.code || cCode).trim().toUpperCase();
      const collegeName = col.name || `${collegeCode} Engineering College`;

      for (const branch of (col.branches || [])) {
        const branchCode = (branch.branchCode || '').trim().toUpperCase();
        const branchName = branch.branchName || branchCode;
        const candidates = branch.candidates || [];

        for (let idx = 0; idx < candidates.length; idx++) {
          const c = candidates[idx];
          const rank = Math.round(parseFloat(c.rank)) || 0;
          if (!rank) {
            totalSkipped++;
            continue;
          }

          const candName = (c.candidateName || c.name || 'Candidate').trim();
          const gender = (c.gender || 'M').toUpperCase().startsWith('F') ? 'F' : 'M';
          const category = (c.caste || c.category || 'OC').trim();
          const region = (c.region || 'OU').trim();
          const seatCategory = (c.seatCategory || 'OC_GEN_OU').trim();
          const phase = 'final';
          const rollNo = c.rollNo || `TG25-${collegeCode}-${branchCode}-${idx + 1}`;

          batchValues.push({
            exam_id: 'tg-eapcet',
            historical_exam_name: 'TG EAPCET',
            admission_year: 2025,
            phase,
            college_code: collegeCode,
            college_name: collegeName,
            branch_code: branchCode,
            branch_name: branchName,
            rank,
            roll_no: rollNo,
            candidate_name: candName,
            gender,
            region,
            caste: category,
            seat_category: seatCategory
          });

          if (batchValues.length >= BATCH_SIZE) {
            await insertChunk(client, batchValues);
            totalInserted += batchValues.length;
            batchValues = [];
            if (totalInserted % 5000 === 0) {
              console.log(`Inserted ${totalInserted} candidate records...`);
            }
          }
        }
      }
    }

    if (batchValues.length > 0) {
      await insertChunk(client, batchValues);
      totalInserted += batchValues.length;
    }

    await client.query('COMMIT');
    console.log(`\n🎉 Seed Completed Successfully!`);
    console.log(`Total Candidates Inserted: ${totalInserted}`);
    console.log(`Total Skipped: ${totalSkipped}`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

async function insertChunk(client, rows) {
  if (!rows.length) return;

  const valuePlaceholders = [];
  const queryParams = [];

  rows.forEach((r, rIdx) => {
    const offset = rIdx * 15;
    valuePlaceholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13}, $${offset + 14}, $${offset + 15})`);
    
    queryParams.push(
      r.exam_id,
      r.historical_exam_name,
      r.admission_year,
      r.phase,
      r.college_code,
      r.college_name,
      r.branch_code,
      r.branch_name,
      r.rank,
      r.roll_no,
      r.candidate_name,
      r.gender,
      r.region,
      r.caste,
      r.seat_category
    );
  });

  const sql = `
    INSERT INTO eapcet_allotment_records (
      exam_id, historical_exam_name, admission_year, phase,
      college_code, college_name, branch_code, branch_name,
      rank, roll_no, candidate_name, gender, region, caste, seat_category
    ) VALUES ${valuePlaceholders.join(', ')}
    ON CONFLICT (exam_id, admission_year, phase, college_code, branch_code, roll_no) DO UPDATE SET
      rank = EXCLUDED.rank,
      candidate_name = EXCLUDED.candidate_name,
      gender = EXCLUDED.gender,
      region = EXCLUDED.region,
      caste = EXCLUDED.caste,
      seat_category = EXCLUDED.seat_category
  `;

  await client.query(sql, queryParams);
}

seedTg2025Allotments();
