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

async function seedEcet() {
  console.log('🚀 Starting TG ECET Data Seeder...');

  // 1. Resolve or Insert TG ECET Exam
  const examRes = await pool.query("SELECT * FROM exams WHERE slug = 'tg-ecet'");
  let examId;
  if (examRes.rows.length > 0) {
    examId = examRes.rows[0].id;
    console.log(`✓ Found TG ECET Exam ID: ${examId}`);
  } else {
    const insertExam = await pool.query(`
      INSERT INTO exams (slug, short_name, name, description, is_active, created_at, updated_at)
      VALUES ('tg-ecet', 'TG ECET', 'Telangana Engineering Common Entrance Test', 'Lateral-entry B.E. / B.Tech / B.Pharmacy admissions.', true, NOW(), NOW())
      RETURNING id
    `);
    examId = insertExam.rows[0].id;
    console.log(`✓ Created TG ECET Exam ID: ${examId}`);
  }

  // 2. Resolve or Insert Years (2024, 2025, 2026)
  const years = [2024, 2025, 2026];
  const yearMap = new Map();
  for (const yr of years) {
    let yRes = await pool.query('SELECT id FROM years WHERE exam_id = $1 AND year = $2', [examId, yr]);
    if (yRes.rows.length === 0) {
      yRes = await pool.query('INSERT INTO years (year, is_active, exam_id) VALUES ($1, true, $2) RETURNING id', [yr, examId]);
    }
    yearMap.set(yr, yRes.rows[0].id);
  }
  console.log('✓ Seeded Years for TG ECET:', [...yearMap.entries()]);

  // 3. Resolve or Insert Categories
  const categoryCodes = ['OC', 'BC_A', 'BC_B', 'BC_C', 'BC_D', 'BC_E', 'SC', 'ST', 'EWS'];
  const categoryMap = new Map();
  for (const code of categoryCodes) {
    let cRes = await pool.query('SELECT id FROM categories WHERE UPPER(code) = $1', [code]);
    if (cRes.rows.length === 0) {
      cRes = await pool.query('INSERT INTO categories (code, name) VALUES ($1, $1) RETURNING id', [code]);
    }
    categoryMap.set(code, cRes.rows[0].id);
  }
  console.log('✓ Resolved Categories:', [...categoryMap.keys()]);

  // 4. Resolve or Insert Districts
  const districtCodes = [
    { code: 'HYD', name: 'Hyderabad' },
    { code: 'RRD', name: 'Ranga Reddy' },
    { code: 'MDK', name: 'Medchal-Malkajgiri' },
    { code: 'KNR', name: 'Karimnagar' },
    { code: 'WRG', name: 'Warangal' },
    { code: 'NGD', name: 'Nalgonda' },
    { code: 'MBN', name: 'Mahabubnagar' },
    { code: 'ADB', name: 'Adilabad' },
    { code: 'NZB', name: 'Nizamabad' },
    { code: 'KHM', name: 'Khammam' },
    { code: 'SAN', name: 'Sangareddy' },
    { code: 'SID', name: 'Siddipet' },
  ];
  const districtMap = new Map();
  for (const d of districtCodes) {
    let dRes = await pool.query('SELECT id FROM districts WHERE UPPER(code) = $1', [d.code]);
    if (dRes.rows.length === 0) {
      dRes = await pool.query('INSERT INTO districts (code, name) VALUES ($1, $2) RETURNING id', [d.code, d.name]);
    }
    districtMap.set(d.code, dRes.rows[0].id);
  }
  const defaultDistrictId = districtMap.get('HYD');

  // 5. Load Colleges & Allotment JSONs
  const dataDir = path.resolve(__dirname, '../../client/src/data/ecet_allotments');
  const collegesJsonPath = path.resolve(__dirname, '../../client/src/data/tgecet_all_293_official_colleges.json');
  
  let collegesList = [];
  if (fs.existsSync(collegesJsonPath)) {
    collegesList = JSON.parse(fs.readFileSync(collegesJsonPath, 'utf8'));
  }
  console.log(`✓ Loaded ${collegesList.length} colleges from directory JSON.`);

  // 6. Insert / Update Colleges in DB for TG ECET
  const collegeMap = new Map(); // code -> id
  for (const col of collegesList) {
    const code = col.code?.trim().toUpperCase();
    if (!code) continue;

    // Detect district
    let distId = defaultDistrictId;
    const nameUpper = (col.name || '').toUpperCase();
    if (nameUpper.includes('WARANGAL') || nameUpper.includes('HANUMAKONDA')) distId = districtMap.get('WRG');
    else if (nameUpper.includes('KARIMNAGAR')) distId = districtMap.get('KNR');
    else if (nameUpper.includes('RANGA REDDY') || nameUpper.includes('IBRAHIMPATNAM') || nameUpper.includes('GANDIPET') || nameUpper.includes('CHEVALLA') || nameUpper.includes('MOINABAD')) distId = districtMap.get('RRD');
    else if (nameUpper.includes('MEDCHAL') || nameUpper.includes('GHATKESAR') || nameUpper.includes('MAISAMMAGUDA') || nameUpper.includes('KEESARA')) distId = districtMap.get('MDK');
    else if (nameUpper.includes('SANGAREDDY') || nameUpper.includes('PATANCHERU') || nameUpper.includes('KANDI')) distId = districtMap.get('SAN');
    else if (nameUpper.includes('NALGONDA') || nameUpper.includes('SURYAPET')) distId = districtMap.get('NGD');
    else if (nameUpper.includes('KHAMMAM')) distId = districtMap.get('KHM');
    else if (nameUpper.includes('NIZAMABAD')) distId = districtMap.get('NZB');
    else if (nameUpper.includes('MAHABUBNAGAR')) distId = districtMap.get('MBN');

    const isGovt = nameUpper.includes('UNIVERSITY') || nameUpper.includes('GOVT') || code.startsWith('OU') || code.startsWith('JN');
    const isGirls = nameUpper.includes('WOMEN') || nameUpper.includes('GIRLS') || code.endsWith('W');

    let colRes = await pool.query('SELECT id FROM colleges WHERE exam_id = $1 AND UPPER(code) = $2', [examId, code]);
    if (colRes.rows.length === 0) {
      colRes = await pool.query(`
        INSERT INTO colleges (code, name, district_id, place, university, ownership_type, is_minority, is_girls, is_self_finance, is_active, exam_id)
        VALUES ($1, $2, $3, $4, $5, $6, false, $7, false, true, $8)
        RETURNING id
      `, [
        code,
        (col.name || code).slice(0, 250),
        distId,
        (col.place || 'Telangana').slice(0, 140),
        isGovt ? 'OU / JNTUH' : 'Affiliated',
        isGovt ? 'University' : 'Private',
        isGirls,
        examId
      ]);
    }
    collegeMap.set(code, colRes.rows[0].id);
  }
  console.log(`✓ Inserted/Resolved ${collegeMap.size} colleges for TG ECET in DB.`);

  // 7. Parse Allotment JSONs & Compute Cutoffs
  const courseMap = new Map(); // code -> id
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'allotments_summary.json' && f !== 'official_institutions.json');
  console.log(`✓ Found ${files.length} allotment data files to parse.`);

  let totalCutoffsInserted = 0;
  const primaryYearId = yearMap.get(2025) || yearMap.get(2024);

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

      // Ensure course in DB
      if (!courseMap.has(bCode)) {
        let crsRes = await pool.query('SELECT id FROM courses WHERE exam_id = $1 AND UPPER(code) = $2', [examId, bCode]);
        if (crsRes.rows.length === 0) {
          crsRes = await pool.query(`
            INSERT INTO courses (code, name, exam_id)
            VALUES ($1, $2, $3)
            RETURNING id
          `, [bCode, (br.name || br.branchName || bCode).slice(0, 145), examId]);
        }
        courseMap.set(bCode, crsRes.rows[0].id);
      }
      const courseId = courseMap.get(bCode);

      // Group candidates by category and gender
      if (!Array.isArray(br.candidates) || br.candidates.length === 0) continue;

      const categoryRanks = {}; // key: `${cat}_${gender}` -> array of ranks
      for (const cand of br.candidates) {
        const r = Number(cand.rank);
        if (!r || isNaN(r)) continue;

        let cat = (cand.caste || '').toUpperCase().replace(/[-_\s]/g, '_');
        if (cat === 'BCA') cat = 'BC_A';
        else if (cat === 'BCB') cat = 'BC_B';
        else if (cat === 'BCC') cat = 'BC_C';
        else if (cat === 'BCD') cat = 'BC_D';
        else if (cat === 'BCE') cat = 'BC_E';
        if (!categoryMap.has(cat)) cat = 'OC';

        const g = (cand.gender || '').toUpperCase().startsWith('F') ? 'Female' : 'Male';

        const key = `${cat}|${g}`;
        if (!categoryRanks[key]) categoryRanks[key] = [];
        categoryRanks[key].push(r);

        // Also add to OC for general merit pool
        const ocKey = `OC|${g}`;
        if (!categoryRanks[ocKey]) categoryRanks[ocKey] = [];
        categoryRanks[ocKey].push(r);
      }

      // Compute closing cutoff for each category/gender
      for (const [key, ranks] of Object.entries(categoryRanks)) {
        const [catCode, gender] = key.split('|');
        const catId = categoryMap.get(catCode);
        if (!catId) continue;

        ranks.sort((a, b) => a - b);
        const closingRank = ranks[ranks.length - 1]; // maximum rank allotted in that quota

        // Insert or update cutoff in DB
        const exist = await pool.query(`
          SELECT id FROM cutoffs
          WHERE exam_id = $1 AND year_id = $2 AND college_id = $3 AND course_id = $4 AND category_id = $5 AND gender = $6
        `, [examId, primaryYearId, collegeId, courseId, catId, gender]);

        if (exist.rows.length === 0) {
          await pool.query(`
            INSERT INTO cutoffs (year_id, college_id, course_id, category_id, gender, cutoff_rank, exam_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [primaryYearId, collegeId, courseId, catId, gender, closingRank, examId]);
          totalCutoffsInserted++;
        }
      }
    }
  }

  console.log(`\n🎉 Successfully Seeded TG ECET in Database!`);
  console.log(`- Total Courses: ${courseMap.size}`);
  console.log(`- Total Colleges: ${collegeMap.size}`);
  console.log(`- Total Cutoff Records: ${totalCutoffsInserted}`);

  await pool.end();
}

seedEcet().catch(err => {
  console.error('❌ Seeder Failed:', err);
  process.exit(1);
});
