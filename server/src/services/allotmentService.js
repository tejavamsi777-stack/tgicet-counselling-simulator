import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ALL_TSCHE_COLLEGES } from "../data/allTscheInstitutions.js";
import { allotmentRepository } from "../repositories/allotmentRepository.js";
import { scrapeOfficialTscheAllotment } from "./tscheAllotmentScraper.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_2025_PATH = path.resolve(__dirname, "../data/tg_eapcet_2025_final_allotments.json");
const LOCAL_2024_PATH = path.resolve(__dirname, "../data/tg_eapcet_2024_allotments.json");
const LOCAL_2023_PATH = path.resolve(__dirname, "../data/tg_eapcet_2023_allotments.json");
const LOCAL_2022_PATH = path.resolve(__dirname, "../data/tg_eapcet_2022_allotments.json");

export const ALLOTMENT_YEARS = [
  { id: "2026-final", label: "2026" },
  { id: "2025-final", label: "2025" },
  { id: "2024", label: "2024" },
  { id: "2023", label: "2023" },
  { id: "2022", label: "2022" },
];

export const ALLOTMENT_BRANCHES = [
  { code: "CSE", name: "COMPUTER SCIENCE AND ENGINEERING" },
  { code: "CSM", name: "COMPUTER SCIENCE AND ENGINEERING (ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING)" },
  { code: "CSD", name: "COMPUTER SCIENCE AND ENGINEERING (DATA SCIENCE)" },
  { code: "CSC", name: "COMPUTER SCIENCE AND ENGINEERING (CYBER SECURITY)" },
  { code: "CSO", name: "COMPUTER SCIENCE AND ENGINEERING (IOT)" },
  { code: "CSW", name: "COMPUTER ENGINEERING (SOFTWARE ENGINEERING)" },
  { code: "CSB", name: "COMPUTER SCIENCE AND BUSINESS SYSTEM" },
  { code: "CSG", name: "COMPUTER SCIENCE & DESIGN" },
  { code: "CSI", name: "COMPUTER SCIENCE AND INFORMATION TECHNOLOGY" },
  { code: "CSN", name: "COMPUTER SCIENCE & ENGINEERING (NETWORKS)" },
  { code: "CSA", name: "COMPUTER SCIENCE AND ENGG (ARTIFICIAL INTELLIGENCE)" },
  { code: "CME", name: "COMPUTER ENGINEERING" },
  { code: "CS", name: "COMPUTER SCIENCE AND ENGINEERING" },
  { code: "CIC", name: "CSE (IoT AND CYBER SECURITY INCLUDING BLOCK CHAIN TECHNOLOGY)" },
  { code: "INF", name: "INFORMATION TECHNOLOGY" },
  { code: "AI", name: "ARTIFICIAL INTELLIGENCE" },
  { code: "AIM", name: "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING" },
  { code: "AID", name: "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE" },
  { code: "ECE", name: "ELECTRONICS AND COMMUNICATION ENGINEERING" },
  { code: "ECV", name: "ELECTRONICS AND COMMUNICATION ENGINEERING (VLSI DESIGN & TECHNOLOGY)" },
  { code: "EVL", name: "ELECTRONICS ENGINEERING (VLSI DESIGN AND TECHNOLOGY)" },
  { code: "ECI", name: "ELECTRONICS COMMUNICATION AND INSTRUMENTATION ENGINEERING" },
  { code: "EEE", name: "ELECTRICAL AND ELECTRONICS ENGINEERING" },
  { code: "EIE", name: "ELECTRONICS AND INSTRUMENTATION ENGINEERING" },
  { code: "ETE", name: "ELECTRONICS AND TELECOMMUNICATION ENGG" },
  { code: "ETM", name: "ELECTRONICS AND TELEMATICS" },
  { code: "ECM", name: "ELECTRONICS AND COMPUTER ENGINEERING" },
  { code: "MEC", name: "MECHANICAL ENGINEERING" },
  { code: "MCT", name: "MECHANICAL (MECHTRONICS) ENGINEERING" },
  { code: "MMS", name: "BTECH MECHANICAL WITH MTECH MANUFACTURING SYSTEMS" },
  { code: "MTE", name: "BTECH MECHANICAL WITH MTECH THERMAL ENGG" },
  { code: "AUT", name: "AUTOMOBILE ENGINEERING" },
  { code: "CIV", name: "CIVIL ENGINEERING" },
  { code: "CHE", name: "CHEMICAL ENGINEERING" },
  { code: "MET", name: "METALLURGICAL ENGINEERING" },
  { code: "MME", name: "METALLURGICAL AND MATERIALS ENGINEERING" },
  { code: "MMT", name: "METALLURGY AND MATERIAL ENGINEERING" },
  { code: "MIN", name: "MINING ENGINEERING" },
  { code: "BIO", name: "BIO-TECHNOLOGY" },
  { code: "BME", name: "BIO-MEDICAL ENGINEERING" },
  { code: "PHE", name: "PHARMACEUTICAL ENGINEERING" },
  { code: "PHM", name: "B.PHARMACY (MPC STREAM)" },
  { code: "PHD", name: "PHARM.D (DOCTOR OF PHARMACY)" },
  { code: "AGR", name: "AGRICULTURAL ENGINEERING" },
  { code: "FDT", name: "FOOD TECHNOLOGY" },
  { code: "DRG", name: "DAIRYING" },
  { code: "ANE", name: "AERONAUTICAL ENGINEERING" },
  { code: "PLG", name: "B.PLANNING" },
  { code: "BSE", name: "BUILDING SERVICES ENGG" },
  { code: "DTD", name: "DIGITAL TECHNIQUES FOR DESIGN AND PLANNING" },
  { code: "GEO", name: "GEO INFORMATICS" },
  { code: "TEX", name: "TEXTILE AND FASHION TECHNOLOGY" },
  { code: "DS", name: "DATA SCIENCE" },
  { code: "RAI", name: "ROBOTICS AND ARTIFICIAL INTELLIGENCE" },
];

/**
 * Retrieves official candidate seat allotment dataset from PostgreSQL or JSON dataset
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

  // 2. Fallback to local 2025/2024/2023/2022 JSON dataset if DB is empty/unavailable
  const targetJsonPath = admissionYear === 2025 ? LOCAL_2025_PATH : (admissionYear === 2024 ? LOCAL_2024_PATH : (admissionYear === 2023 ? LOCAL_2023_PATH : (admissionYear === 2022 ? LOCAL_2022_PATH : null)));
  if (targetJsonPath && fs.existsSync(targetJsonPath)) {
    try {
      const rawData = fs.readFileSync(targetJsonPath, "utf-8");
      const root = JSON.parse(rawData);
      const colData = root.data?.[cCode];
      
      if (colData && colData.branches) {
        let targetBranch = colData.branches.find(b => b.branchCode.toUpperCase() === bCode.toUpperCase());
        if (!targetBranch && bCode === "ALL") {
          const allCandidates = colData.branches.flatMap(b => b.candidates.map(c => ({ ...c, branchCode: b.branchCode })));
          targetBranch = { branchCode: "ALL", branchName: "All Branches Combined", candidates: allCandidates };
        }

        if (targetBranch && targetBranch.candidates) {
          let candidates = targetBranch.candidates.map(c => ({
            rollNo: c.rollNo || c.rollno,
            rank: c.rank,
            candidateName: c.candidateName || c.cand_name,
            gender: c.gender,
            region: c.region || "OU",
            caste: c.caste || c.category || "OC",
            seatCategory: c.seatCategory || c.seat_category || "OC_GEN_OU"
          }));

          // Filter
          if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            candidates = candidates.filter(c =>
              c.candidateName.toLowerCase().includes(q) ||
              c.rollNo.toLowerCase().includes(q) ||
              String(c.rank).includes(q) ||
              c.seatCategory.toLowerCase().includes(q)
            );
          }
          if (gender && gender !== "ALL") {
            candidates = candidates.filter(c => c.gender.toUpperCase().startsWith(gender.toUpperCase()[0]));
          }
          if (category && category !== "ALL") {
            candidates = candidates.filter(c => c.caste.toUpperCase().includes(category.toUpperCase()) || c.seatCategory.toUpperCase().includes(category.toUpperCase()));
          }

          candidates.sort((a, b) => a.rank - b.rank);

          const pageNum = parseInt(page, 10) || 1;
          const limitNum = parseInt(limit, 10) || 50;
          const totalFiltered = candidates.length;
          const paginated = candidates.slice((pageNum - 1) * limitNum, pageNum * limitNum);
          const ranks = candidates.map(c => c.rank).filter(Boolean);

          const maleCount = candidates.filter(c => c.gender === 'M').length;
          const femaleCount = candidates.filter(c => c.gender === 'F').length;

          return {
            available: true,
            isOfficialLiveScraped: true,
            source: "https://tgeapcet.nic.in/college_allotment.aspx",
            year,
            historicalExamName: "TG EAPCET 2025",
            college: { code: cCode, name: colData.name || collegeObj.name },
            branch: { code: bCode, name: targetBranch.branchName || branchObj.name },
            totalRecords: totalFiltered,
            page: pageNum,
            pageSize: limitNum,
            totalPages: Math.max(1, Math.ceil(totalFiltered / limitNum)),
            totalSeats: candidates.length,
            openingRank: ranks.length ? Math.min(...ranks) : 0,
            closingRank: ranks.length ? Math.max(...ranks) : 0,
            genderSplit: {
              male: maleCount,
              female: femaleCount,
              malePercent: totalFiltered ? Math.round((maleCount / totalFiltered) * 100) : 0,
              femalePercent: totalFiltered ? Math.round((femaleCount / totalFiltered) * 100) : 0,
            },
            candidates: paginated,
          };
        }
      }
    } catch (jsonErr) {
      console.warn(`[Allotment Service] JSON Fallback Error:`, jsonErr.message);
    }
  }

  // 3. Fallback to live scrape from official TSCHE portal
  try {
    const liveScrape = await scrapeOfficialTscheAllotment(cCode, bCode);

    if (liveScrape && liveScrape.available && liveScrape.candidates && liveScrape.candidates.length > 0) {
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

  // 4. Unavailable
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
