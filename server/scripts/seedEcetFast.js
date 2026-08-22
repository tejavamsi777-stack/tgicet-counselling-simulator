import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedFast() {
  console.log('⚡ Fast Batch Seeding TG ECET Cutoffs...');
  const examId = 5;

  // 1. Get Year ID for 2025
  const yRes = await pool.query('SELECT id FROM years WHERE exam_id = $1 AND year = 2025', [examId]);
  const yearId = yRes.rows[0]?.id || 41;

  // 2. Load Maps
  const colRows = await pool.query('SELECT id, code FROM colleges WHERE exam_id = $1', [examId]);
  const collegeMap = new Map(colRows.rows.map(r => [r.code.toUpperCase(), r.id]));

  const crsRows = await pool.query('SELECT id, code FROM courses WHERE exam_id = $1', [examId]);
  const courseMap = new Map(crsRows.rows.map(r => [r.code.toUpperCase(), r.id]));

  const catRows = await pool.query('SELECT id, code FROM categories');
  const categoryMap = new Map(catRows.rows.map(r => [r.code.toUpperCase(), r.id]));

  console.log(`✓ Loaded ${collegeMap.size} colleges, ${courseMap.size} courses, ${categoryMap.size} categories.`);

  // 3. Clear existing cutoffs for exam 5 to do clean fresh batch insert
  await pool.query('DELETE FROM cutoffs WHERE exam_id = $1', [examId]);
  console.log('✓ Cleaned existing cutoffs for clean high-speed batch import.');

  const dataDir = path.resolve(__dirname, '../../client/src/data/ecet_allotments');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'allotments_summary.json' && f !== 'official_institutions.json');

  const rowsToInsert = []; // Array of [year_id, college_id, course_id, category_id, gender, cutoff_rank, exam_id]

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const colCode = (content.code || file.replace('.json', '')).trim().toUpperCase();
    const collegeId = collegeMap.get(colCode);
    if (!collegeId) continue;

    if (!Array.isArray(content.branches)) continue;

    for (const br of content.branches) {
      const branchCode = br.code || br.branchCode;
      if (!branchCode) continue;
      const bCode = branchCode.trim().toUpperCase();

      let courseId = courseMap.get(bCode);
      if (!courseId) {
        // insert course
        const ins = await pool.query('INSERT INTO courses (code, name, exam_id) VALUES ($1, $2, $3) RETURNING id', [bCode, (br.name || br.branchName || bCode).slice(0, 145), examId]);
        courseId = ins.rows[0].id;
        courseMap.set(bCode, courseId);
      }

      if (!Array.isArray(br.candidates) || br.candidates.length === 0) continue;

      const categoryRanks = {};
      for (const cand of br.candidates) {
        const r = Number(cand.rank);
        if (!r || isNaN(r)) continue;

        const seatCat = (cand.seatCategory || '').toUpperCase();
        let rawCaste = (cand.caste || '').toUpperCase().replace(/[-_\s]/g, '_');

        let cat = 'OC';
        if (seatCat.includes('EWS') || rawCaste === 'EWS') {
          cat = 'EWS';
        } else if (seatCat.startsWith('SC') || rawCaste.startsWith('SC')) {
          cat = 'SC';
        } else if (seatCat.startsWith('ST') || rawCaste.startsWith('ST')) {
          cat = 'ST';
        } else if (seatCat.startsWith('BC_A') || rawCaste === 'BC_A' || rawCaste === 'BCA') {
          cat = 'BC_A';
        } else if (seatCat.startsWith('BC_B') || rawCaste === 'BC_B' || rawCaste === 'BCB') {
          cat = 'BC_B';
        } else if (seatCat.startsWith('BC_C') || rawCaste === 'BC_C' || rawCaste === 'BCC') {
          cat = 'BC_C';
        } else if (seatCat.startsWith('BC_D') || rawCaste === 'BC_D' || rawCaste === 'BCD') {
          cat = 'BC_D';
        } else if (seatCat.startsWith('BC_E') || rawCaste === 'BC_E' || rawCaste === 'BCE') {
          cat = 'BC_E';
        }

        const g = (cand.gender || '').toUpperCase().startsWith('F') ? 'Female' : 'Male';

        const key = `${cat}|${g}`;
        if (!categoryRanks[key]) categoryRanks[key] = [];
        categoryRanks[key].push(r);

        // Also add to OC for general merit pool
        const ocKey = `OC|${g}`;
        if (!categoryRanks[ocKey]) categoryRanks[ocKey] = [];
        categoryRanks[ocKey].push(r);
      }

      for (const [key, ranks] of Object.entries(categoryRanks)) {
        const [catCode, gender] = key.split('|');
        const catId = categoryMap.get(catCode);
        if (!catId) continue;

        ranks.sort((a, b) => a - b);
        const closingRank = ranks[ranks.length - 1];

        rowsToInsert.push([yearId, collegeId, courseId, catId, gender, closingRank, examId]);
      }
    }
  }

  console.log(`✓ Prepared ${rowsToInsert.length} cutoff records to insert in batches.`);

  // Batch insert in chunks of 500 rows
  const chunkSize = 500;
  for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
    const chunk = rowsToInsert.slice(i, i + chunkSize);
    const valuePlaceholders = [];
    const flatValues = [];
    let pIdx = 1;

    for (const row of chunk) {
      valuePlaceholders.push(`($${pIdx}, $${pIdx+1}, $${pIdx+2}, $${pIdx+3}, $${pIdx+4}, $${pIdx+5}, $${pIdx+6})`);
      flatValues.push(...row);
      pIdx += 7;
    }

    const query = `
      INSERT INTO cutoffs (year_id, college_id, course_id, category_id, gender, cutoff_rank, exam_id)
      VALUES ${valuePlaceholders.join(', ')}
    `;
    await pool.query(query, flatValues);
    process.stdout.write(`\rInserted ${Math.min(i + chunkSize, rowsToInsert.length)} / ${rowsToInsert.length} cutoffs...`);
  }

  console.log(`\n\n🎉 ALL ${rowsToInsert.length} TG ECET CUTOFFS SUCCESSFULLY INSERTED!`);
  await pool.end();
}

seedFast().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
