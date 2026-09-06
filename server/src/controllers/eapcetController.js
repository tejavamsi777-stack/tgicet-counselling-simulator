import { getEapcetCache, runEapcetScrapeRefresh } from "../services/scraperService.js";
import { EAPCET_INSTITUTIONS } from "../data/eapcetInstitutions.js";
import { ALL_TSCHE_COLLEGES } from "../data/allTscheInstitutions.js";
import { ALLOTMENT_YEARS, ALLOTMENT_BRANCHES, getAllotmentDataset } from "../services/allotmentService.js";
import { allotmentRepository } from "../repositories/allotmentRepository.js";
import { allotmentImportService } from "../services/allotmentImportService.js";
import { pool } from "../config/database.js";
import { AP_COLLEGES_METADATA } from "../data/apCollegesMetadata.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let OFFICIAL_COLLEGE_BRANCHES = {};
try {
  const branchesPath = path.resolve(__dirname, "../data/officialCollegeBranches.json");
  if (fs.existsSync(branchesPath)) {
    OFFICIAL_COLLEGE_BRANCHES = JSON.parse(fs.readFileSync(branchesPath, "utf-8"));
  }
} catch (e) {
  console.warn("[EAPCET Controller] Could not load officialCollegeBranches.json:", e.message);
}

// -----------------------------------------------------------------------
// TG EAPCET 2025 Final Allotment Cache – used to derive last-rank cutoffs
// -----------------------------------------------------------------------
let _tg2025AllotmentCache = null;
function getTg2025AllotmentData() {
  if (_tg2025AllotmentCache) return _tg2025AllotmentCache;
  try {
    const jsonPath = path.resolve(__dirname, "../data/tg_eapcet_2025_final_allotments.json");
    if (fs.existsSync(jsonPath)) {
      const root = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      _tg2025AllotmentCache = root.data || {};
    } else {
      _tg2025AllotmentCache = {};
    }
  } catch (e) {
    console.warn("[EAPCET Controller] Could not load tg_eapcet_2025_final_allotments.json:", e.message);
    _tg2025AllotmentCache = {};
  }
  return _tg2025AllotmentCache;
}

// -----------------------------------------------------------------------
// Multi-Year (2022-2025) TG EAPCET Allotment Caches for Trajectory Analysis
// -----------------------------------------------------------------------
const TG_ALLOTMENT_PATHS = {
  2022: path.resolve(__dirname, "../data/tg_eapcet_2022_allotments.json"),
  2023: path.resolve(__dirname, "../data/tg_eapcet_2023_allotments.json"),
  2024: path.resolve(__dirname, "../data/tg_eapcet_2024_allotments.json"),
  2025: path.resolve(__dirname, "../data/tg_eapcet_2025_final_allotments.json"),
};

const _allotmentTrajectoryCache = {};
function getAllotmentYearData(year) {
  if (_allotmentTrajectoryCache[year]) return _allotmentTrajectoryCache[year];
  const p = TG_ALLOTMENT_PATHS[year];
  if (p && fs.existsSync(p)) {
    try {
      const root = JSON.parse(fs.readFileSync(p, "utf-8"));
      _allotmentTrajectoryCache[year] = root.data || {};
    } catch (err) {
      console.warn(`[EAPCET Trajectory] Failed to load data for ${year}:`, err.message);
      _allotmentTrajectoryCache[year] = {};
    }
  } else {
    _allotmentTrajectoryCache[year] = {};
  }
  return _allotmentTrajectoryCache[year];
}

/**
 * Extract 2025 last-rank (closing rank) cutoffs per standard category for a
 * college + branch from the local allotment JSON.
 * Returns an object like { OC, EWS, 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', SC, ST }
 * where each value is the highest rank allotted under that category's seat pool
 * (using OU-region general seats as the primary pool, falling back to UR).
 */
// Known code mismatches between EAPCET_INSTITUTIONS catalog and the allotment JSON
const TG_COLLEGE_CODE_ALIAS = {
  VNRV: "VJEC",  // VNR Vignana Jyothi – code in allotment is VJEC
  // Add more aliases here if discovered
};

function getCutoffsFromAllotment2025(collegeCode, branchCode) {
  const data = getTg2025AllotmentData();
  const resolvedCode = TG_COLLEGE_CODE_ALIAS[collegeCode?.toUpperCase()] || collegeCode?.toUpperCase();
  const colData = data[resolvedCode];
  if (!colData) return null;

  const branchData = (colData.branches || []).find(
    (b) => b.branchCode?.toUpperCase() === branchCode?.toUpperCase()
  );
  if (!branchData || !branchData.candidates || branchData.candidates.length === 0) return null;

  // Build max-rank per seat category
  const maxRankBySeatCat = {};
  for (const c of branchData.candidates) {
    const sc = c.seatCategory || "";
    if (!maxRankBySeatCat[sc] || c.rank > maxRankBySeatCat[sc]) {
      maxRankBySeatCat[sc] = c.rank;
    }
  }

  // Helper: pick last rank from seat categories matching a pattern, prefer OU over UR
  const pick = (...patterns) => {
    let ouBest = null;
    let urBest = null;
    for (const [sc, rank] of Object.entries(maxRankBySeatCat)) {
      if (patterns.some((p) => sc.toUpperCase().includes(p.toUpperCase()))) {
        if (sc.includes("_OU")) {
          if (ouBest === null || rank > ouBest) ouBest = rank;
        } else if (sc.includes("_UR")) {
          if (urBest === null || rank > urBest) urBest = rank;
        }
      }
    }
    // Prefer OU last rank (wider pool). Fall back to UR if OU not present.
    const val = ouBest ?? urBest;
    return val ?? null;
  };

  const oc    = pick("OC_GEN");
  const ews   = pick("EWS_GEN");
  const bcA   = pick("BC_A_GEN");
  const bcB   = pick("BC_B_GEN");
  const bcC   = pick("BC_C_GEN");
  const bcD   = pick("BC_D_GEN");
  const bcE   = pick("BC_E_GEN");
  // SC: best of SC_I, SC_II, SC_III (highest last rank = most accessible)
  const scRanks = ["SC_I_GEN", "SC_II_GEN", "SC_III_GEN"]
    .map((p) => pick(p))
    .filter((v) => v !== null);
  const sc    = scRanks.length ? Math.max(...scRanks) : null;
  const st    = pick("ST_GEN");

  const result = {};
  if (oc  !== null) result["OC"]   = oc;
  if (ews !== null) result["EWS"]  = ews;
  if (bcA !== null) result["BC-A"] = bcA;
  if (bcB !== null) result["BC-B"] = bcB;
  if (bcC !== null) result["BC-C"] = bcC;
  if (bcD !== null) result["BC-D"] = bcD;
  if (bcE !== null) result["BC-E"] = bcE;
  if (sc  !== null) result["SC"]   = sc;
  if (st  !== null) result["ST"]   = st;

  return Object.keys(result).length > 0 ? result : null;
}

// -----------------------------------------------------------------------
// Static authoritative data (rules, eligibility, documents)
// These are stable official facts that do not change day-to-day.
// When TSCHE publishes updates, we update these constants here only.
// -----------------------------------------------------------------------
const EAPCET_COUNSELLING_DATA = {
  year: 2026,

  // ── Phase-wise Master Schedule ────────────────────────────────────────
  phases: [
    {
      id: "phase1",
      label: "Phase I",
      badge: "Concluded",
      status: "concluded",
      steps: [
        { action: "Online Filing, Fee & Slot Booking", dates: "June 20 – 25, 2026", status: "concluded" },
        { action: "Certificate Verification (Pre-booked slots)", dates: "June 26 – 28, 2026", status: "concluded" },
        { action: "Exercising Web Options", dates: "June 28 – July 1, 2026", status: "concluded" },
        { action: "Absolute System Freeze", dates: "July 1, 2026", status: "concluded" },
        { action: "Phase I Provisional Seat Allotment", dates: "On or before July 4, 2026", status: "concluded" },
        { action: "Online Tuition Fee Payment", dates: "July 5 – 7, 2026", status: "concluded" },
        { action: "Mandatory Physical Reporting at Allotted College", dates: "July 5 – 10, 2026", status: "concluded" },
      ],
    },
    {
      id: "phase2",
      label: "Phase II",
      badge: "Concluded",
      status: "concluded",
      steps: [
        { action: "Certificate Verification (Pre-booked slots)", dates: "July 18, 2026", status: "concluded" },
        { action: "Exercising Fresh Web Options", dates: "July 18 – 19, 2026", status: "concluded" },
        { action: "Absolute System Freeze", dates: "July 19, 2026", status: "concluded" },
        { action: "Phase II Provisional Seat Allotment", dates: "On or before July 22, 2026", status: "concluded" },
        { action: "Online Tuition Fee Payment & Self-Reporting", dates: "July 22 – 24, 2026", status: "concluded" },
        { action: "Mandatory Physical Reporting at Allotted College", dates: "July 25 – 28, 2026", status: "concluded" },
      ],
    },
    {
      id: "final",
      label: "Final Phase",
      badge: "Concluded",
      status: "concluded",
      constraint: "Candidates who voluntarily executed an online seat cancellation during either Phase I or Phase II are explicitly barred from participating in the Final Phase.",
      steps: [
        { action: "Online Filing, Fee & Slot Booking (Unverified Only)", dates: "July 31, 2026", status: "concluded" },
        { action: "Certificate Verification", dates: "August 1, 2026", status: "concluded" },
        { action: "Exercising Options (Fresh entry mandatory)", dates: "August 1 – 2, 2026", status: "concluded" },
        { action: "Provisional Seat Allotment", dates: "On or before August 5, 2026", status: "concluded" },
        { action: "Fee Payment, Self & College Reporting", dates: "August 5 – 7, 2026", status: "concluded" },
        { action: "College Updates Joining Details", dates: "August 8, 2026", status: "concluded" },
      ],
      logistics: {
        collegeUpgrade: "Reclaim Original T.C. from Phase II college → submit to new institution (Aug 5–7).",
        branchUpgrade: "Download updated order, pay differential fee, submit new self-report.",
      },
    },
    {
      id: "sliding",
      label: "Internal Sliding",
      badge: "Concluded",
      status: "concluded",
      steps: [
        { action: "Internal Sliding Process", dates: "August 10 – 12, 2026", status: "concluded" },
        { action: "Sliding Results Announced", dates: "August 13, 2026", status: "concluded" },
      ],
    },
  ],

  // ── Admission Conditions & Binding Rules ──────────────────────────────
  conditions: [
    {
      id: "cancellation_bar",
      severity: "high",
      title: "Voluntary Cancellation Restriction",
      body: "Candidates who executed a voluntary online seat cancellation in Phase I or Phase II are explicitly barred from participating in the Final Phase — no exceptions.",
    },
    {
      id: "cascading_chain",
      severity: "high",
      title: "Seat Supersession Protocol",
      body: "If a new seat is allotted in a later phase, the previous allotment is automatically and irrevocably vacated and transferred to the next meritorious candidate. There is no right of return to the earlier seat.",
    },
    {
      id: "dost_relinquishment",
      severity: "medium",
      title: "DOST Relinquishment Obligation",
      body: "Candidates with degree admissions through DOST must formally relinquish them online at the time of self-reporting at the allotted engineering college.",
    },
    {
      id: "ncc_sports_mandate",
      severity: "medium",
      title: "NCC & Sports Quota Mandate",
      body: "Special category candidates (NCC, Sports) must exercise options in both Phase II and the Final Phase to be considered for their reserved seats.",
    },
    {
      id: "special_hlc",
      severity: "medium",
      title: "Special Category Reporting Centre",
      body: "NCC, PHC (Physically Handicapped), CAP, Sports (SG), and Anglo-Indian candidates must mandatorily report to the designated Help Line Centre at Government Polytechnic, Masab Tank, Hyderabad.",
    },
    {
      id: "post_final_irrevocability",
      severity: "high",
      title: "Post–Final Phase Irrevocability",
      body: "Withdrawals or seat cancellations are strictly prohibited after the Final Phase or after Internal Sliding. No exceptions will be entertained under any circumstances.",
    },
    {
      id: "vacancy_routing",
      severity: "low",
      title: "Remaining Vacancy Routing",
      body: "Seats that remain unfilled after Internal Sliding are transferred exclusively to TG ECET Lateral Entry admissions — not to Spot Admissions.",
    },
    {
      id: "academic_commencement",
      severity: "low",
      title: "Academic Commencement",
      body: "Classes officially commence August 1, 2026 as per the academic calendar prescribed by the regulatory authority.",
    },
  ],

  // ── Admission Criteria & Reservation Framework ────────────────────────
  eligibility: {
    academic: [
      "Qualified in TG EAPCET-2026 with minimum 45% marks in Intermediate group subjects (40% for reserved categories).",
      "Must be an Indian National satisfying local/unreserved status per G.O. Ms. No. 15 dated 27-02-2025.",
      "Seat matrix: 85% reserved for Local (O.U. Area) candidates; 15% Unreserved (open to O.U. locals, 10-year state residents, government employee children/spouses).",
      "Minimum age: 16 years as of 31-12-2026 for Engineering (17 for Pharm-D); Maximum 25 years (OC) or 29 years (others) as of 01-07-2026 for scholarship eligibility.",
      "Minority Exemption: Muslim/Christian minority candidates without a TG EAPCET rank may apply for leftover minority college seats with required Inter % (not eligible for Fee Reimbursement).",
    ],
    fees: [
      { label: "Exam Fee — Engg (E) / Agri (AP) [OC / BC]", value: "₹900 (online)" },
      { label: "Exam Fee — Engg (E) / Agri (AP) [SC / ST / PH]", value: "₹500 (online)" },
      { label: "Exam Fee — Both Streams (E & AP) [OC / BC]", value: "₹1,800 (online)" },
      { label: "Exam Fee — Both Streams (E & AP) [SC / ST / PH]", value: "₹1,000 (online)" },
      { label: "Counselling Processing Fee (OC / BC / EWS)", value: "₹1,200 (online)" },
      { label: "Counselling Processing Fee (SC / ST)", value: "₹600 (online)" },
      { label: "EWS Reservation", value: "10% (G.O. Ms. No. 244)" },
      { label: "ST Reservation", value: "10% (G.O. Ms. No. 33)" },
      { label: "PH Reservation", value: "5% (G.O. Ms. No. 2)" },
      { label: "CAP (Armed Personnel Children)", value: "2%" },
      { label: "SC Grouping", value: "Applies per G.O. Ms. No. 10" },
      { label: "Minimum Tuition Floor (SC/ST)", value: "₹5,000 (refundable on final reporting; forfeited if not reported)" },
      { label: "Minimum Tuition Floor (Others)", value: "₹10,000 (refundable on final reporting; forfeited if not reported)" },
    ],
  },

  // ── Certificate Verification Document List ────────────────────────────
  documents: [
    {
      id: "rank_card",
      name: "TG EAPCET 2026 Rank Card",
      purpose: "Primary proof of rank and eligibility for counselling.",
      categories: ["all"],
      validity: "Download from official TSCHE/tgeapcet.nic.in portal.",
      xeroxSets: 2,
    },
    {
      id: "hall_ticket",
      name: "TG EAPCET 2026 Hall Ticket",
      purpose: "Supports rank card verification.",
      categories: ["all"],
      validity: "Download from official portal.",
      xeroxSets: 2,
    },
    {
      id: "aadhar",
      name: "Aadhar Card",
      purpose: "Identity proof for candidate.",
      categories: ["all"],
      validity: "Valid Aadhar with linked mobile number.",
      xeroxSets: 2,
    },
    {
      id: "ssc_memo",
      name: "SSC (Class X) Marks Memo",
      purpose: "Proof of date of birth and qualifying marks.",
      categories: ["all"],
      validity: "Original pass certificate issued by the Board of Secondary Education.",
      xeroxSets: 2,
    },
    {
      id: "inter_memo",
      name: "Intermediate (Class XII) Marks Memo cum Pass Certificate",
      purpose: "Academic eligibility proof.",
      categories: ["all"],
      validity: "Original marks sheet from BIEAP/TSBIE or equivalent Board.",
      xeroxSets: 2,
    },
    {
      id: "tc",
      name: "Transfer Certificate (T.C.)",
      purpose: "Required for college admission and later for branch/college upgrade.",
      categories: ["all"],
      validity: "Original T.C. issued by the last attended institution.",
      xeroxSets: 1,
    },
    {
      id: "study_certs",
      name: "Study / Bonafide Certificates (Classes 6 to Intermediate — 7 consecutive years)",
      purpose: "Establishes local area status (OU/AU/SVU jurisdiction).",
      categories: ["all"],
      validity: "Original certificates from each school/college for 7 consecutive years of study in Telangana.",
      xeroxSets: 2,
    },
    {
      id: "residence_cert",
      name: "Residence Certificate",
      purpose: "Required for Non-local / Private study candidates to establish residency.",
      categories: ["nonlocal"],
      validity: "Issued by the Tahsildar / MRO. Valid for current admission year.",
      xeroxSets: 2,
    },
    {
      id: "caste_cert",
      name: "Caste / Community Certificate",
      purpose: "Mandatory for BC, SC, ST reservation benefits.",
      categories: ["bc", "sc", "st"],
      validity: "MeeSeva-issued original caste certificate. Must match category applied for.",
      xeroxSets: 2,
    },
    {
      id: "income_cert",
      name: "Income Certificate",
      purpose: "Required for Fee Reimbursement eligibility and EWS reservation.",
      categories: ["ews", "bc", "sc", "st"],
      validity: "MeeSeva-issued. MUST be issued on or after January 1st of the current admission year (2026). Certificates issued before Jan 1, 2026 are NOT accepted.",
      xeroxSets: 2,
    },
    {
      id: "ews_cert",
      name: "Economically Weaker Section (EWS) Certificate",
      purpose: "Claim 10% EWS reservation for OC candidates below income threshold.",
      categories: ["ews"],
      validity: "Issued by Tahsildar for the current Financial Year (2025–26). Must be on prescribed format (G.O. Ms. No. 244).",
      xeroxSets: 2,
    },
    {
      id: "minority_cert",
      name: "Minority Status Certificate",
      purpose: "Claim Minority quota seats at Minority institutions (Muslim/Christian).",
      categories: ["minority"],
      validity: "SSC Transfer Certificate mentioning religion, OR a Bonafide Certificate from the Head Master / Principal confirming minority community membership.",
      xeroxSets: 2,
    },
    {
      id: "ph_cert",
      name: "Disability Certificate (PH — Physically Handicapped)",
      purpose: "Claim 5% PH reservation. Must indicate % of disability.",
      categories: ["ph"],
      validity: "SADAREM-authenticated certificate issued by the District Medical Board. Minimum 40% disability.",
      xeroxSets: 2,
    },
    {
      id: "cap_cert",
      name: "CAP Certificate (Children of Armed Personnel)",
      purpose: "Claim 2% CAP reservation for children of defence/paramilitary personnel.",
      categories: ["cap"],
      validity: "Appendix-3 certificate signed by Unit Commanding Officer (min. rank: Colonel/Commandant), with authenticated Service Register showing permanent hometown. For Active Duty candidates: must include BSF/CRPF service record.",
      xeroxSets: 2,
    },
    {
      id: "ncc_cert",
      name: "NCC Certificate",
      purpose: "Claim NCC special quota seats.",
      categories: ["ncc"],
      validity: "'B' or 'C' Certificate issued by NCC authority. Must exercise options in both Phase II and Final Phase.",
      xeroxSets: 2,
    },
    {
      id: "sports_cert",
      name: "Sports / Games Certificate",
      purpose: "Claim Sports/Games (SG) special quota seats.",
      categories: ["sports"],
      validity: "State / National level participation certificate from the relevant Sports Authority of Telangana (SAT).",
      xeroxSets: 2,
    },
    {
      id: "income_cert_fr",
      name: "Income & Assets Certificate (Fee Reimbursement)",
      purpose: "Required exclusively for Fee Reimbursement Scheme application. Different from standard Income Certificate.",
      categories: ["fr"],
      validity: "Annual family income ≤ ₹2,50,000 for BC/SC/ST (varies). MeeSeva-issued for 2025–26.",
      xeroxSets: 2,
    },
  ],
};

// -----------------------------------------------------------------------
// Static authoritative data for AP EAPCET (from official cap.apcfss.in PDF)
// -----------------------------------------------------------------------
const AP_EAPCET_COUNSELLING_DATA = {
  year: 2026,
  examName: "AP EAPCET 2026 (M.P.C. Stream)",
  authority: "Commissionerate of Higher Education, Andhra Pradesh / APSCHE",
  officialWebsite: "https://cap.apcfss.in/",

  processingFee: {
    ocBc: 1200,
    scSt: 600,
    modes: "Credit Card / Debit Card / Net Banking / UPI on https://cap.apcfss.in/",
  },

  phases: [
    {
      id: "phase1",
      label: "First Phase",
      badge: "Concluded",
      status: "concluded",
      steps: [
        { action: "Online Payment of Processing Fee cum Registration & Verification", dates: "July 1 – 7, 2026", status: "concluded" },
        { action: "Online Verification of Uploaded Certificates at Notified HLCs", dates: "July 4 – 10, 2026", status: "concluded" },
        { action: "Exercising the Web-Options by Registered Eligible Candidates", dates: "July 8 – 12, 2026", status: "concluded" },
        { action: "Change of Web Options (Editing of saved options)", dates: "July 13, 2026", status: "concluded" },
        { action: "Release of First Phase Provisional Seat Allotments", dates: "July 17, 2026", status: "concluded" },
        { action: "Self-Reporting and Physical Reporting at Allotted Colleges", dates: "July 19 – 22, 2026", status: "concluded" },
      ],
    },
    {
      id: "final",
      label: "Final Phase",
      badge: "Active / Published",
      status: "active",
      note: "Candidates who participated in First Phase need not pay the processing fee once again. Candidates who have not participated in first phase must get their certificates verified in this final phase.",
      steps: [
        { action: "Online Payment of Processing Fee cum Registration and online certificate verification", dates: "17.08.2026 to 20.08.2026", status: "active" },
        { action: "Online Verification of uploaded Certificates at notified Help Line centers", dates: "17.08.2026 to 21.08.2026", status: "active" },
        { action: "Exercising the Web-Options by the registered and eligible Candidates", dates: "17.08.2026 to 22.08.2026", status: "active" },
        { action: "Change of Web Options (Editing of saved options)", dates: "23.08.2026", status: "upcoming" },
        { action: "Release of Final Phase Provisional Seat Allotments (After 6:00 PM)", dates: "26.08.2026", status: "upcoming" },
        { action: "Self-Reporting and Physical Reporting at Allotted Colleges", dates: "27.08.2026 to 30.08.2026", status: "upcoming" },
      ],
    },
  ],

  conditions: [
    {
      severity: "high",
      title: "Bridge Course Eligibility Limitation",
      body: "Intermediate Vocational Candidates who have completed Bridge Course with Maths and Physical Sciences as subjects are only eligible for admissions into engineering courses. They are NOT eligible for B.Pharmacy and Pharma.D courses.",
    },
    {
      severity: "high",
      title: "Final Phase Registration & Processing Fee Policy",
      body: "Candidates who participated in First Phase need not pay the processing fee once again. Candidates who have not participated in first phase are directed to get their certificates verified in this final phase.",
    },
    {
      severity: "medium",
      title: "Help Line Centers (HLC) Certificate Verification",
      body: "Candidates whose certificate data is verified online can directly proceed to exercise Web Options. Candidates with pending certificate verification must report to notified Help Line Centers (HLCs) with original documents.",
    },
    {
      severity: "low",
      title: "Self-Reporting & College Joining Deadline",
      body: "Allotted candidates must complete both online self-reporting on the CAP portal and physical reporting at the allotted college with original certificates and payment challan before the stipulated deadline.",
    },
  ],

  eligibility: {
    academic: [
      "Qualified in AP EAPCET-2026 (M.P.C. Stream) with minimum 45% marks in Intermediate (10+2) group subjects (40% for BC/SC/ST/EWS).",
      "Bridge Course Eligibility: Intermediate Vocational Candidates who completed Bridge Course with Maths and Physical Sciences are only eligible for admissions into engineering courses (Not eligible for B.Pharmacy/Pharma.D).",
      "Local Area Status: 85% of seats are reserved for Local candidates in Andhra University (AU) and Sri Venkateswara University (SVU) regions; 15% Unreserved (UR).",
      "Age Limit Criteria: Candidates should have completed 16 years of age as of 31st December 2026. No upper age limit for B.Tech/B.E.",
      "Minority Quota: Non-EAPCET minority candidates can apply for leftover minority quota seats as per APSCHE guidelines.",
    ],
    fees: [
      { label: "Counselling Processing Fee (OC / BC)", value: "₹1,200 (online at cap.apcfss.in)" },
      { label: "Counselling Processing Fee (SC / ST)", value: "₹600 (online at cap.apcfss.in)" },
      { label: "EWS Reservation Quota", value: "10% (G.O. Ms. No. 60)" },
      { label: "BC Reservation (BC-A, B, C, D, E)", value: "29% Total Quota" },
      { label: "SC Reservation Quota", value: "15%" },
      { label: "ST Reservation Quota", value: "6%" },
      { label: "PH Quota (Physically Handicapped)", value: "3% – 5%" },
      { label: "CAP Quota (Armed Personnel Children)", value: "2%" },
      { label: "NCC & Sports Quota", value: "1% & 0.5%" },
      { label: "Jagananna Vidya Deevena (JVD)", value: "100% Full Tuition Fee Reimbursement (Income ≤ ₹2.5L / Rice Card)" },
    ],
  },

  documents: [
    {
      id: "ap_rank_card",
      name: "AP EAPCET 2026 Rank Card",
      purpose: "Official rank verification document downloaded from https://cets.apsche.ap.gov.in/",
      mandatory: true,
      categories: ["all"],
      validity: "AP EAPCET 2026 Rank Card (Original)",
      xeroxSets: 2,
    },
    {
      id: "ap_hall_ticket",
      name: "AP EAPCET 2026 Hall Ticket",
      purpose: "Hall ticket with candidate photo & signature.",
      mandatory: true,
      categories: ["all"],
      validity: "AP EAPCET 2026 Examination Hall Ticket",
      xeroxSets: 2,
    },
    {
      id: "inter_memo",
      name: "Intermediate / 10+2 Marks Memo",
      purpose: "Proof of qualifying examination marks in Maths, Physics & Chemistry.",
      mandatory: true,
      categories: ["all"],
      validity: "Original Memo-cum-Pass Certificate (BIEAP / CBSE / ICSE)",
      xeroxSets: 2,
    },
    {
      id: "ssc_memo",
      name: "SSC / Class 10 Marks Memo",
      purpose: "Proof of Date of Birth and Father/Mother name match.",
      mandatory: true,
      categories: ["all"],
      validity: "Original SSC / 10th standard pass certificate",
      xeroxSets: 2,
    },
    {
      id: "study_cert",
      name: "Study / Bonafide Certificates (Class VI to Intermediate)",
      purpose: "Mandatory to establish Andhra University (AU) or Sri Venkateswara University (SVU) Local Candidate status (7 consecutive years).",
      mandatory: true,
      categories: ["all"],
      validity: "Signed by respective school / college principals",
      xeroxSets: 2,
    },
    {
      id: "caste_cert",
      name: "Integrated Community (Caste) Certificate",
      purpose: "Mandatory for BC-A, BC-B, BC-C, BC-D, BC-E, SC, ST category reservation claims.",
      mandatory: false,
      categories: ["bc_a", "bc_b", "bc_c", "bc_d", "bc_e", "sc", "st"],
      validity: "Issued through Andhra Pradesh MeeSeva / Grama Ward Sachivalayam with Barcode & Digital Signature",
      xeroxSets: 2,
    },
    {
      id: "income_cert",
      name: "Income Certificate / Rice Card / Ration Card",
      purpose: "Mandatory for Jagananna Vidya Deevena (JVD) Full Tuition Fee Reimbursement.",
      mandatory: false,
      categories: ["bc_a", "bc_b", "bc_c", "bc_d", "bc_e", "sc", "st", "ews", "oc_ews"],
      validity: "MeeSeva Income Certificate issued on or after 01.01.2026 or valid AP White Rice Card",
      xeroxSets: 2,
    },
    {
      id: "ews_cert",
      name: "EWS Certificate (Economically Weaker Sections)",
      purpose: "Mandatory for claiming 10% EWS quota reservation.",
      mandatory: false,
      categories: ["ews", "oc_ews"],
      validity: "Valid for FY 2026-27 issued by Tahsildar through AP MeeSeva",
      xeroxSets: 2,
    },
    {
      id: "tc",
      name: "Transfer Certificate (T.C.)",
      purpose: "Required during physical college reporting.",
      mandatory: true,
      categories: ["all"],
      validity: "Original TC from last attended Junior College / 10+2 institution",
      xeroxSets: 2,
    },
  ],
};

// -----------------------------------------------------------------------
// Controller methods
// -----------------------------------------------------------------------
export const eapcetController = {
  // GET /api/eapcet/counselling-data — returns full static official data
  async getCounsellingData(req, res) {
    const isAp = req.path.includes("ap-eapcet") || req.baseUrl.includes("ap-eapcet") || req.originalUrl.includes("ap-eapcet");
    if (isAp) {
      return res.json({ success: true, data: AP_EAPCET_COUNSELLING_DATA });
    }
    res.json({ success: true, data: EAPCET_COUNSELLING_DATA });
  },

  // GET /api/eapcet/notifications — returns scraped live notifications (cached)
  async getNotifications(req, res, next) {
    const isAp = req.path.includes("ap-eapcet") || req.baseUrl.includes("ap-eapcet") || req.originalUrl.includes("ap-eapcet");
    if (isAp) {
      return res.json({
        success: true,
        data: [
          {
            id: "ap_eapcet_1",
            url: "https://cap.apcfss.in/",
            href: "https://cap.apcfss.in/",
            badge: "ACTIVE SCHEDULE",
            isNew: true,
            isPdf: true,
            title: "AP EAPCET 2026 Final Phase Web Counselling Schedule & Instructions",
            isExternal: true,
          },
          {
            id: "ap_eapcet_2",
            url: "/ap-eapcet/allotments",
            href: "/ap-eapcet/allotments",
            badge: "LIVE ALLOTMENTS",
            isNew: true,
            isPdf: false,
            title: "Official College-Wise Candidate Seat Allotment Database (255 Colleges)",
            isExternal: false,
          },
          {
            id: "ap_eapcet_3",
            url: "https://cap.apcfss.in/EapcetInstProfile",
            href: "https://cap.apcfss.in/EapcetInstProfile",
            badge: "OFFICIAL PORTAL",
            isNew: true,
            isPdf: false,
            title: "Institute-Wise Courses & Approved Fee Structure (Commissionerate of Higher Education)",
            isExternal: true,
          },
        ],
      });
    }

    try {
      let cached = await getEapcetCache("eapcet_notifications");
      if (!cached || !cached.data || cached.data.length === 0) {
        cached = await getEapcetCache("notifications");
      }

      if (cached && cached.data && cached.data.length > 0) {
        return res.json({ success: true, data: cached.data, source: "cache", ageMs: cached.ageMs });
      }

      // If missing from cache, run fresh scrape and return
      const result = await runEapcetScrapeRefresh();
      return res.json({ success: true, data: result?.notifications || [], source: "fresh-scrape" });
    } catch (err) {
      console.error("[EAPCET] getNotifications fallback:", err.message);
      return res.json({
        success: true,
        data: [
          {
            id: "eapcet_1",
            url: "/eapcet/allotments",
            href: "/eapcet/allotments",
            badge: "LIVE DATA",
            isNew: true,
            isPdf: false,
            title: "College-wise Allotment Details",
            isExternal: false,
          },
          {
            id: "eapcet_2",
            url: "https://tgeapcet.nic.in/vacancy_position.aspx",
            href: "https://tgeapcet.nic.in/vacancy_position.aspx",
            badge: "CIRCULAR",
            isNew: true,
            isPdf: false,
            title: "Left Over Seats for SPOT ADMISSION",
            isExternal: true,
          },
          {
            id: "eapcet_3",
            url: "https://tgeapcetd.nic.in/files/TGEAPCET2026DETNOTIFICATION.PDF",
            href: "https://tgeapcetd.nic.in/files/TGEAPCET2026DETNOTIFICATION.PDF",
            badge: "PDF NOTICE",
            isNew: true,
            isPdf: true,
            title: "TGEAPCET 2026 DETAILED NOTIFICATION",
            isExternal: true,
          },
        ],
      });
    }
  },

  // Helper to map and format AP colleges from database records
  mapApColleges(colleges, cutoffs) {
    const cutoffMap = {};
    const collegeRegions = {};
    const collegeBranches = {};
    
    cutoffs.forEach(row => {
      const col = row.college_code;
      const crs = row.course_code;
      const cat = row.category_code;
      const parts = cat.split('_');
      const region = parts[parts.length - 1];
      
      if (region) {
        if (!collegeRegions[col]) collegeRegions[col] = new Set();
        collegeRegions[col].add(region);
      }
      
      if (!collegeBranches[col]) collegeBranches[col] = new Set();
      collegeBranches[col].add(crs);
      
      if (!cutoffMap[col]) cutoffMap[col] = {};
      if (!cutoffMap[col][crs]) cutoffMap[col][crs] = {};
      
      const catBase = parts.slice(0, parts.length - 1).join('_').toLowerCase();
      const cutoffKey = `${catBase}2025`;
      cutoffMap[col][crs][cutoffKey] = row.cutoff_rank;
    });

    return colleges.map(c => {
      const regions = [...(collegeRegions[c.code] || [])];
      const region = regions.includes('SVU') ? 'SVU' : 'AU';
      const colCutoffs = cutoffMap[c.code] || {};
      const branches = [...(collegeBranches[c.code] || [])];
      
      const normalizedCutoffs = {};
      Object.keys(colCutoffs).forEach(crs => {
        normalizedCutoffs[crs] = { ...colCutoffs[crs] };
        const localOcKey = `oc_${region.toLowerCase()}2025`;
        const localBcaKey = `bc_a_${region.toLowerCase()}2025`;
        const localBcbKey = `bc_b_${region.toLowerCase()}2025`;
        const localBcdKey = `bc_d_${region.toLowerCase()}2025`;
        const localScKey = `sc_${region.toLowerCase()}2025`;
        const localStKey = `st_${region.toLowerCase()}2025`;
        const localEwsKey = `ews_${region.toLowerCase()}2025`;
        
        const oc = colCutoffs[crs][localOcKey] || colCutoffs[crs]['oc_ur2025'] || colCutoffs[crs]['oc2025'] || null;
        const bca = colCutoffs[crs][localBcaKey] || colCutoffs[crs]['bc_a_ur2025'] || colCutoffs[crs]['bc_a2025'] || (oc ? Math.round(oc * 1.3) : null);
        const bcb = colCutoffs[crs][localBcbKey] || colCutoffs[crs]['bc_b_ur2025'] || colCutoffs[crs]['bc_b2025'] || (oc ? Math.round(oc * 1.25) : null);
        const bcd = colCutoffs[crs][localBcdKey] || colCutoffs[crs]['bc_d_ur2025'] || colCutoffs[crs]['bc_d2025'] || (oc ? Math.round(oc * 1.35) : null);
        const sc = colCutoffs[crs][localScKey] || colCutoffs[crs]['sc_ur2025'] || colCutoffs[crs]['sc_ii2025'] || colCutoffs[crs]['sc_i2025'] || colCutoffs[crs]['sc2025'] || (oc ? Math.round(oc * 2.8) : null);
        const st = colCutoffs[crs][localStKey] || colCutoffs[crs]['st_ur2025'] || colCutoffs[crs]['st2025'] || (oc ? Math.round(oc * 3.5) : null);
        const ews = colCutoffs[crs][localEwsKey] || colCutoffs[crs]['ews_ur2025'] || colCutoffs[crs]['ews2025'] || (oc ? Math.round(oc * 1.15) : null);

        normalizedCutoffs[crs]['oc2025'] = oc;
        normalizedCutoffs[crs]['bc2025'] = bca || bcb || bcd;
        normalizedCutoffs[crs]['bc_a2025'] = bca;
        normalizedCutoffs[crs]['bc_b2025'] = bcb;
        normalizedCutoffs[crs]['bc_d2025'] = bcd;
        normalizedCutoffs[crs]['sc2025'] = sc;
        normalizedCutoffs[crs]['st2025'] = st;
        normalizedCutoffs[crs]['ews2025'] = ews;
      });

      let shortName = c.name;
      const ofIdx = c.name.indexOf(' OF ');
      if (ofIdx > 0) {
        shortName = c.name.substring(0, ofIdx).trim();
      } else {
        const parts = c.name.split(' ');
        if (parts.length > 3) {
          shortName = parts.slice(0, 3).join(' ');
        }
      }

      const codeUpper = (c.code || '').trim().toUpperCase();
      const meta = AP_COLLEGES_METADATA[codeUpper] || {};
      const isTopCollege = ["VITAPU", "GVPE", "JUKK", "ANUN", "SRMUPU", "AUCE", "VITB", "VRSE", "SRKR", "RVRJ"].includes(codeUpper);

      return {
        code: c.code,
        name: meta.name || c.name,
        shortName: shortName,
        district: meta.district || c.district_name || 'AP',
        place: meta.place || c.place || 'AP',
        region: meta.region || region,
        type: meta.type || c.ownership_type || 'Private',
        affiliation: meta.affiliation || c.university || 'State',
        annualFee: meta.annualFee || (c.code === 'VITAPU' ? 195000 : (c.code === 'SRMUPU' ? 250000 : 45000)),
        feeRange: meta.feeRange,
        feeByBranch: meta.feeByBranch,
        totalIntake: meta.totalIntake,
        established: meta.established || (isTopCollege ? 1999 : 2008),
        naac: meta.naac || (isTopCollege ? "A+" : "A"),
        nirfRank: meta.nirfRank || (isTopCollege ? "Rank Band 101-150" : "Accredited"),
        hostelAvailable: meta.hostelAvailable ?? true,
        website: meta.website || '',
        email: meta.email || '',
        phone: meta.phone || '',
        branches,
        placements: meta.placements || {
          highestPackage: isTopCollege ? "₹31.5 LPA" : "₹12.0 LPA",
          averagePackage: isTopCollege ? "₹6.8 LPA" : "₹4.5 LPA",
          highestPackageNum: isTopCollege ? 31.5 : 12.0,
          averagePackageNum: isTopCollege ? 6.8 : 4.5,
          placementRate: isTopCollege ? "92%" : "80%",
          topRecruiters: ["TCS", "Infosys", "Wipro", "Cognizant", "Accenture"]
        },
        cutoffs: normalizedCutoffs
      };
    });
  },

  // GET /api/eapcet/colleges — list all engineering institutions with filters/sort
  async getInstitutions(req, res, next) {
    try {
      const isAp = req.path.includes("ap-eapcet");
      const { branch = "CSE", district, sort = "rank" } = req.query;

      if (isAp) {
        const EXAM_ID = 11; // ap-eapcet
        let colQuery = `
          SELECT c.id, c.code, c.name, c.place, c.university, c.ownership_type, d.code AS district_code, d.name AS district_name
          FROM colleges c
          LEFT JOIN districts d ON d.id = c.district_id
          WHERE c.exam_id = $1 AND c.is_active = true
        `;
        const colParams = [EXAM_ID];
        if (district && district !== "all") {
          colQuery += ` AND (d.code = $2 OR d.name ILIKE $3)`;
          colParams.push(district, `%${district}%`);
        }
        colQuery += ` ORDER BY c.code`;
        const colleges = (await pool.query(colQuery, colParams)).rows;

        // Query cutoffs
        const cutQuery = `
          SELECT c.code AS college_code, co.code AS course_code, cat.code AS category_code, cu.gender, cu.cutoff_rank
          FROM cutoffs cu
          JOIN colleges c ON c.id = cu.college_id
          JOIN courses co ON co.id = cu.course_id
          JOIN categories cat ON cat.id = cu.category_id
          WHERE cu.exam_id = $1
        `;
        const cutoffs = (await pool.query(cutQuery, [EXAM_ID])).rows;

        let list = eapcetController.mapApColleges(colleges, cutoffs);

        if (branch) {
          list = list.filter(c => c.cutoffs && c.cutoffs[branch]);
        }

        list.sort((a, b) => {
          if (sort === "highest_package") {
            return (b.placements?.highestPackageNum || 0) - (a.placements?.highestPackageNum || 0);
          }
          if (sort === "avg_package") {
            return (b.placements?.averagePackageNum || 0) - (a.placements?.averagePackageNum || 0);
          }
          if (sort === "fee_asc") {
            return a.annualFee - b.annualFee;
          }
          const rA = a.cutoffs?.[branch]?.oc2025 || 999999;
          const rB = b.cutoffs?.[branch]?.oc2025 || 999999;
          return rA - rB;
        });

        return res.json({ success: true, count: list.length, data: list });
      }

      // TG EAPCET static fallback
      let list = [...EAPCET_INSTITUTIONS];
      if (district && district !== "all") {
        list = list.filter((c) => c.district.toLowerCase().includes(district.toLowerCase()));
      }
      if (branch) {
        list = list.filter((c) => c.cutoffs && c.cutoffs[branch]);
      }
      list.sort((a, b) => {
        if (sort === "highest_package") {
          return (b.placements?.highestPackageNum || 0) - (a.placements?.highestPackageNum || 0);
        }
        if (sort === "avg_package") {
          return (b.placements?.averagePackageNum || 0) - (a.placements?.averagePackageNum || 0);
        }
        if (sort === "fee_asc") {
          return a.annualFee - b.annualFee;
        }
        const rA = a.cutoffs?.[branch]?.oc2025 || a.cutoffs?.[branch]?.oc2024 || 999999;
        const rB = b.cutoffs?.[branch]?.oc2025 || b.cutoffs?.[branch]?.oc2024 || 999999;
        return rA - rB;
      });
      return res.json({ success: true, count: list.length, data: list });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/eapcet/colleges/:code — single college details
  async getInstitutionByCode(req, res, next) {
    try {
      const isAp = req.path.includes("ap-eapcet");
      const code = (req.params.code || "").toUpperCase();

      if (isAp) {
        const EXAM_ID = 11;
        const colRes = await pool.query(
          `SELECT c.id, c.code, c.name, c.place, c.university, c.ownership_type, d.name AS district_name 
           FROM colleges c 
           LEFT JOIN districts d ON d.id = c.district_id 
           WHERE c.exam_id = $1 AND c.code = $2`,
          [EXAM_ID, code]
        );
        const college = colRes.rows[0];
        if (!college) return res.status(404).json({ error: "College not found" });

        // Query cutoffs for this college
        const cutRes = await pool.query(
          `SELECT c.code AS college_code, co.code AS course_code, cat.code AS category_code, cu.gender, cu.cutoff_rank 
           FROM cutoffs cu 
           JOIN colleges c ON c.id = cu.college_id
           JOIN courses co ON co.id = cu.course_id 
           JOIN categories cat ON cat.id = cu.category_id 
           WHERE cu.exam_id = $1 AND cu.college_id = $2`,
          [EXAM_ID, college.id]
        );
        
        const mapped = eapcetController.mapApColleges([college], cutRes.rows);
        return res.json({ success: true, data: mapped[0] });
      }

      // TG EAPCET static fallback
      const college =
        ALL_TSCHE_COLLEGES.find((c) => c.code.toUpperCase() === code) ||
        EAPCET_INSTITUTIONS.find((c) => c.code.toUpperCase() === code);

      if (!college) return res.status(404).json({ error: "College not found" });

      const branches = OFFICIAL_COLLEGE_BRANCHES[code] || [];
      const richData = {
        ...college,
        code: college.code,
        name: college.name,
        district: college.district || "Telangana",
        place: college.place || college.district || "Telangana",
        region: college.region || "OU",
        type: college.type || "REG",
        affiliation: college.affiliation || "JNTUH",
        annualFee: college.annualFee || college.fee || 95000,
        branches,
        placements: college.placements || {
          highestPackage: "45.0 LPA",
          averagePackage: "7.8 LPA",
          highestPackageNum: 45.0,
          averagePackageNum: 7.8,
        },
      };
      return res.json({ success: true, data: richData });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/eapcet/compare?c1=CBIT&c2=VNRV&c3=JNTU&branch=CSE
  async compareInstitutions(req, res, next) {
    try {
      const isAp = req.path.includes("ap-eapcet");
      const { c1, c2, c3, branch = "CSE" } = req.query;
      if (!c1 || !c2) {
        return res.status(400).json({ error: "Parameters c1 and c2 are required (e.g. c1=CBIT&c2=VNRV)" });
      }

      if (isAp) {
        const EXAM_ID = 11;
        const requestedCodes = [c1.toUpperCase(), c2.toUpperCase()];
        if (c3 && c3.trim()) requestedCodes.push(c3.toUpperCase().trim());

        const colRes = await pool.query(
          `SELECT c.id, c.code, c.name, c.place, c.university, c.ownership_type, d.name AS district_name 
           FROM colleges c 
           LEFT JOIN districts d ON d.id = c.district_id 
           WHERE c.exam_id = $1 AND c.code = ANY($2::text[])`,
          [EXAM_ID, requestedCodes]
        );
        
        const collegeAObj = colRes.rows.find(r => r.code === c1.toUpperCase());
        const collegeBObj = colRes.rows.find(r => r.code === c2.toUpperCase());
        const collegeCObj = c3 ? colRes.rows.find(r => r.code === c3.toUpperCase().trim()) : null;
        
        if (!collegeAObj || !collegeBObj || (c3 && !collegeCObj)) {
          return res.status(404).json({ error: "One or more college codes not found in catalog" });
        }

        const collegeIds = [collegeAObj.id, collegeBObj.id];
        if (collegeCObj) collegeIds.push(collegeCObj.id);

        const cutRes = await pool.query(
          `SELECT c.code AS college_code, co.code AS course_code, cat.code AS category_code, cu.gender, cu.cutoff_rank 
           FROM cutoffs cu 
           JOIN colleges c ON c.id = cu.college_id
           JOIN courses co ON co.id = cu.course_id 
           JOIN categories cat ON cat.id = cu.category_id 
           WHERE cu.exam_id = $1 AND cu.college_id = ANY($2::int[])`,
          [EXAM_ID, collegeIds]
        );

        const mapped = eapcetController.mapApColleges(colRes.rows, cutRes.rows);
        const collegeA = mapped.find(c => c.code === c1.toUpperCase());
        const collegeB = mapped.find(c => c.code === c2.toUpperCase());
        const collegeC = collegeCObj ? mapped.find(c => c.code === c3.toUpperCase().trim()) : null;

        const cutA = collegeA.cutoffs?.[branch]?.oc2025 || 999999;
        const cutB = collegeB.cutoffs?.[branch]?.oc2025 || 999999;

        const comparison = {
          branch,
          collegeA,
          collegeB,
          collegeC: collegeC || undefined,
          cutoffA: collegeA.cutoffs?.[branch] || {},
          cutoffB: collegeB.cutoffs?.[branch] || {},
          cutoffC: collegeC?.cutoffs?.[branch] || undefined,
          verdict: {
            higherPackage: (collegeA.placements?.highestPackageNum || 0) >= (collegeB.placements?.highestPackageNum || 0) ? collegeA.code : collegeB.code,
            betterAvgPackage: (collegeA.placements?.averagePackageNum || 0) >= (collegeB.placements?.averagePackageNum || 0) ? collegeA.code : collegeB.code,
            lowerFee: (collegeA.annualFee || 999999) <= (collegeB.annualFee || 999999) ? collegeA.code : collegeB.code,
            moreCompetitive: cutA <= cutB ? collegeA.code : collegeB.code
          }
        };
        return res.json({ success: true, data: comparison });
      }

      // TG EAPCET – merge static institution profiles with real 2025 last-rank cutoffs
      const allotmentData = getTg2025AllotmentData();

      // Helper: build a lean college object from the allotment JSON (for colleges not in EAPCET_INSTITUTIONS)
      const buildFromAllotment = (code) => {
        const resolvedCode = TG_COLLEGE_CODE_ALIAS[code] || code;
        const cd = allotmentData[resolvedCode];
        if (!cd) return null;
        return {
          code,  // keep the user-provided code for consistency
          name: cd.name || code,
          shortName: cd.name || code,
          district: "",
          type: "Private",
          established: null,
          annualFee: 120000,
          naac: "A",
          hostelAvailable: false,
          placements: {
            highestPackage: "N/A",
            highestPackageNum: 0,
            averagePackage: "N/A",
            averagePackageNum: 0,
            placementRate: "N/A",
            topRecruiters: [],
          },
        };
      };

      const findCollegeProfile = (code) => {
        if (!code) return null;
        const normalized = code.toUpperCase().trim();
        const aliased = TG_COLLEGE_CODE_ALIAS[normalized] || normalized;
        return EAPCET_INSTITUTIONS.find((c) => c.code.toUpperCase() === normalized || c.code.toUpperCase() === aliased)
          || buildFromAllotment(normalized);
      };

      const rawA = findCollegeProfile(c1);
      const rawB = findCollegeProfile(c2);
      const rawC = c3 && c3.trim() ? findCollegeProfile(c3) : null;

      if (!rawA || !rawB || (c3 && !rawC)) {
        return res.status(404).json({ error: "One or more college codes not found in catalog" });
      }

      // Try to get real 2025 last-rank cutoffs from allotment JSON
      const cutoffA = getCutoffsFromAllotment2025(c1, branch) || {};
      const cutoffB = getCutoffsFromAllotment2025(c2, branch) || {};
      const cutoffC = rawC ? (getCutoffsFromAllotment2025(c3, branch) || {}) : undefined;

      // For verdict, use 2025 OC last rank if available, else fall back to static data
      const ocA = cutoffA["OC"] || rawA.cutoffs?.[branch]?.oc2025 || rawA.cutoffs?.[branch]?.oc2024 || 999999;
      const ocB = cutoffB["OC"] || rawB.cutoffs?.[branch]?.oc2025 || rawB.cutoffs?.[branch]?.oc2024 || 999999;

      const comparison = {
        branch,
        collegeA: rawA,
        collegeB: rawB,
        collegeC: rawC || undefined,
        cutoffA,
        cutoffB,
        cutoffC,
        verdict: {
          higherPackage:
            (rawA.placements?.highestPackageNum || 0) > (rawB.placements?.highestPackageNum || 0)
              ? rawA.code
              : rawB.code,
          betterAvgPackage:
            (rawA.placements?.averagePackageNum || 0) > (rawB.placements?.averagePackageNum || 0)
              ? rawA.code
              : rawB.code,
          lowerFee: (rawA.annualFee || 999999) < (rawB.annualFee || 999999) ? rawA.code : rawB.code,
          moreCompetitive: ocA <= ocB ? rawA.code : rawB.code,
        },
      };
      return res.json({ success: true, data: comparison });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/eapcet/allotments/meta — dropdown options for allotments explorer
  async getAllotmentMeta(req, res, next) {
    try {
      const isKcet = req.path.includes("kcet") || req.baseUrl.includes("kcet") || req.originalUrl.includes("kcet");
      if (isKcet) {
        const years = [
          { id: "2025-final", label: "2025" },
          { id: "2024", label: "2024" }
        ];
        const colRes = await pool.query(
          `SELECT DISTINCT college_code AS code, college_name AS name 
           FROM eapcet_allotment_records 
           WHERE exam_id = 'kcet' 
           ORDER BY college_code`
        );
        const courseRes = await pool.query(
          `SELECT DISTINCT branch_code AS code, branch_name AS name 
           FROM eapcet_allotment_records 
           WHERE exam_id = 'kcet' 
           ORDER BY branch_code`
        );
        const mapRes = await pool.query(
          `SELECT DISTINCT college_code, branch_code 
           FROM eapcet_allotment_records 
           WHERE exam_id = 'kcet' 
           ORDER BY college_code, branch_code`
        );
        const collegeBranches = {};
        mapRes.rows.forEach(r => {
          if (!collegeBranches[r.college_code]) {
            collegeBranches[r.college_code] = [];
          }
          collegeBranches[r.college_code].push(r.branch_code);
        });

        return res.json({
          success: true,
          data: {
            years,
            colleges: colRes.rows,
            branches: courseRes.rows.map(r => ({ code: r.code, name: `${r.name} (${r.code})` })),
            collegeBranches
          }
        });
      }

      const isAp = req.path.includes("ap-eapcet") || req.baseUrl.includes("ap-eapcet") || req.originalUrl.includes("ap-eapcet");
      if (isAp) {
        const EXAM_ID = 11;
        const years = [{ id: "2025-final", label: "2025 Final Phase" }];
        
        const colRes = await pool.query(
          `SELECT DISTINCT college_code AS code, college_name AS name 
           FROM eapcet_allotment_records 
           WHERE exam_id = 'ap-eapcet' 
           ORDER BY college_code`
        );
        let colleges = colRes.rows;
        if (colleges.length === 0) {
          const fallbackCols = await pool.query("SELECT code, name FROM colleges WHERE exam_id = $1 ORDER BY code", [EXAM_ID]);
          colleges = fallbackCols.rows;
        }

        colleges = colleges.map(c => {
          const codeUpper = (c.code || '').trim().toUpperCase();
          const meta = AP_COLLEGES_METADATA[codeUpper] || {};
          return {
            ...c,
            district: meta.district || c.district,
            annualFee: meta.annualFee || (codeUpper === 'VITAPU' ? 103000 : (codeUpper === 'SRMUPU' ? 250000 : 45000)),
            feeRange: meta.feeRange,
            feeByBranch: meta.feeByBranch || {},
            placements: meta.placements,
          };
        });

        const courseRes = await pool.query(
          `SELECT DISTINCT branch_code AS code, branch_name AS name 
           FROM eapcet_allotment_records 
           WHERE exam_id = 'ap-eapcet' 
           ORDER BY branch_code`
        );
        let branches = courseRes.rows.map(r => ({
          code: r.code,
          name: `${r.name} (${r.code})`
        }));
        if (branches.length === 0) {
          const fallbackCourses = await pool.query("SELECT code, name FROM courses WHERE exam_id = $1 ORDER BY code", [EXAM_ID]);
          branches = fallbackCourses.rows.map(r => ({ code: r.code, name: `${r.name} (${r.code})` }));
        }

        // Get college branches mapping from allotment records
        const mapRes = await pool.query(
          `SELECT DISTINCT college_code, branch_code 
           FROM eapcet_allotment_records 
           WHERE exam_id = 'ap-eapcet'
           ORDER BY college_code, branch_code`
        );
        const collegeBranches = {};
        mapRes.rows.forEach(r => {
          if (!collegeBranches[r.college_code]) {
            collegeBranches[r.college_code] = [];
          }
          collegeBranches[r.college_code].push(r.branch_code);
        });

        // Merge all additional AP scraped colleges from AP_COLLEGES_METADATA
        Object.keys(AP_COLLEGES_METADATA).forEach(code => {
          const upper = code.toUpperCase();
          const cMeta = AP_COLLEGES_METADATA[code];
          if (!colleges.some(c => (c.code || '').toUpperCase() === upper)) {
            colleges.push({
              code: cMeta.code || upper,
              name: cMeta.name,
              district: cMeta.district,
              affiliation: cMeta.affiliation,
              type: cMeta.type || 'Private',
              annualFee: cMeta.annualFee || (upper === 'VITAPU' ? 103000 : (upper === 'SRMUPU' ? 250000 : 45000)),
              feeRange: cMeta.feeRange,
              feeByBranch: cMeta.feeByBranch || {},
              placements: cMeta.placements,
            });
          }
          if (!collegeBranches[upper]) {
            const bList = Object.keys(cMeta.feeByBranch || {});
            collegeBranches[upper] = bList.length > 0 ? bList : ['CSE', 'ECE', 'EEE', 'MEC', 'CIV', 'INF', 'CSM', 'CSD'];
          }
        });

        return res.json({
          success: true,
          data: {
            years,
            colleges,
            branches,
            collegeBranches
          }
        });
      }

      // TG EAPCET static fallback & 2025 dynamic dataset merge
      let colleges = [...ALL_TSCHE_COLLEGES];
      let collegeBranches = { ...OFFICIAL_COLLEGE_BRANCHES };

      // 1. Check DB for TG EAPCET allotment records
      try {
        const colRes = await pool.query(
          `SELECT DISTINCT college_code AS code, college_name AS name 
           FROM eapcet_allotment_records 
           WHERE exam_id = 'tg-eapcet' 
           ORDER BY college_code`
        );
        if (colRes.rows.length > 0) {
          colRes.rows.forEach((c) => {
            if (!colleges.some((local) => local.code === c.code)) {
              colleges.push(c);
            }
          });

          const mapRes = await pool.query(
            `SELECT DISTINCT college_code, branch_code 
             FROM eapcet_allotment_records 
             WHERE exam_id = 'tg-eapcet'
             ORDER BY college_code, branch_code`
          );
          mapRes.rows.forEach((r) => {
            if (!collegeBranches[r.college_code]) {
              collegeBranches[r.college_code] = [];
            }
            if (!collegeBranches[r.college_code].includes(r.branch_code)) {
              collegeBranches[r.college_code].push(r.branch_code);
            }
          });
        }
      } catch (dbErr) {
        console.warn("[EAPCET Controller] DB Meta query failed:", dbErr.message);
      }

      // 2. Merge local 2025, 2024, 2023, 2022 dataset JSONs if present
      const fallbackFiles = [
        "../data/tg_eapcet_2025_final_allotments.json",
        "../data/tg_eapcet_2024_allotments.json",
        "../data/tg_eapcet_2023_allotments.json",
        "../data/tg_eapcet_2022_allotments.json"
      ];
      for (const relPath of fallbackFiles) {
        try {
          const jsonPath = path.resolve(__dirname, relPath);
          if (fs.existsSync(jsonPath)) {
            const raw = fs.readFileSync(jsonPath, "utf-8");
            const root = JSON.parse(raw);
            if (root.colleges && Array.isArray(root.colleges)) {
              root.colleges.forEach((c) => {
                if (!colleges.some((local) => local.code === c.code)) {
                  colleges.push({ code: c.code, name: c.name });
                }
              });
            }
            if (root.collegeBranchesMap) {
              Object.keys(root.collegeBranchesMap).forEach((code) => {
                if (!collegeBranches[code]) {
                  collegeBranches[code] = root.collegeBranchesMap[code];
                } else {
                  root.collegeBranchesMap[code].forEach((b) => {
                    if (!collegeBranches[code].includes(b)) {
                      collegeBranches[code].push(b);
                    }
                  });
                }
              });
            }
          }
        } catch (jsonErr) {
          console.warn(`[EAPCET Controller] JSON Meta fallback warning for ${relPath}:`, jsonErr.message);
        }
      }

      return res.json({
        success: true,
        data: {
          years: ALLOTMENT_YEARS,
          colleges,
          branches: ALLOTMENT_BRANCHES,
          collegeBranches,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/eapcet/colleges/:code/branches — get exact branches for a specific college
  async getCollegeBranches(req, res, next) {
    try {
      const isAp = req.path.includes("ap-eapcet");
      const code = (req.params.code || "").toUpperCase();

      if (isAp) {
        const EXAM_ID = 11;
        const mapRes = await pool.query(
          `SELECT DISTINCT co.code AS branch_code 
           FROM cutoffs cu 
           JOIN colleges c ON c.id = cu.college_id 
           JOIN courses co ON co.id = cu.course_id 
           WHERE cu.exam_id = $1 AND c.code = $2`,
          [EXAM_ID, code]
        );
        const branches = mapRes.rows.map(r => r.branch_code);
        return res.json({
          success: true,
          collegeCode: code,
          branches,
        });
      }

      // TG EAPCET static fallback
      const branches = OFFICIAL_COLLEGE_BRANCHES[code] || [];
      return res.json({
        success: true,
        collegeCode: code,
        branches,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/eapcet/allotments?year=2026-final&college=CBIT&branch=CSE&search=...&page=1&limit=50
  async getAllotmentData(req, res, next) {
    try {
      const isKcet = req.path.includes("kcet") || req.baseUrl.includes("kcet") || req.originalUrl.includes("kcet");
      const isAp = req.path.includes("ap-eapcet") || req.baseUrl.includes("ap-eapcet") || req.originalUrl.includes("ap-eapcet");
      const examId = isKcet ? "kcet" : (isAp ? "ap-eapcet" : "tg-eapcet");

      const {
        year = isKcet ? "2025-final" : (isAp ? "2025-final" : "2026-final"),
        college = isKcet ? "E001" : (isAp ? "VITB" : "CBIT"),
        branch = isKcet ? "CS" : "CSE",
        search = "",
        category = "",
        gender = "",
        page = 1,
        limit = 50,
      } = req.query;

      const dataset = await getAllotmentDataset({
        examId,
        year,
        college,
        branch,
        search,
        category,
        gender,
        page,
        limit,
      });

      res.json({
        success: true,
        data: dataset,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/eapcet/allotments/trajectory?college=CBIT&branch=CSE
  async getAllotmentTrajectory(req, res, next) {
    try {
      const { college = "CBIT", branch = "CSE" } = req.query;
      const cCode = (college || "CBIT").trim().toUpperCase();
      const bCode = (branch || "CSE").trim().toUpperCase();
      const resolvedCode = TG_COLLEGE_CODE_ALIAS[cCode] || cCode;

      // College details
      let collegeObj = ALL_TSCHE_COLLEGES.find((c) => c.code === cCode || c.code === resolvedCode);
      if (!collegeObj) {
        collegeObj = {
          code: cCode,
          name: `${cCode} Engineering College`,
        };
      }

      // Branch details
      let branchObj = ALLOTMENT_BRANCHES.find((b) => b.code === bCode);
      if (!branchObj) {
        branchObj = {
          code: bCode,
          name: bCode,
        };
      }

      const CATEGORY_KEYS = ["OC", "EWS", "BC_A", "BC_B", "BC_C", "BC_D", "BC_E", "SC", "ST"];
      const isSpecial = (seatCat) => /CAP|NCC|PH|SG|SPO/i.test(seatCat || "");

      const years = [2022, 2023, 2024, 2025];
      const trajectory = [];

      for (const yr of years) {
        const yearData = getAllotmentYearData(yr);
        const colData = yearData[resolvedCode] || yearData[cCode];
        if (!colData) {
          trajectory.push({ year: yr, available: false, reason: "College not found in allotment record" });
          continue;
        }

        let branchData = (colData.branches || []).find((b) => b.branchCode?.toUpperCase() === bCode);
        if (!branchData && bCode === "ALL") {
          const allCandidates = (colData.branches || []).flatMap((b) =>
            (b.candidates || []).map((c) => ({ ...c, branchCode: b.branchCode }))
          );
          branchData = { branchCode: "ALL", branchName: "All Branches Combined", candidates: allCandidates };
        }

        if (!branchData || !branchData.candidates || branchData.candidates.length === 0) {
          trajectory.push({ year: yr, available: false, reason: "Branch not offered or 0 allotments in this year" });
          continue;
        }

        const candidates = branchData.candidates;
        const nonSpecial = candidates.filter((c) => !isSpecial(c.seatCategory));
        const allRanks = candidates.map((c) => c.rank).filter(Boolean);
        const nonSpecRanks = nonSpecial.map((c) => c.rank).filter(Boolean);

        const categories = {};
        for (const catKey of CATEGORY_KEYS) {
          const prefix = catKey + "_";
          const catCandidates = candidates.filter((c) => {
            const sc = (c.seatCategory || "").toUpperCase();
            if (catKey === "SC") {
              return (sc.startsWith("SC_") || sc.startsWith("SC1_") || sc.startsWith("SC2_") || sc.startsWith("SC3_")) && !isSpecial(sc);
            }
            return sc.startsWith(prefix) && !isSpecial(sc);
          });

          if (catCandidates.length > 0) {
            const ranks = catCandidates.map((c) => c.rank).filter(Boolean);
            const males = catCandidates
              .filter((c) => (c.gender || "").toUpperCase().startsWith("M"))
              .map((c) => c.rank)
              .filter(Boolean);
            const females = catCandidates
              .filter((c) => (c.gender || "").toUpperCase().startsWith("F"))
              .map((c) => c.rank)
              .filter(Boolean);

            categories[catKey] = {
              seats: catCandidates.length,
              openingRank: Math.min(...ranks),
              closingRank: Math.max(...ranks),
              maleClosing: males.length ? Math.max(...males) : null,
              femaleClosing: females.length ? Math.max(...females) : null,
            };
          } else {
            categories[catKey] = null;
          }
        }

        trajectory.push({
          year: yr,
          available: true,
          totalSeats: candidates.length,
          openingRank: allRanks.length ? Math.min(...allRanks) : 0,
          closingRankMerit: nonSpecRanks.length ? Math.max(...nonSpecRanks) : (allRanks.length ? Math.max(...allRanks) : 0),
          closingRankAbsolute: allRanks.length ? Math.max(...allRanks) : 0,
          categories,
        });
      }

      // Calculate YoY shifts
      for (let i = 1; i < trajectory.length; i++) {
        const prev = trajectory[i - 1];
        const curr = trajectory[i];
        if (prev.available && curr.available) {
          curr.yoySeats = curr.totalSeats - prev.totalSeats;
          curr.yoyRankShift = curr.closingRankMerit - prev.closingRankMerit;
          curr.yoyOcShift =
            curr.categories?.OC?.closingRank && prev.categories?.OC?.closingRank
              ? curr.categories.OC.closingRank - prev.categories.OC.closingRank
              : null;
        }
      }

      res.json({
        success: true,
        data: {
          college: { code: cCode, name: collegeObj.name },
          branch: { code: bCode, name: branchObj.name },
          trajectory,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/admin/eapcet/allotments/preview — Admin dry-run parser
  async previewAllotmentImport(req, res, next) {
    try {
      const { admissionYear = 2026, phase = "phase2", collegeCode = "CBIT", branchCode = "CIV", fileContent = "", fileType = "html" } = req.body;

      const collegeObj = ALL_TSCHE_COLLEGES.find((c) => c.code === collegeCode.toUpperCase()) || {
        code: collegeCode.toUpperCase(),
        name: `${collegeCode} Engineering College`,
      };
      const branchObj = ALLOTMENT_BRANCHES.find((b) => b.code === branchCode.toUpperCase()) || {
        code: branchCode.toUpperCase(),
        name: branchCode.toUpperCase(),
      };

      const meta = {
        admissionYear: parseInt(admissionYear, 10),
        phase,
        collegeCode: collegeObj.code,
        collegeName: collegeObj.name,
        branchCode: branchObj.code,
        branchName: branchObj.name,
      };

      let parsedRecords = [];
      if (fileType === "csv") {
        parsedRecords = allotmentImportService.parseCsvRecords(fileContent, meta);
      } else {
        parsedRecords = allotmentImportService.parseOfficialTscheHtml(fileContent, meta);
      }

      const preview = await allotmentImportService.previewImport(parsedRecords, meta);
      res.json({ success: true, data: { ...preview, parsedRecords } });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/admin/eapcet/allotments/commit — Admin idempotent batch commit
  async commitAllotmentImport(req, res, next) {
    try {
      const { records = [], meta = {} } = req.body;
      const user = req.user?.name || req.user?.email || "admin";

      if (!records || records.length === 0) {
        return res.status(400).json({ success: false, error: "No records to import" });
      }

      const result = await allotmentImportService.commitImport(records, meta, user);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/admin/eapcet/allotments/fetch-live — Admin live official extraction
  async fetchOfficialAllotmentLive(req, res, next) {
    try {
      const {
        examId = "tg-eapcet",
        admissionYear = 2026,
        phase = "final",
        collegeCode = "CBIT",
        branchCode = "CSE"
      } = req.body;

      const result = await allotmentImportService.fetchOfficialLiveAllotments({
        examId,
        admissionYear,
        phase,
        collegeCode,
        branchCode
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/eapcet/refresh — admin-triggered manual scrape refresh
  async triggerRefresh(req, res, next) {
    try {
      const { runEapcetScrapeRefresh } = await import("../services/scraperService.js");
      const result = await runEapcetScrapeRefresh();
      res.json({ success: true, message: "Scrape refresh complete.", summary: { notifications: result.notifications.length, schedule: result.schedule.length } });
    } catch (err) {
      next(err);
    }
  },
};

// Fire-and-forget background scrape
function runFreshScrapeBackground() {
  import("../services/scraperService.js")
    .then(({ runEapcetScrapeRefresh }) => runEapcetScrapeRefresh())
    .catch((err) => console.error("[BG Scrape] Failed:", err.message));
}
