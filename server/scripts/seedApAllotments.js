import fs from 'fs';
import { pool } from '../src/config/database.js';

const JSON_PATH = 'C:\\Users\\Vamsi Teja\\.gemini\\antigravity\\brain\\41c21ed2-33f7-4c22-bc53-5ace53633862\\scratch\\ap_eapcet_allotments.json';

export async function seedApAllotments() {
  if (!fs.existsSync(JSON_PATH)) {
    console.error('File does not exist:', JSON_PATH);
    return;
  }

  const raw = fs.readFileSync(JSON_PATH, 'utf8');
  const colleges = JSON.parse(raw);

  console.log(`Loaded ${colleges.length} colleges from JSON.`);

  const client = await pool.connect();
  try {
    // 1. Delete previous ap-eapcet allotment records if any
    console.log('Cleaning existing ap-eapcet allotment records...');
    await client.query("DELETE FROM eapcet_allotment_records WHERE exam_id = 'ap-eapcet'");

    console.log('Inserting candidate records into PostgreSQL...');
    let totalInserted = 0;
    let totalSkipped = 0;

    // Use a transaction
    await client.query('BEGIN');

    // Batch insert helper
    const BATCH_SIZE = 500;
    let batchValues = [];

    for (const col of colleges) {
      const collegeCode = (col.college_code || '').trim().toUpperCase();
      const collegeName = col.college_label || `${collegeCode} Engineering College`;

      for (const branch of (col.branches || [])) {
        const branchCode = (branch.branch_code || '').trim().toUpperCase();
        const branchName = branch.branch_name || branchCode;
        const candidates = branch.candidates || [];

        for (let idx = 0; idx < candidates.length; idx++) {
          const c = candidates[idx];
          const rank = Math.round(parseFloat(c.rank)) || 0;
          if (!rank) {
            totalSkipped++;
            continue;
          }

          const candName = (c.cand_name || c.name || 'Candidate').trim();
          const gender = (c.gender || 'M').toUpperCase().startsWith('F') ? 'F' : 'M';
          const category = (c.category || 'OC').trim();
          const region = (c.region || 'AU').trim();
          const seatCategory = (c.alloted_category || c.seatCategory || 'OC_GEN_AU').trim();
          const phase = 'final'; // Store as 'final' so it aligns with '2025-final'
          const rollNo = `AP25-${collegeCode}-${branchCode}-${idx + 1}`;

          batchValues.push({
            exam_id: 'ap-eapcet',
            historical_exam_name: 'AP EAPCET',
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
  `;

  await client.query(sql, queryParams);
}

seedApAllotments();
