import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { getAllotmentDataset } from '../src/services/allotmentService.js';

async function test() {
  const result = await getAllotmentDataset({
    examId: 'kcet',
    year: '2025-final',
    college: 'E001',
    branch: 'CS',
    page: 1,
    limit: 10
  });

  console.log("=== KCET Allotment Service Result ===");
  console.log("Available:", result.available);
  console.log("College:", result.college);
  console.log("Branch:", result.branch);
  console.log("Total Records:", result.totalRecords);
  console.log("Candidates Count:", result.candidates.length);
  console.log("Sample Candidate:", result.candidates[0]);
}

test();
