import { pool } from "../src/config/database.js";
import { scrapeOfficialTscheAllotment } from "../src/services/tscheAllotmentScraper.js";
import { ALL_TSCHE_COLLEGES } from "../src/data/allTscheInstitutions.js";
import { ALLOTMENT_BRANCHES } from "../src/services/allotmentService.js";
import { allotmentRepository } from "../src/repositories/allotmentRepository.js";

/**
 * Imports official allotment data for specified colleges & branches into PostgreSQL
 */
export async function importOfficialEapcetAllotments({
  admissionYear = 2026,
  phase = "final",
  colleges = ["CBIT", "JNTH", "OUCE", "VASV", "AARM", "VJEC", "VMEG", "GNTW", "GRRR", "KMIT", "CVRH", "MGIT"],
  branches = null, // null means all available branches for that college
  delayMs = 800
}) {
  console.log(`\n======================================================`);
  console.log(`STARTING OFFICIAL TG EAPCET ALLOTMENT INGESTION`);
  console.log(`Year: ${admissionYear} | Phase: ${phase}`);
  console.log(`Colleges to process: ${colleges.length}`);
  console.log(`======================================================\n`);

  let totalScraped = 0;
  let totalInserted = 0;
  let totalDuplicates = 0;
  let successCombinations = 0;
  let unavailableCombinations = 0;

  for (const collegeCode of colleges) {
    const cCode = collegeCode.toUpperCase();
    const collegeObj = ALL_TSCHE_COLLEGES.find(c => c.code === cCode) || {
      code: cCode,
      name: `${cCode} Engineering College`
    };

    console.log(`\n[College: ${cCode} - ${collegeObj.name}]`);

    // Determine branches to scrape
    let targetBranches = branches;
    if (!targetBranches) {
      // First scrape a primary branch (e.g. CSE) to discover all available branches on the portal
      const probe = await scrapeOfficialTscheAllotment(cCode, "CSE");
      if (probe && probe.availableBranches && probe.availableBranches.length > 0) {
        targetBranches = probe.availableBranches.map(b => b.val);
      } else {
        targetBranches = ["CSE", "CSM", "CIV", "ECE", "EEE", "INF", "MEC"];
      }
    }

    for (const bCode of targetBranches) {
      const branchObj = ALLOTMENT_BRANCHES.find(b => b.code === bCode.toUpperCase()) || {
        code: bCode.toUpperCase(),
        name: bCode.toUpperCase()
      };

      process.stdout.write(`  -> Fetching ${cCode} - ${bCode}... `);

      const result = await scrapeOfficialTscheAllotment(cCode, bCode);

      if (!result || !result.available || !result.candidates || result.candidates.length === 0) {
        console.log(`[Unavailable / 0 records]`);
        unavailableCombinations++;
        await new Promise(r => setTimeout(r, delayMs));
        continue;
      }

      totalScraped += result.candidates.length;
      successCombinations++;

      // Map candidates to DB format
      const dbRecords = result.candidates.map(c => ({
        examId: "tg-eapcet",
        historicalExamName: admissionYear < 2024 ? "TS EAMCET" : "TG EAPCET",
        admissionYear,
        phase,
        collegeCode: cCode,
        collegeName: collegeObj.name,
        branchCode: bCode.toUpperCase(),
        branchName: branchObj.name,
        rank: c.rank,
        rollNo: c.rollNo,
        candidateName: c.candidateName,
        gender: c.gender,
        region: c.region || "OU",
        caste: c.category || "OC",
        seatCategory: c.seatCategory
      }));

      // Create import log
      let rawImportId = null;
      try {
        const importLog = await allotmentRepository.createImportLog({
          sourceUrl: "https://tgeapcet.nic.in/college_allotment.aspx",
          sourceName: "Official TG EAPCET Portal",
          examId: "tg-eapcet",
          historicalExamName: admissionYear < 2024 ? "TS EAMCET" : "TG EAPCET",
          admissionYear,
          phase,
          totalRecords: dbRecords.length,
          validRecords: dbRecords.length,
          newRecords: 0,
          duplicateRecords: 0,
          status: "IN_PROGRESS",
          importedBy: "official_ingestion_cli"
        });
        rawImportId = importLog?.id;
      } catch (logErr) {
        // Continue even if audit log table has an issue
      }

      // Batch insert idempotently
      const { inserted, duplicates } = await allotmentRepository.insertBatchAllotments(dbRecords, rawImportId);

      totalInserted += inserted;
      totalDuplicates += duplicates;

      console.log(`[OK] ${result.candidates.length} records (New: ${inserted}, Dups: ${duplicates})`);

      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  console.log(`\n======================================================`);
  console.log(`INGESTION SUMMARY`);
  console.log(`======================================================`);
  console.log(`Success Combinations: ${successCombinations}`);
  console.log(`Unavailable Combinations: ${unavailableCombinations}`);
  console.log(`Total Candidates Scraped: ${totalScraped}`);
  console.log(`Total Records Inserted into DB: ${totalInserted}`);
  console.log(`Total Duplicates Ignored: ${totalDuplicates}`);
  console.log(`======================================================\n`);
}

// If run directly via CLI
if (process.argv[1]?.includes("importOfficialEapcetAllotments.js")) {
  importOfficialEapcetAllotments({
    admissionYear: 2026,
    phase: "final",
    colleges: [
      "CBIT", "JNTH", "OUCE", "VASV", "AARM", "VJEC", 
      "VMEG", "GNTW", "GRRR", "KMIT", "CVRH", "MGIT",
      "ACEG", "IARE", "CMRK", "CMRM", "BVRW", "BVRI"
    ],
    delayMs: 600
  })
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Ingestion failed:", err);
    process.exit(1);
  });
}
