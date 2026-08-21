import { pool } from './config/database.js';
import { AP_COLLEGES_METADATA } from './data/apCollegesMetadata.js';

async function main() {
  const allMap = await pool.query(
    "SELECT DISTINCT college_code, branch_code, college_name, branch_name FROM eapcet_allotment_records WHERE exam_id = 'ap-eapcet'"
  );
  console.log('Total college-branch rows in DB:', allMap.rows.length);

  const dbBranches = {};
  allMap.rows.forEach(r => {
    const b = r.branch_code.toUpperCase();
    dbBranches[b] = (dbBranches[b] || 0) + 1;
  });
  console.log('Top DB branches count:', Object.entries(dbBranches).sort((a,b) => b[1] - a[1]));

  const bioCols = allMap.rows.filter(r => r.branch_code === 'BIO');
  console.log('Colleges offering BIO in DB allotments:', bioCols);

  const agrCols = allMap.rows.filter(r => r.branch_code === 'AGR');
  console.log('Colleges offering AGR in DB allotments:', agrCols);

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
