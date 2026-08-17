import { pool } from "../src/config/database.js";
import { allotmentRepository } from "../src/repositories/allotmentRepository.js";
import { ALL_TSCHE_COLLEGES } from "../src/data/allTscheInstitutions.js";
import { ALLOTMENT_BRANCHES, getAllotmentDataset } from "../src/services/allotmentService.js";

async function seedAll() {
  console.log("Starting Official Allotment Seed into Supabase...");

  const targetYears = ["2026-phase2", "2026-phase1", "2026-final", "2025-final", "2025-phase1", "2024", "2023", "2022"];
  const targetColleges = ["CBIT", "JNTH", "OUCE", "VNRV", "VASV", "GRET", "KMIT", "MGIT", "CVRH", "AARM"];
  const targetBranches = ["CIV", "CSE", "CSM", "AID", "ECE", "INF"];

  let totalInserted = 0;
  let totalDuplicates = 0;

  for (const yearId of targetYears) {
    const parts = yearId.split("-");
    const admissionYear = parseInt(parts[0], 10);
    const phase = parts[1] || "phase1";

    for (const collegeCode of targetColleges) {
      const collegeObj = ALL_TSCHE_COLLEGES.find(c => c.code === collegeCode) || { code: collegeCode, name: `${collegeCode} College of Engineering` };

      for (const branchCode of targetBranches) {
        const branchObj = ALLOTMENT_BRANCHES.find(b => b.code === branchCode) || { code: branchCode, name: branchCode };

        const dataset = getAllotmentDataset(yearId, collegeCode, branchCode);
        if (dataset && dataset.candidates && dataset.candidates.length > 0) {
          const recordsToInsert = dataset.candidates.map(c => ({
            examId: "tg-eapcet",
            historicalExamName: admissionYear < 2024 ? "TS EAMCET" : "TG EAPCET",
            admissionYear,
            phase,
            collegeCode,
            collegeName: collegeObj.name,
            branchCode,
            branchName: branchObj.name,
            rank: c.rank,
            rollNo: c.rollNo,
            candidateName: c.candidateName,
            gender: c.gender,
            region: c.region || "OU",
            caste: c.category || "OC",
            seatCategory: c.seatCategory
          }));

          const { inserted, duplicates } = await allotmentRepository.insertBatchAllotments(recordsToInsert);
          totalInserted += inserted;
          totalDuplicates += duplicates;
        }
      }
    }
  }

  const dbCount = await allotmentRepository.getTotalDatabaseRecordsCount();
  console.log(`[Seed Complete] Total Inserted: ${totalInserted}, Duplicates Skipped: ${totalDuplicates}, Total in DB: ${dbCount}`);
  process.exit(0);
}

seedAll().catch(err => {
  console.error("Seed error:", err.message);
  process.exit(1);
});
