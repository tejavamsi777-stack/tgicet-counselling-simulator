import * as cheerio from "cheerio";
import { allotmentRepository } from "../repositories/allotmentRepository.js";
import { ALL_TSCHE_COLLEGES } from "../data/allTscheInstitutions.js";
import { ALLOTMENT_BRANCHES } from "./allotmentService.js";

export const allotmentImportService = {
  /**
   * Parse TSCHE HTML table or text content into normalized candidate objects
   */
  parseOfficialTscheHtml(htmlContent, meta = {}) {
    const $ = cheerio.load(htmlContent);
    const parsedRecords = [];

    // Parse HTML table rows
    $('table tr').each((_, tr) => {
      const tds = $(tr).find('td');
      if (tds.length >= 7) {
        const rollNo = $(tds[1]).text().trim();
        const rankText = $(tds[2]).text().trim().replace(/,/g, '');
        const rank = parseFloat(rankText);
        const candidateName = $(tds[3]).text().trim();
        const gender = $(tds[4]).text().trim().toUpperCase().startsWith('F') ? 'F' : 'M';
        const caste = $(tds[5]).text().trim() || 'OC';
        const region = $(tds[6]).text().trim() || 'OU';
        const seatCategory = $(tds[7]).text().trim() || `${caste}_GEN_OU`;

        if (rollNo && !isNaN(rank) && candidateName) {
          parsedRecords.push({
            rollNo,
            rank: Math.round(rank),
            candidateName,
            gender,
            caste,
            region,
            seatCategory,
            admissionYear: meta.admissionYear || 2026,
            phase: meta.phase || 'phase2',
            collegeCode: (meta.collegeCode || 'CBIT').toUpperCase(),
            collegeName: meta.collegeName || `${meta.collegeCode} Engineering College`,
            branchCode: (meta.branchCode || 'CIV').toUpperCase(),
            branchName: meta.branchName || meta.branchCode || 'CIVIL ENGINEERING',
            historicalExamName: meta.admissionYear < 2024 ? 'TS EAMCET' : 'TG EAPCET',
            examId: 'tg-eapcet'
          });
        }
      }
    });

    return parsedRecords;
  },

  /**
   * Parse CSV lines into normalized candidate objects
   */
  parseCsvRecords(csvContent, meta = {}) {
    const lines = csvContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length < 5) continue;

      const record = {};
      headers.forEach((h, idx) => {
        record[h] = parts[idx] || '';
      });

      const rollNo = record['hall_ticket'] || record['roll_no'] || record['rollno'] || parts[1] || '';
      const rank = parseFloat(record['rank'] || parts[2] || '0');
      const candidateName = record['name'] || record['candidate_name'] || parts[3] || '';
      const gender = (record['gender'] || record['sex'] || parts[4] || 'M').toUpperCase().startsWith('F') ? 'F' : 'M';
      const caste = record['caste'] || record['category'] || parts[5] || 'OC';
      const region = record['region'] || parts[6] || 'OU';
      const seatCategory = record['seat_category'] || record['seatcategory'] || parts[7] || `${caste}_GEN_OU`;

      if (rollNo && rank > 0 && candidateName) {
        records.push({
          rollNo,
          rank: Math.round(rank),
          candidateName,
          gender,
          caste,
          region,
          seatCategory,
          admissionYear: meta.admissionYear || parseInt(record['year'] || '2026', 10),
          phase: meta.phase || record['phase'] || 'phase2',
          collegeCode: (meta.collegeCode || record['college_code'] || 'CBIT').toUpperCase(),
          collegeName: meta.collegeName || record['college_name'] || `${meta.collegeCode} Engineering College`,
          branchCode: (meta.branchCode || record['branch_code'] || 'CIV').toUpperCase(),
          branchName: meta.branchName || record['branch_name'] || 'CIVIL ENGINEERING',
          historicalExamName: meta.admissionYear < 2024 ? 'TS EAMCET' : 'TG EAPCET',
          examId: 'tg-eapcet'
        });
      }
    }

    return records;
  },

  /**
   * Validate and generate preview metrics for Admin
   */
  async previewImport(records, meta = {}) {
    const total = records.length;
    const valid = [];
    const invalid = [];

    records.forEach((r, idx) => {
      if (!r.rollNo || !r.rank || r.rank <= 0 || !r.candidateName) {
        invalid.push({ index: idx, record: r, reason: "Missing required roll number, rank, or name" });
      } else {
        valid.push(r);
      }
    });

    return {
      totalRecords: total,
      validRecords: valid.length,
      invalidRecords: invalid.length,
      invalidSamples: invalid.slice(0, 5),
      validSamples: valid.slice(0, 5),
      meta: {
        admissionYear: meta.admissionYear,
        phase: meta.phase,
        collegeCode: meta.collegeCode,
        branchCode: meta.branchCode
      }
    };
  },

  /**
   * Fetch official data directly from live portal and preview for Admin
   */
  async fetchOfficialLiveAllotments({ examId = "tg-eapcet", admissionYear = 2026, phase = "final", collegeCode = "CBIT", branchCode = "CSE" }) {
    let result = null;
    let sourceUrl = "https://tgeapcet.nic.in/college_allotment.aspx";
    let sourceName = "Official TG EAPCET Portal";
    let defaultExamName = "TG EAPCET";

    if (examId === "tg-ecet") {
      sourceUrl = "https://tgecet.nic.in/college_allotment.aspx";
      sourceName = "Official TG ECET Portal";
      defaultExamName = "TG ECET";
      const { scrapeOfficialTgEcetAllotment } = await import("./tgEcetAllotmentScraper.js");
      result = await scrapeOfficialTgEcetAllotment(collegeCode, branchCode);
      if (result && result.candidates) {
        result.available = result.candidates.length > 0;
        result.genderSplit = {
          male: result.candidates.filter(c => (c.gender || "").toLowerCase().startsWith("m")).length,
          female: result.candidates.filter(c => (c.gender || "").toLowerCase().startsWith("f")).length
        };
        result.categoryCounts = {};
        result.candidates.forEach(c => {
          result.categoryCounts[c.seatCategory] = (result.categoryCounts[c.seatCategory] || 0) + 1;
        });
      }
    } else if (examId === "tg-polycet") {
      sourceUrl = "https://tgpolycet.nic.in/college_allotment.aspx";
      sourceName = "Official TG POLYCET Portal";
      defaultExamName = "TG POLYCET";
      const fs = await import("fs");
      const path = await import("path");
      const { fileURLToPath } = await import("url");
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const polyFile = path.resolve(__dirname, `../data/polycet_allotments/${collegeCode.toUpperCase()}.json`);
      if (fs.existsSync(polyFile)) {
        const polyData = JSON.parse(fs.readFileSync(polyFile, "utf8"));
        const branchObj = (polyData.branches || []).find(b => b.branchCode.toUpperCase() === branchCode.toUpperCase());
        if (branchObj && branchObj.candidates?.length > 0) {
          result = {
            available: true,
            totalSeats: branchObj.totalAllotted,
            openingRank: branchObj.openingRank,
            closingRank: branchObj.closingRank,
            candidates: branchObj.candidates.map(c => ({
              rollNo: c.hallTicket,
              rank: c.rank,
              candidateName: c.name,
              gender: c.gender?.toUpperCase().startsWith("F") ? "F" : "M",
              region: c.region || "OU",
              category: c.caste || "OC",
              seatCategory: c.seatCategory || "OC_GEN_OU"
            })),
            genderSplit: {
              male: branchObj.candidates.filter(c => (c.gender || "").toLowerCase().startsWith("m")).length,
              female: branchObj.candidates.filter(c => (c.gender || "").toLowerCase().startsWith("f")).length
            },
            categoryCounts: {}
          };
        }
      }
    } else {
      const { scrapeOfficialTscheAllotment } = await import("./tscheAllotmentScraper.js");
      result = await scrapeOfficialTscheAllotment(collegeCode, branchCode);
    }

    if (!result || !result.available || !result.candidates || result.candidates.length === 0) {
      return {
        available: false,
        totalRecords: 0,
        validRecords: 0,
        invalidRecords: 0,
        parsedRecords: [],
        reason: result?.reason || `No records found on official portal for ${collegeCode} - ${branchCode}.`
      };
    }

    const collegeObj = ALL_TSCHE_COLLEGES.find(c => c.code === collegeCode.toUpperCase()) || {
      code: collegeCode.toUpperCase(),
      name: `${collegeCode} College`
    };
    const branchObj = ALLOTMENT_BRANCHES.find(b => b.code === branchCode.toUpperCase()) || {
      code: branchCode.toUpperCase(),
      name: branchCode.toUpperCase()
    };

    const parsedRecords = result.candidates.map(c => ({
      examId,
      historicalExamName: defaultExamName,
      admissionYear: parseInt(admissionYear, 10),
      phase,
      collegeCode: collegeCode.toUpperCase(),
      collegeName: collegeObj.name,
      branchCode: branchCode.toUpperCase(),
      branchName: branchObj.name,
      rank: c.rank,
      rollNo: c.rollNo || c.hallTicket,
      candidateName: c.candidateName || c.name,
      gender: (c.gender || "M").toUpperCase().startsWith("F") ? "F" : "M",
      region: c.region || "OU",
      caste: c.category || c.caste || "OC",
      seatCategory: c.seatCategory,
      sourceUrl,
      sourceName
    }));

    return {
      available: true,
      totalRecords: parsedRecords.length,
      validRecords: parsedRecords.length,
      invalidRecords: 0,
      openingRank: result.openingRank,
      closingRank: result.closingRank,
      genderSplit: result.genderSplit,
      categoryCounts: result.categoryCounts,
      parsedRecords,
      meta: {
        examId,
        sourceUrl,
        sourceName,
        admissionYear: parseInt(admissionYear, 10),
        phase,
        collegeCode: collegeCode.toUpperCase(),
        collegeName: collegeObj.name,
        branchCode: branchCode.toUpperCase(),
        branchName: branchObj.name
      }
    };
  },

  /**
   * Commit verified batch into Supabase idempotently
   */
  async commitImport(records, meta = {}, user = "system_admin") {
    const examId = meta.examId || (records[0]?.examId) || "tg-eapcet";
    const historicalExamName = examId === "tg-ecet" ? "TG ECET" : examId === "tg-polycet" ? "TG POLYCET" : (meta.admissionYear < 2024 ? "TS EAMCET" : "TG EAPCET");

    // 1. Create audit log
    const log = await allotmentRepository.createImportLog({
      sourceUrl: meta.sourceUrl || "https://tgeapcet.nic.in/college_allotment.aspx",
      sourceName: meta.sourceName || "Official TSCHE Allotment Order",
      examId,
      historicalExamName,
      admissionYear: meta.admissionYear || 2026,
      phase: meta.phase || "phase2",
      totalRecords: records.length,
      validRecords: records.length,
      importedBy: user
    });

    // 2. Batch insert into database
    const { inserted, duplicates } = await allotmentRepository.insertBatchAllotments(records, log.id);

    return {
      success: true,
      importLogId: log.id,
      totalProcessed: records.length,
      newRecordsInserted: inserted,
      duplicatesSkipped: duplicates
    };
  }
};
