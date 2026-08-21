import { getIcetScrapeData, runIcetScrapeRefresh } from "../services/icetScraperService.js";
import { ICET_INSTITUTIONS, ICET_PROGRAMS } from "../data/icetInstitutions.js";
import { scrapeOfficialTgIcetAllotment, scrapeOfficialTgIcetColleges } from "../services/tgIcetAllotmentScraper.js";

const ICET_COUNSELLING_DATA = {
  exam: "TG ICET",
  fullName: "Telangana State Integrated Common Entrance Test (MBA & MCA)",
  year: "2026",
  authority: "Telangana Council of Higher Education (TSCHE) & Kakatiya University",
  officialWebsite: "https://tgicet.nic.in/",

  // ── Phase-wise Master Schedule ────────────────────────────────────────
  phases: [
    {
      id: "phase1",
      label: "First Phase",
      badge: "Concluded",
      status: "concluded",
      steps: [
        { action: "Online Filing, Fee & Slot Booking", dates: "July 31 – August 05, 2026", status: "concluded" },
        { action: "Certificate Verification (Pre-booked slots at HLC)", dates: "August 01 – August 05, 2026", status: "concluded" },
        { action: "Exercising Web Options", dates: "August 03 – August 08, 2026", status: "concluded" },
        { action: "Freezing of Options", dates: "August 08, 2026", status: "concluded" },
        { action: "Phase I Provisional Seat Allotment", dates: "On or before August 11, 2026", status: "concluded" },
        { action: "Online Tuition Fee Payment & Self-Reporting", dates: "August 11 – August 14, 2026", status: "concluded" },
        { action: "Mandatory Physical Reporting at Allotted College", dates: "August 11 – August 14, 2026", status: "concluded" },
      ],
    },
    {
      id: "final",
      label: "Final Phase",
      badge: "Concluded",
      status: "concluded",
      constraint: "Candidates who voluntarily executed an online seat cancellation during Phase I are explicitly barred from participating in the Final Phase.",
      steps: [
        { action: "Online Filing, Fee & Slot Booking (Unverified Candidates)", dates: "August 17, 2026", status: "concluded" },
        { action: "Certificate Verification at HLC", dates: "August 18, 2026", status: "concluded" },
        { action: "Exercising Fresh Web Options (Mandatory)", dates: "August 18 – August 19, 2026", status: "concluded" },
        { action: "Freezing of Options", dates: "August 19, 2026", status: "concluded" },
        { action: "Provisional Seat Allotment", dates: "On or before August 22, 2026", status: "concluded" },
        { action: "Fee Payment & Online Self-Reporting", dates: "August 22 – August 24, 2026", status: "concluded" },
        { action: "Mandatory Physical Reporting at Allotted College", dates: "August 22 – August 25, 2026", status: "concluded" },
      ],
      logistics: {
        collegeUpgrade: "Reclaim Original T.C. from Phase I college → submit to newly allotted institution (August 22–25, 2026).",
        branchUpgrade: "Download updated allotment order, pay differential tuition fee, submit revised self-report online.",
      },
    },
    {
      id: "spot",
      label: "Special & Spot Round",
      badge: "Concluded",
      status: "concluded",
      steps: [
        { action: "Institutional Spot Admissions Guidelines Issue", dates: "August 24, 2026", status: "concluded" },
        { action: "Spot Admissions at Private Unaided MBA/MCA Colleges", dates: "August 25 – August 30, 2026", status: "concluded" },
        { action: "Institutional Spot Candidate List Submission to TSCHE", dates: "September 02, 2026", status: "concluded" },
      ],
    },
  ],

  // ── Admission Conditions & Binding Rules ──────────────────────────────
  conditions: [
    {
      id: "voluntary_cancellation",
      severity: "high",
      title: "Voluntary Seat Cancellation Bar",
      body: "Candidates who voluntarily cancel their allotted MBA/MCA seat in Phase I are strictly barred from participating in Final Phase web options.",
    },
    {
      id: "seat_supersession",
      severity: "high",
      title: "Seat Supersession Protocol",
      body: "If a candidate is allotted a higher preference seat in the Final Phase, the previous Phase-1 allotment is automatically and irrevocably vacated and transferred to the next merit candidate.",
    },
    {
      id: "income_cert_validity",
      severity: "medium",
      title: "Income Certificate Validity Rule",
      body: "For Tuition Fee Reimbursement (RTF/ePASS), MeeSeva income certificates MUST be issued on or after January 01, 2026. Certificates issued prior to Jan 1, 2026 will be rejected at HLC.",
    },
    {
      id: "special_hlc_reporting",
      severity: "medium",
      title: "Special Category Verification Centre",
      body: "PH (Physically Handicapped), CAP, NCC, and Sports category candidates must mandatorily report for verification only at the centralized Government Polytechnic, Masab Tank, Hyderabad HLC.",
    },
    {
      id: "local_area_quota",
      severity: "low",
      title: "Local Area Reservation Framework",
      body: "85% of MBA & MCA seats are reserved for local candidates belonging to the Osmania University (OU) / Kakatiya University (KU) jurisdiction; 15% are unreserved open merit seats.",
    },
    {
      id: "academic_commencement",
      severity: "low",
      title: "Class Commencement",
      body: "Regular MBA and MCA first-semester academic coursework commences across all affiliated university campuses and private colleges following Final Phase reporting.",
    },
  ],

  // ── Admission Criteria & Reservation Framework ────────────────────────
  eligibility: {
    academic: [
      "MBA Qualification: Recognized 3-Year Bachelor's Degree in any discipline (B.Com / B.Sc / B.A / BBA / B.Tech) with at least 50% aggregate marks (45% for SC, ST, BC).",
      "MCA Qualification: BCA / B.Sc / B.Com / B.A with Mathematics at 10+2 level or at Graduation level with at least 50% aggregate marks (45% for reserved categories).",
      "TG ICET Qualifying Cutoff: Minimum 25% (50 marks out of 200) for OC, BC, and EWS. No minimum qualifying score required for SC and ST candidates.",
      "Open University / Distance Degree: Must be recognized by UGC, AICTE, and Distance Education Bureau (DEB).",
      "Domicile & Jurisdiction: Candidate must be an Indian National and satisfy Telangana Local Status (85% OU / KU Region) or Non-Local Status (15% Unreserved).",
    ],
    fees: [
      { label: "Exam Registration Fee (OC / BC / EWS)", value: "₹750 (Online via Net Banking/UPI)" },
      { label: "Exam Registration Fee (SC / ST / PH)", value: "₹500 (Online via Net Banking/UPI)" },
      { label: "Counselling Processing Fee (OC / BC / EWS)", value: "₹1,200 (Online via Net Banking/UPI)" },
      { label: "Counselling Processing Fee (SC / ST)", value: "₹600 (Online via Net Banking/UPI)" },
      { label: "Tuition Fee Reimbursement (RTF)", value: "100% for SC/ST; As per Govt Norms for BC/EWS" },
      { label: "Parental Income Limit (RTF/ePASS)", value: "≤ ₹2.00 Lakh (Rural) / ≤ ₹1.50 Lakh (Urban)" },
      { label: "Local Reservation (OU / KU)", value: "85% Local Quota (15% Unreserved / Open)" },
      { label: "EWS Reservation", value: "10% Supernumerary (G.O. Ms. No. 244)" },
      { label: "BC Sub-quota Breakdown", value: "29% Total (BC-A 7%, BC-B 10%, BC-C 1%, BC-D 7%, BC-E 4%)" },
      { label: "SC / ST Category Quota", value: "SC (15%), ST (10%)" },
      { label: "Special Categories Quota", value: "PH (5% SADAREM), CAP (2%), NCC (1%), Sports (0.5%)" },
      { label: "Women Horizontal Reservation", value: "33.33% (1/3rd in each category)" },
    ],
  },
  documents: [
    {
      id: "icet_rank_card",
      name: "TG ICET 2026 Rank Card",
      purpose: "Mandatory score & rank proof for HLC slot verification.",
      categories: ["all"],
      validity: "Original computer-generated rank card downloaded from tgicet.nic.in.",
      xeroxSets: 2,
    },
    {
      id: "icet_hall_ticket",
      name: "TG ICET 2026 Hall Ticket",
      purpose: "Test authentication with invigilator verification signature.",
      categories: ["all"],
      validity: "Original Hall Ticket signed during the exam.",
      xeroxSets: 2,
    },
    {
      id: "degree_provisional",
      name: "Degree Provisional Certificate (PC) & Consolidated Memo (CMM)",
      purpose: "Qualifying graduation degree proof (min 50% for Gen / 45% for Reserved).",
      categories: ["all"],
      validity: "Original PC and CMM issued by recognized University.",
      xeroxSets: 2,
    },
    {
      id: "inter_memo",
      name: "Intermediate (Class XII) Marks Memo cum Pass Certificate",
      purpose: "Mathematics eligibility check for MCA admissions and 10+2 proof.",
      categories: ["all"],
      validity: "Original marks memo from TSBIE/BIEAP or equivalent Board.",
      xeroxSets: 2,
    },
    {
      id: "ssc_memo",
      name: "SSC (Class X) Marks Memo",
      purpose: "Proof of date of birth and father's name verification.",
      categories: ["all"],
      validity: "Original pass certificate issued by the Board of Secondary Education.",
      xeroxSets: 2,
    },
    {
      id: "tc",
      name: "Transfer Certificate (T.C.)",
      purpose: "Required for college admission and joining confirmation.",
      categories: ["all"],
      validity: "Original T.C. issued by the last attended Degree College.",
      xeroxSets: 1,
    },
    {
      id: "study_certs",
      name: "Study / Bonafide Certificates (Class IX to Degree — 7 consecutive years)",
      purpose: "Establishes local area status (85% OU/AU jurisdiction).",
      categories: ["all"],
      validity: "Original certificates for 7 consecutive years of study in Telangana.",
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
      purpose: "Mandatory for BC, SC, ST category reservation benefits.",
      categories: ["bc", "sc", "st"],
      validity: "MeeSeva-issued original caste certificate with Barcode.",
      xeroxSets: 2,
    },
    {
      id: "income_cert",
      name: "Income Certificate",
      purpose: "Required for 100% Tuition Fee Reimbursement (RTF / ePASS).",
      categories: ["ews", "bc", "sc", "st"],
      validity: "MeeSeva-issued on or after January 01, 2026. Certificates issued before Jan 1, 2026 are NOT accepted.",
      xeroxSets: 2,
    },
    {
      id: "ews_cert",
      name: "Economically Weaker Section (EWS) Certificate",
      purpose: "Claim 10% EWS reservation in MBA/MCA colleges for eligible OC candidates.",
      categories: ["ews"],
      validity: "Issued by Tahsildar for current Financial Year (2025–26) on prescribed format.",
      xeroxSets: 2,
    },
    {
      id: "minority_cert",
      name: "Minority Status Certificate",
      purpose: "Claim Minority quota seats at Minority MBA & MCA institutions.",
      categories: ["minority"],
      validity: "SSC Transfer Certificate mentioning religion, OR a Bonafide Certificate from Principal.",
      xeroxSets: 2,
    },
    {
      id: "ph_cert",
      name: "Disability Certificate (PH — Physically Handicapped)",
      purpose: "Claim 5% PH reservation. Minimum 40% disability required.",
      categories: ["ph"],
      validity: "SADAREM-authenticated certificate issued by District Medical Board.",
      xeroxSets: 2,
    },
    {
      id: "cap_cert",
      name: "CAP Certificate (Children of Armed Personnel)",
      purpose: "Claim CAP priority quota for children of military / ex-servicemen.",
      categories: ["cap"],
      validity: "Issued by Zilla Sainik Welfare Board on prescribed format.",
      xeroxSets: 2,
    },
    {
      id: "ncc_sports_cert",
      name: "NCC / Sports Quota Certificate",
      purpose: "Claim priority allotment under NCC / Sports quotas.",
      categories: ["ncc", "sports"],
      validity: "Original certificates issued by competent national/state authority.",
      xeroxSets: 2,
    },
  ],
};

export const icetController = {
  // GET /api/icet/counselling-data
  async getCounsellingData(req, res, next) {
    try {
      const scraped = await getIcetScrapeData();
      res.json({
        success: true,
        data: {
          ...ICET_COUNSELLING_DATA,
          notifications: scraped.notifications,
          lastScraped: scraped.lastScraped,
          sourceUrl: scraped.sourceUrl,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/icet/notifications
  async getNotifications(req, res, next) {
    try {
      const scraped = await getIcetScrapeData();
      res.json({
        success: true,
        data: {
          notifications: scraped.notifications,
          lastScraped: scraped.lastScraped,
          source: scraped.sourceUrl,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/icet/colleges
  async getColleges(req, res) {
    const { program = "MBA", district = "", sortBy = "rank" } = req.query;
    const progKey = program.toUpperCase();

    let list = ICET_INSTITUTIONS.filter(c => {
      const courses = c.coursesOffered || c.programs || ["MBA"];
      return courses.some(p => p.toUpperCase().includes(progKey));
    });

    if (district && district.trim()) {
      list = list.filter((c) => (c.district || "").toLowerCase() === district.trim().toLowerCase());
    }

    if (sortBy === "fee_asc") {
      list.sort((a, b) => (a.annualFee || a.tuitionFeePerYear || 0) - (b.annualFee || b.tuitionFeePerYear || 0));
    } else if (sortBy === "highest_package") {
      list.sort((a, b) => {
        const numA = parseFloat(a.placements?.highestPackage?.replace(/[^\d.]/g, '') || a.highestPlacementLpa || 0);
        const numB = parseFloat(b.placements?.highestPackage?.replace(/[^\d.]/g, '') || b.highestPlacementLpa || 0);
        return numB - numA;
      });
    } else if (sortBy === "avg_package" || sortBy === "placement_desc") {
      list.sort((a, b) => {
        const numA = parseFloat(a.placements?.averagePackage?.replace(/[^\d.]/g, '') || a.averagePlacementLpa || 0);
        const numB = parseFloat(b.placements?.averagePackage?.replace(/[^\d.]/g, '') || b.averagePlacementLpa || 0);
        return numB - numA;
      });
    } else {
      list.sort((a, b) => {
        const cutA = a.cutoffHistory?.['2025']?.[progKey.toLowerCase()]?.oc || a.cutoffs?.[progKey]?.oc2025 || 99999;
        const cutB = b.cutoffHistory?.['2025']?.[progKey.toLowerCase()]?.oc || b.cutoffs?.[progKey]?.oc2025 || 99999;
        return cutA - cutB;
      });
    }

    res.json({
      success: true,
      data: {
        colleges: list,
        total: list.length,
        programs: ICET_PROGRAMS,
      },
    });
  },

  // GET /api/icet/colleges/:code
  async getCollegeByCode(req, res) {
    const { code } = req.params;
    const college = ICET_INSTITUTIONS.find(
      (c) => c.code.toLowerCase() === code.toLowerCase()
    );

    if (!college) {
      return res.status(404).json({ success: false, error: "College not found" });
    }

    res.json({ success: true, data: college });
  },

  // GET /api/icet/compare?c1=OUCB&c2=CBIT&program=MBA
  async compareColleges(req, res) {
    const { c1 = "OUCB", c2 = "CBIT", program = "MBA" } = req.query;

    const collegeA = ICET_INSTITUTIONS.find(
      (c) => c.code.toLowerCase() === c1.toLowerCase()
    ) || ICET_INSTITUTIONS[0];

    const collegeB = ICET_INSTITUTIONS.find(
      (c) => c.code.toLowerCase() === c2.toLowerCase()
    ) || ICET_INSTITUTIONS[1];

    if (!collegeA || !collegeB) {
      return res.status(400).json({
        success: false,
        error: "One or both college codes not found in directory",
      });
    }

    const progKey = program.toUpperCase();
    const pLower = progKey.toLowerCase();

    const cutoffsA = {
      oc2025: collegeA.cutoffHistory?.['2025']?.[pLower]?.oc || collegeA.cutoffs?.[progKey]?.oc2025 || 8500,
      oc2024: collegeA.cutoffHistory?.['2024']?.[pLower]?.oc || collegeA.cutoffs?.[progKey]?.oc2024 || 8800,
      oc2023: collegeA.cutoffHistory?.['2023']?.[pLower]?.oc || collegeA.cutoffs?.[progKey]?.oc2023 || 9200,
      oc2022: collegeA.cutoffHistory?.['2022']?.[pLower]?.oc || collegeA.cutoffs?.[progKey]?.oc2022 || 9700,
    };

    const cutoffsB = {
      oc2025: collegeB.cutoffHistory?.['2025']?.[pLower]?.oc || collegeB.cutoffs?.[progKey]?.oc2025 || 8500,
      oc2024: collegeB.cutoffHistory?.['2024']?.[pLower]?.oc || collegeB.cutoffs?.[progKey]?.oc2024 || 8800,
      oc2023: collegeB.cutoffHistory?.['2023']?.[pLower]?.oc || collegeB.cutoffs?.[progKey]?.oc2023 || 9200,
      oc2022: collegeB.cutoffHistory?.['2022']?.[pLower]?.oc || collegeB.cutoffs?.[progKey]?.oc2022 || 9700,
    };

    const feeA = collegeA.annualFee || collegeA.tuitionFeePerYear || 0;
    const feeB = collegeB.annualFee || collegeB.tuitionFeePerYear || 0;

    const comparison = {
      program: progKey,
      collegeA: { ...collegeA, targetCutoffs: cutoffsA },
      collegeB: { ...collegeB, targetCutoffs: cutoffsB },
      verdict: {
        lowerCutoffRank: cutoffsA.oc2025 < cutoffsB.oc2025 ? collegeA.code : collegeB.code,
        betterPlacement: (collegeA.placements?.averagePackage || '') >= (collegeB.placements?.averagePackage || '') ? collegeA.code : collegeB.code,
        lowerFee: feeA <= feeB ? collegeA.code : collegeB.code,
      },
    };

    res.json({ success: true, data: comparison });
  },

  // GET /api/icet/colleges/:code/branches
  async getCollegeBranches(req, res) {
    const { code } = req.params;
    const cCode = (code || "").toUpperCase().trim();
    const college = ICET_INSTITUTIONS.find((c) => c.code === cCode);

    let branches = [];
    if (college && college.coursesOffered) {
      branches = college.coursesOffered.map((b) => ({
        code: b,
        name: b === "MBA" ? "Master of Business Administration (MBA)" : "Master of Computer Applications (MCA)",
      }));
    } else {
      branches = [
        { code: "MBA", name: "Master of Business Administration (MBA)" },
        { code: "MCA", name: "Master of Computer Applications (MCA)" },
      ];
    }

    res.json({ success: true, data: { collegeCode: cCode, branches } });
  },

  // GET /api/icet/allotments/meta
  async getAllotmentMeta(req, res) {
    const years = [
      { id: "2026-final", label: "2026 Final Phase (Official Live Allotment)" },
    ];
    const branches = [
      { code: "MBA", name: "Master of Business Administration (MBA)" },
      { code: "MCA", name: "Master of Computer Applications (MCA)" },
    ];
    const categories = [
      "ALL",
      "OC",
      "BC_A",
      "BC_B",
      "BC_C",
      "BC_D",
      "BC_E",
      "SC",
      "ST",
      "EWS",
    ];

    const colleges = ICET_INSTITUTIONS.map((c) => ({
      code: c.code,
      name: c.name,
      place: c.place || c.district,
      district: c.district,
      university: c.university,
      type: c.type,
      annualFee: c.annualFee || 0,
      coursesOffered: c.coursesOffered || ["MBA"],
    }));

    res.json({
      success: true,
      data: {
        years,
        branches,
        categories,
        colleges,
        totalColleges: colleges.length,
      },
    });
  },

  // GET /api/icet/allotments
  async getAllotmentData(req, res, next) {
    try {
      const {
        college = "OUCB",
        branch = "MBA",
        year = "2026-final",
        search = "",
        category = "",
        gender = "",
        page = 1,
        limit = 50,
      } = req.query;

      const cCode = (college || "OUCB").trim().toUpperCase();
      const bCode = (branch || "MBA").trim().toUpperCase();

      let liveScraped = null;
      try {
        liveScraped = await scrapeOfficialTgIcetAllotment(cCode, bCode);
      } catch (err) {
        console.warn("[ICET Live Allotment Scrape Warning]:", err.message);
      }

      const collegeObj = ICET_INSTITUTIONS.find((c) => c.code === cCode) || {
        code: cCode,
        name: `${cCode} Institution`,
        place: "Hyderabad",
        district: "Hyderabad",
        university: "OU",
        type: "Private Unaided",
        annualFee: 45000,
      };

      const branchObj = {
        code: bCode,
        name: bCode === "MBA" ? "Master of Business Administration (MBA)" : "Master of Computer Applications (MCA)",
      };

      let candidates = liveScraped?.candidates || [];

      // Filter in-memory if search/filter query parameters are passed
      if (search && search.trim() !== "") {
        const s = search.toLowerCase().trim();
        candidates = candidates.filter(
          (c) =>
            c.name.toLowerCase().includes(s) ||
            c.hallTicket.toLowerCase().includes(s) ||
            c.rank.toString().includes(s) ||
            c.seatCategory.toLowerCase().includes(s)
        );
      }

      if (category && category.toUpperCase() !== "ALL") {
        const cat = category.toUpperCase();
        candidates = candidates.filter(
          (c) => c.caste.toUpperCase() === cat || c.seatCategory.toUpperCase().includes(cat)
        );
      }

      if (gender && gender.toUpperCase() !== "ALL") {
        const g = gender.toUpperCase();
        candidates = candidates.filter((c) => c.gender.toUpperCase() === g || (g === "F" && c.gender === "Female") || (g === "M" && c.gender === "Male"));
      }

      const totalFiltered = candidates.length;
      const p = Math.max(1, parseInt(page, 10) || 1);
      const l = Math.max(1, parseInt(limit, 10) || 50);
      const startIndex = (p - 1) * l;
      const paginatedCandidates = candidates.slice(startIndex, startIndex + l);

      const finalData = {
        collegeCode: cCode,
        branchCode: bCode,
        totalSeats: liveScraped?.totalSeats || candidates.length,
        totalRecords: totalFiltered,
        openingRank: liveScraped?.openingRank || (candidates[0]?.rank || 0),
        closingRank: liveScraped?.closingRank || (candidates[candidates.length - 1]?.rank || 0),
        candidates: paginatedCandidates,
        availableBranches: liveScraped?.availableBranches || [{ code: "MBA", name: "MBA" }],
        page: p,
        totalPages: Math.ceil(totalFiltered / l) || 1,
        isLiveScraped: !!liveScraped?.candidates?.length,
        source: "https://tgicet.nic.in/college_allotment.aspx",
        lastUpdated: liveScraped?.lastUpdated || new Date().toISOString(),
      };

      res.json({
        success: true,
        data: {
          ...finalData,
          year,
          college: collegeObj,
          branch: branchObj,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/icet/refresh
  async triggerRefresh(req, res, next) {
    try {
      const result = await runIcetScrapeRefresh();
      res.json({
        success: true,
        message: "ICET Scrape refresh complete.",
        summary: { notifications: result.notifications.length },
      });
    } catch (err) {
      next(err);
    }
  },
};
