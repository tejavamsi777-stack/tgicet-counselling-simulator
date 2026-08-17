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
   * Commit verified batch into Supabase idempotently
   */
  async commitImport(records, meta = {}, user = "system_admin") {
    // 1. Create audit log
    const log = await allotmentRepository.createImportLog({
      sourceUrl: meta.sourceUrl || "https://tgeapcet.nic.in/college_allotment.aspx",
      sourceName: meta.sourceName || "Official TSCHE Allotment Order",
      examId: "tg-eapcet",
      historicalExamName: meta.admissionYear < 2024 ? "TS EAMCET" : "TG EAPCET",
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
