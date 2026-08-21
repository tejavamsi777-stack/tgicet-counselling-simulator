import { pool } from './config/database.js';
import { AP_COLLEGES_METADATA } from './data/apCollegesMetadata.js';
import fs from 'fs';
import path from 'path';

async function main() {
  const allMap = await pool.query(
    "SELECT DISTINCT college_code, branch_code, college_name, branch_name FROM eapcet_allotment_records WHERE exam_id = 'ap-eapcet'"
  );

  const colBranches = {};
  allMap.rows.forEach(r => {
    const code = r.college_code.toUpperCase().trim();
    if (!colBranches[code]) colBranches[code] = new Set();
    colBranches[code].add(r.branch_code.toUpperCase().trim());
  });

  // Also merge from AP_COLLEGES_METADATA
  Object.keys(AP_COLLEGES_METADATA).forEach(code => {
    const upper = code.toUpperCase().trim();
    if (!colBranches[upper]) colBranches[upper] = new Set();
    const cMeta = AP_COLLEGES_METADATA[code];
    Object.keys(cMeta.feeByBranch || {}).forEach(b => {
      colBranches[upper].add(b.toUpperCase().trim());
    });
  });

  const finalMap = {};
  Object.keys(colBranches).forEach(code => {
    const arr = Array.from(colBranches[code]).sort();
    finalMap[code] = arr.length > 0 ? arr : ['CSE', 'ECE', 'EEE', 'MEC', 'CIV', 'INF', 'CSM', 'CSD'];
  });

  console.log('Total colleges with full branches:', Object.keys(finalMap).length);
  console.log('AUCE branches:', finalMap['AUCE']);
  console.log('VITAPU branches:', finalMap['VITAPU']);
  console.log('GVPE branches:', finalMap['GVPE']);
  console.log('SVUC branches:', finalMap['SVUC']);
  console.log('JNTK branches:', finalMap['JNTK']);

  // Write to client data file
  const outPath = path.resolve('../client/src/data/officialApCollegeBranches.json');
  fs.writeFileSync(outPath, JSON.stringify(finalMap, null, 2));
  console.log('Successfully saved to client/src/data/officialApCollegeBranches.json');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
