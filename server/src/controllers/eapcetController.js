import { getEapcetCache, runEapcetScrapeRefresh } from "../services/scraperService.js";
import { EAPCET_INSTITUTIONS } from "../data/eapcetInstitutions.js";
import { ALL_TSCHE_COLLEGES } from "../data/allTscheInstitutions.js";
import { ALLOTMENT_YEARS, ALLOTMENT_BRANCHES, getAllotmentDataset } from "../services/allotmentService.js";
import { allotmentRepository } from "../repositories/allotmentRepository.js";
import { allotmentImportService } from "../services/allotmentImportService.js";
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
// Controller methods
// -----------------------------------------------------------------------
export const eapcetController = {
  // GET /api/eapcet/counselling-data — returns full static official data
  async getCounsellingData(req, res) {
    res.json({ success: true, data: EAPCET_COUNSELLING_DATA });
  },

  // GET /api/eapcet/notifications — returns scraped live notifications (cached)
  async getNotifications(req, res, next) {
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

  // GET /api/eapcet/colleges — list all engineering institutions with filters/sort
  async getInstitutions(req, res) {
    const { branch = "CSE", district, sort = "rank" } = req.query;
    let list = [...EAPCET_INSTITUTIONS];

    if (district && district !== "all") {
      list = list.filter((c) => c.district.toLowerCase().includes(district.toLowerCase()));
    }

    if (branch) {
      list = list.filter((c) => c.cutoffs && c.cutoffs[branch]);
    }

    // Sorting
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
      // default: cutoff rank for selected branch
      const rA = a.cutoffs?.[branch]?.oc2025 || a.cutoffs?.[branch]?.oc2024 || 999999;
      const rB = b.cutoffs?.[branch]?.oc2025 || b.cutoffs?.[branch]?.oc2024 || 999999;
      return rA - rB;
    });

    res.json({ success: true, count: list.length, data: list });
  },

  // GET /api/eapcet/colleges/:code — single college details
  async getInstitutionByCode(req, res) {
    const code = (req.params.code || "").toUpperCase();
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

    res.json({ success: true, data: richData });
  },

  // GET /api/eapcet/compare?c1=CBIT&c2=VNRV&branch=CSE
  async compareInstitutions(req, res) {
    const { c1, c2, branch = "CSE" } = req.query;
    if (!c1 || !c2) {
      return res.status(400).json({ error: "Parameters c1 and c2 are required (e.g. c1=CBIT&c2=VNRV)" });
    }

    const collegeA = EAPCET_INSTITUTIONS.find((c) => c.code.toUpperCase() === c1.toUpperCase());
    const collegeB = EAPCET_INSTITUTIONS.find((c) => c.code.toUpperCase() === c2.toUpperCase());

    if (!collegeA || !collegeB) {
      return res.status(404).json({ error: "One or both college codes not found in catalog" });
    }

    const comparison = {
      branch,
      collegeA,
      collegeB,
      verdict: {
        higherPackage:
          (collegeA.placements?.highestPackageNum || 0) > (collegeB.placements?.highestPackageNum || 0)
            ? collegeA.code
            : collegeB.code,
        betterAvgPackage:
          (collegeA.placements?.averagePackageNum || 0) > (collegeB.placements?.averagePackageNum || 0)
            ? collegeA.code
            : collegeB.code,
        lowerFee: collegeA.annualFee < collegeB.annualFee ? collegeA.code : collegeB.code,
        moreCompetitive:
          (collegeA.cutoffs?.[branch]?.oc2024 || 999999) < (collegeB.cutoffs?.[branch]?.oc2024 || 999999)
            ? collegeA.code
            : collegeB.code,
      },
    };

    res.json({ success: true, data: comparison });
  },

  // GET /api/eapcet/allotments/meta — dropdown options for allotments explorer
  async getAllotmentMeta(req, res) {
    res.json({
      success: true,
      data: {
        years: ALLOTMENT_YEARS,
        colleges: ALL_TSCHE_COLLEGES,
        branches: ALLOTMENT_BRANCHES,
        collegeBranches: OFFICIAL_COLLEGE_BRANCHES,
      },
    });
  },

  // GET /api/eapcet/colleges/:code/branches — get exact branches for a specific college
  async getCollegeBranches(req, res) {
    const code = (req.params.code || "").toUpperCase();
    const branches = OFFICIAL_COLLEGE_BRANCHES[code] || [];
    res.json({
      success: true,
      collegeCode: code,
      branches,
    });
  },

  // GET /api/eapcet/allotments?year=2026-final&college=CBIT&branch=CSE&search=...&page=1&limit=50
  async getAllotmentData(req, res, next) {
    try {
      const {
        year = "2026-final",
        college = "CBIT",
        branch = "CSE",
        search = "",
        category = "",
        gender = "",
        page = 1,
        limit = 50,
      } = req.query;

      const dataset = await getAllotmentDataset({
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
