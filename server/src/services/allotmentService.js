import { ALL_TSCHE_COLLEGES } from "../data/allTscheInstitutions.js";
import { allotmentRepository } from "../repositories/allotmentRepository.js";
import { scrapeOfficialTscheAllotment } from "./tscheAllotmentScraper.js";

export const ALLOTMENT_YEARS = [
  { id: "2026-final", label: "2026 Final Phase" },
];

export const ALLOTMENT_BRANCHES = [
  { code: "CIV", name: "CIVIL ENGINEERING (CIV)" },
  { code: "CSE", name: "COMPUTER SCIENCE AND ENGINEERING (CSE)" },
  { code: "CSM", name: "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING (CSM)" },
  { code: "AID", name: "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE (AID)" },
  { code: "AIM", name: "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING (AIM)" },
  { code: "CSD", name: "COMPUTER SCIENCE AND DATA SCIENCE (CSD)" },
  { code: "CSC", name: "COMPUTER SCIENCE AND ENGINEERING (CYBER SECURITY) (CSC)" },
  { code: "CIC", name: "CSE (IoT AND CYBER SECURITY) (CIC)" },
  { code: "INF", name: "INFORMATION TECHNOLOGY (INF)" },
  { code: "ECE", name: "ELECTRONICS AND COMMUNICATION ENGINEERING (ECE)" },
  { code: "EEE", name: "ELECTRICAL AND ELECTRONICS ENGINEERING (EEE)" },
  { code: "EVL", name: "ELECTRONICS ENGINEERING (VLSI DESIGN) (EVL)" },
  { code: "MEC", name: "MECHANICAL ENGINEERING (MEC)" },
  { code: "MET", name: "METALLURGICAL ENGINEERING (MET)" },
  { code: "MIN", name: "MINING ENGINEERING (MIN)" },
  { code: "BIO", name: "BIO-TECHNOLOGY (BIO)" },
  { code: "BME", name: "BIO-MEDICAL ENGINEERING (BME)" },
  { code: "CHE", name: "CHEMICAL ENGINEERING (CHE)" },
  { code: "GEO", name: "GEO INFORMATICS (GEO)" },
];

/**
 * Retrieves official candidate seat allotment dataset from PostgreSQL or on-demand official scraper
 */
export async function getAllotmentDataset({
  examId = "tg-eapcet",
  year = "2026-final",
  college = "CBIT",
  branch = "CSE",
  search = "",
  category = "",
  gender = "",
  page = 1,
  limit = 50
}) {
  const isAp = examId === "ap-eapcet";
  const cCode = (college || (isAp ? "VITB" : "CBIT")).trim().toUpperCase();
  const bCode = (branch || "CSE").trim().toUpperCase();

  const parts = year.split("-");
  const admissionYear = parseInt(parts[0], 10) || (isAp ? 2025 : 2026);
  const phase = parts[1] || "final";

  let collegeObj = ALL_TSCHE_COLLEGES.find((c) => c.code === cCode);
  let branchObj = ALLOTMENT_BRANCHES.find((b) => b.code === bCode);

  if (!collegeObj) {
    collegeObj = {
      code: cCode,
      name: `${cCode} Engineering College`,
      shortName: cCode,
    };
  }
  if (!branchObj) {
    branchObj = {
      code: bCode,
      name: bCode,
    };
  }

  // 1. First, check PostgreSQL database
  try {
    const dbResult = await allotmentRepository.queryAllotments({
      examId,
      year: admissionYear,
      phase,
      collegeCode: cCode,
      branchCode: bCode,
      search,
      category,
      gender,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 50,
    });

    if (dbResult && dbResult.totalRecords > 0) {
      if (dbResult.candidates && dbResult.candidates[0]) {
        if (dbResult.candidates[0].collegeName) {
          collegeObj.name = dbResult.candidates[0].collegeName;
        }
        if (dbResult.candidates[0].branchName) {
          branchObj.name = dbResult.candidates[0].branchName;
        }
      }

      return {
        available: true,
        isOfficialLiveScraped: true,
        source: isAp ? "https://cets.apsche.ap.gov.in/" : "https://tgeapcet.nic.in/college_allotment.aspx",
        year,
        historicalExamName: isAp ? "AP EAPCET" : (admissionYear < 2024 ? "TS EAMCET" : "TG EAPCET"),
        college: collegeObj,
        branch: branchObj,
        ...dbResult
      };
    }
  } catch (dbErr) {
    console.warn(`[Allotment Service] DB Query Error:`, dbErr.message);
  }

  // 2. If not in DB, trigger real-time scrape from official portal
  try {
    const liveScrape = await scrapeOfficialTscheAllotment(cCode, bCode);

    if (liveScrape && liveScrape.available && liveScrape.candidates && liveScrape.candidates.length > 0) {
      // Ingest into DB asynchronously in background so next time is <50ms
      const dbRecords = liveScrape.candidates.map((c) => ({
        examId: "tg-eapcet",
        historicalExamName: admissionYear < 2024 ? "TS EAMCET" : "TG EAPCET",
        admissionYear,
        phase,
        collegeCode: cCode,
        collegeName: collegeObj.name,
        branchCode: bCode,
        branchName: branchObj.name,
        rank: c.rank,
        rollNo: c.rollNo,
        candidateName: c.candidateName,
        gender: c.gender,
        region: c.region || "OU",
        caste: c.category || "OC",
        seatCategory: c.seatCategory,
      }));

      allotmentRepository.insertBatchAllotments(dbRecords).catch((e) =>
        console.warn(`[Auto-Ingest DB Warning]:`, e.message)
      );

      // Filter in-memory for immediate response
      let filtered = [...liveScrape.candidates];
      if (search && search.trim()) {
        const term = search.trim().toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.candidateName.toLowerCase().includes(term) ||
            c.rollNo.toLowerCase().includes(term) ||
            c.seatCategory.toLowerCase().includes(term) ||
            String(c.rank).includes(term)
        );
      }
      if (gender) {
        filtered = filtered.filter((c) => c.gender.toUpperCase() === gender.toUpperCase());
      }
      if (category) {
        filtered = filtered.filter(
          (c) =>
            c.category.toUpperCase() === category.toUpperCase() ||
            c.seatCategory.toUpperCase().includes(category.toUpperCase())
        );
      }

      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 50;
      const totalFiltered = filtered.length;
      const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return {
        available: true,
        isOfficialLiveScraped: true,
        source: "https://tgeapcet.nic.in/college_allotment.aspx",
        year,
        historicalExamName: admissionYear < 2024 ? "TS EAMCET" : "TG EAPCET",
        college: collegeObj,
        branch: branchObj,
        totalRecords: totalFiltered,
        page: pageNum,
        pageSize: limitNum,
        totalPages: Math.max(1, Math.ceil(totalFiltered / limitNum)),
        totalSeats: liveScrape.totalSeats,
        openingRank: liveScrape.openingRank,
        closingRank: liveScrape.closingRank,
        genderSplit: liveScrape.genderSplit,
        categoryCounts: liveScrape.categoryCounts,
        categoryClosingRanks: liveScrape.categoryClosingRanks,
        candidates: paginated,
      };
    }
  } catch (scrapeErr) {
    console.error(`[Allotment Service] Scrape Error:`, scrapeErr.message);
  }

  // 3. If unavailable on official portal and not in DB: Return clean unavailable response (NO FAKE DATA)
  return {
    available: false,
    reason: `Official allotment data for ${collegeObj.name} (${cCode}) - ${branchObj.name} (${bCode}) is not published or currently unavailable on the official portal.`,
    isOfficialLiveScraped: false,
    source: "https://tgeapcet.nic.in/college_allotment.aspx",
    year,
    historicalExamName: admissionYear < 2024 ? "TS EAMCET" : "TG EAPCET",
    college: collegeObj,
    branch: branchObj,
    totalRecords: 0,
    page: 1,
    pageSize: 50,
    totalPages: 1,
    totalSeats: 0,
    openingRank: 0,
    closingRank: 0,
    genderSplit: { male: 0, female: 0, malePercent: 0, femalePercent: 0 },
    categoryCounts: {},
    categoryClosingRanks: [],
    candidates: [],
  };
}
