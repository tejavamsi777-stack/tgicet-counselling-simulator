import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import { POLYCET_INSTITUTIONS, POLYCET_BRANCHES } from '../data/polycetInstitutions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ALLOTMENTS_DIR = path.resolve(__dirname, '../data/polycet_allotments');

// In-memory cache for polycet scraped notifications
let polycetCache = {
  notifications: { data: null, timestamp: 0 },
};

// Static master counselling metadata for TG POLYCET
const POLYCET_COUNSELLING_DATA = {
  exam: {
    code: "tg-polycet",
    name: "TG POLYCET 2026",
    fullName: "Telangana State Polytechnic Common Entrance Test",
    conductingBody: "State Board of Technical Education and Training (SBTET), Hyderabad",
    counsellingAuthority: "Department of Technical Education, Government of Telangana",
    officialPortal: "https://tgpolycet.nic.in",
    academicYear: "2026–2027",
    stream: "Diploma in Engineering, Technology & Non-Engineering Courses",
  },

  // ── Official TGCHE / SBTET 2026 Schedule ─────────────────────────────
  phases: [
    {
      id: "first_phase",
      name: "First Phase",
      status: "Concluded",
      badge: "Completed",
      dates: "June 20 – July 05, 2026",
      color: "purple",
      description: "Online registration, processing fee payment, certificate verification at HLC, web options, and first phase seat allotment.",
      events: [
        { label: "Online Registration & Processing Fee Payment", date: "June 20 – June 24, 2026" },
        { label: "Certificate Verification at Help Line Centres (HLC)", date: "June 22 – June 25, 2026" },
        { label: "Exercising Web Options after Verification", date: "June 22 – June 27, 2026" },
        { label: "Freezing of Options", date: "June 27, 2026" },
        { label: "Provisional Seat Allotment (Phase 1)", date: "June 30, 2026" },
        { label: "Payment of Tuition Fee & Self-Reporting Online", date: "June 30 – July 05, 2026" },
      ],
    },
    {
      id: "final_phase",
      name: "Final Phase",
      status: "Concluded",
      badge: "Completed",
      dates: "July 09 – July 16, 2026",
      color: "indigo",
      description: "Final phase certificate verification, web options sliding, and provisional seat allotment.",
      events: [
        { label: "Online Registration & Slot Booking (Final Phase)", date: "July 09 – July 10, 2026" },
        { label: "Certificate Verification at HLC", date: "July 11, 2026" },
        { label: "Exercising Web Options (Sliding & Fresh Entry)", date: "July 09 – July 12, 2026" },
        { label: "Freezing of Options", date: "July 12, 2026" },
        { label: "Provisional Seat Allotment (Final Phase)", date: "July 14, 2026" },
        { label: "Payment of Fee, Self-Reporting & College Reporting", date: "July 14 – July 16, 2026" },
      ],
    },
    {
      id: "spot_admissions",
      name: "Spot Admissions (Institutional)",
      status: "Live Now",
      badge: "Active",
      dates: "July 23 – July 31, 2026",
      color: "emerald",
      description: "Direct institutional spot admissions for leftover unconvened polytechnic seats across Govt and Private polytechnics.",
      events: [
        { label: "Display of Vacancy Position by SBTET", date: "July 23, 2026" },
        { label: "Internal Sliding / Spot Admission at Polytechnic Campuses", date: "July 24 – July 28, 2026" },
        { label: "Uploading Spot Allotted Candidate Details to SBTET Portal", date: "On or before July 31, 2026" },
      ],
    },
  ],

  // ── Official Notifications Directly Linked to Verified PDFs & Pages ──────
  notifications: [
    {
      id: "polycet_allotment_2026",
      title: "TGPOLYCET 2026 :: College-wise Candidate Allotment Records",
      date: "August 2026",
      badge: "LIVE DATA",
      type: "circular",
      isNew: true,
      href: "/tg-polycet/allotments",
      isExternal: false,
    },
    {
      id: "polycet_2026_notification",
      title: "TGPOLYCET 2026 :: Detailed Notification & Counselling Schedule",
      date: "June 2026",
      badge: "OFFICIAL PDF",
      type: "notification",
      isNew: true,
      href: "https://tgpolycet.nic.in/PDF/TG_POLYCET_2026_DETAILEDNOTIFICATION.pdf",
      isExternal: true,
    },
    {
      id: "polycet_2025_final_cutoff",
      title: "TGPOLYCET 2025 Final Phase Last Rank Statement (Closing Ranks)",
      date: "July 2025",
      badge: "OFFICIAL PDF",
      type: "last_ranks",
      isNew: true,
      href: "https://tgpolycet.nic.in/PDF/TGPOLYCET_2025_FINALPHASE.pdf",
      isExternal: true,
    },
    {
      id: "polycet_2025_first_cutoff",
      title: "TGPOLYCET 2025 First Phase Last Rank Statement",
      date: "July 2025",
      badge: "OFFICIAL PDF",
      type: "last_ranks",
      isNew: false,
      href: "https://tgpolycet.nic.in/PDF/TGPOLYCET_2025_FirstPhase.pdf",
      isExternal: true,
    },
    {
      id: "polycet_spot_guidelines",
      title: "TGPOLYCET 2026 :: Institutional Spot Admission Guidelines & Vacancies",
      date: "July 2026",
      badge: "OFFICIAL PDF",
      type: "guidelines",
      isNew: true,
      href: "https://tgpolycet.nic.in/PDF/TGPOLYCET_2026_SPOT_GUIDELINES.pdf",
      isExternal: true,
    },
    {
      id: "polycet_candidate_guide",
      title: "TGPOLYCET 2026 Candidate User Guide & Option Entry Manual",
      date: "June 2026",
      badge: "OFFICIAL PDF",
      type: "manual",
      isNew: false,
      href: "https://tgpolycet.nic.in/PDF/TGPOLYCET_2026_Candidate_User_Guide.pdf",
      isExternal: true,
    },
  ],

  // ── Admission Conditions & Binding Rules ──────────────────────────────
  conditions: [
    {
      id: "qualifying_marks",
      severity: "high",
      title: "Minimum Qualifying Cutoff",
      body: "Candidates must secure at least 30% marks (36 marks out of 120) in TG POLYCET-2026 for OC, BC, and EWS categories. SC and ST candidates have no minimum cutoff restriction.",
    },
    {
      id: "seat_supersession",
      severity: "high",
      title: "Seat Supersession Protocol",
      body: "If a candidate is allotted a higher preference seat in Final Phase or Institutional Spot Admission, their earlier allotted seat is automatically and irrevocably vacated.",
    },
    {
      id: "local_area_quota",
      severity: "medium",
      title: "Local Area Reservation (85% OU Region)",
      body: "85% of total polytechnic seats are reserved for Telangana State local candidates. 15% seats are unreserved merit quota open to eligible non-local candidates.",
    },
    {
      id: "income_epass_rtf",
      severity: "medium",
      title: "Fee Reimbursement (RTF) Income Verification",
      body: "100% Tuition Fee Reimbursement is provided under Telangana ePASS for eligible candidates with parental annual income ≤ ₹2.00 Lakh (Rural) or ≤ ₹1.50 Lakh (Urban).",
    },
    {
      id: "reporting_mandate",
      severity: "low",
      title: "Mandatory College Reporting",
      body: "Allotted candidates must pay the requisite challan/fee online, self-report on the portal, and submit original documents with Transfer Certificate (TC) at the allotted polytechnic campus.",
    },
  ],

  // ── Admission Criteria & Quota Framework ─────────────────────────────
  eligibility: {
    academic: [
      "Passed SSC (10th Standard) or equivalent examination recognized by BSE Telangana with Mathematics as a compulsory subject.",
      "Secured minimum 35% marks in SSC qualifying examination.",
      "Qualified in TG POLYCET-2026 with at least 30% marks (no cutoff for SC/ST).",
      "No minimum or maximum age limit for 3-Year Diploma in Engineering courses.",
      "Must be an Indian National satisfying Telangana local/unreserved status.",
    ],
    fees: [
      { label: "Exam Registration Fee (OC / BC / EWS)", value: "₹500 (Online / TSOnline Centres)" },
      { label: "Exam Registration Fee (SC / ST)", value: "₹250 (Online / TSOnline Centres)" },
      { label: "Counselling Processing Fee (OC / BC / EWS)", value: "₹600 (Online via UPI/Cards)" },
      { label: "Counselling Processing Fee (SC / ST)", value: "₹300 (Online via UPI/Cards)" },
      { label: "Govt Polytechnic Tuition Fee", value: "₹3,800 / year (Fixed by Govt)" },
      { label: "Private Polytechnic Tuition Fee", value: "₹15,500 / year (Fixed by Govt)" },
      { label: "Tuition Fee Reimbursement (RTF)", value: "100% Full Fee Reimbursement under ePASS" },
      { label: "Local Reservation (OU Region)", value: "85% Local Quota (15% Unreserved Merit)" },
      { label: "EWS Reservation", value: "10% Supernumerary Quota (G.O. Ms. No. 244)" },
      { label: "BC Category Reservation", value: "29% Total (BC-A 7%, BC-B 10%, BC-C 1%, BC-D 7%, BC-E 4%)" },
      { label: "SC / ST Reservation", value: "SC (15%), ST (10%)" },
      { label: "Women Horizontal Reservation", value: "33.33% (1/3rd in each category)" },
    ],
  },

  // ── Verification Documents ────────────────────────────────────────────
  documents: [
    {
      id: "polycet_rank_card",
      name: "TG POLYCET 2026 Rank Card",
      purpose: "Mandatory score & rank proof for HLC slot verification.",
      categories: ["all"],
      validity: "Original computer-generated rank card from tgpolycet.nic.in.",
      xeroxSets: 2,
    },
    {
      id: "polycet_hall_ticket",
      name: "TG POLYCET 2026 Hall Ticket",
      purpose: "Exam authentication with invigilator verification signature.",
      categories: ["all"],
      validity: "Original Hall Ticket signed during the exam.",
      xeroxSets: 2,
    },
    {
      id: "ssc_memo",
      name: "SSC (10th Standard) Marks Memo",
      purpose: "Proof of date of birth, mother/father name & Mathematics passing marks.",
      categories: ["all"],
      validity: "Original SSC Board Marks Memo issued by BSE Telangana / CBSE / ICSE.",
      xeroxSets: 2,
    },
    {
      id: "study_bonafide_4_to_10",
      name: "Study & Bonafide Certificates (Classes 4th to 10th)",
      purpose: "Determines Telangana Local Area status (OU Region 85% quota).",
      categories: ["all"],
      validity: "Original School Bonafide / Study Certificates covering 7 consecutive academic years.",
      xeroxSets: 2,
    },
    {
      id: "caste_certificate",
      name: "Caste / Integrated Community Certificate",
      purpose: "Claiming BC-A/B/C/D/E, SC, or ST quota reservation benefits.",
      categories: ["bc", "sc", "st", "sc_st"],
      validity: "Digitally signed MeeSeva Caste Certificate with valid barcode & application number.",
      xeroxSets: 2,
    },
    {
      id: "income_certificate",
      name: "Latest MeeSeva Income Certificate",
      purpose: "Mandatory for 100% Tuition Fee Reimbursement (RTF / ePASS).",
      categories: ["bc", "sc", "st", "sc_st", "ews", "minority"],
      validity: "Issued on or after January 01, 2026 with parental annual income ≤ ₹2 Lakh (Rural) or ≤ ₹1.5 Lakh (Urban).",
      xeroxSets: 2,
    },
    {
      id: "ews_certificate",
      name: "EWS Certificate (Economically Weaker Section)",
      purpose: "10% supernumerary quota for General / OC candidates per G.O. Ms. No. 244.",
      categories: ["ews"],
      validity: "Issued by competent Tahsildar / Revenue Authority for financial year 2026–27.",
      xeroxSets: 2,
    },
    {
      id: "transfer_certificate",
      name: "Transfer Certificate (TC)",
      purpose: "Proof of formal school completion for final polytechnic campus reporting.",
      categories: ["all"],
      validity: "Original TC from school last attended (submitted during final college joining).",
      xeroxSets: 1,
    },
    {
      id: "aadhaar_card",
      name: "Candidate Aadhaar Card",
      purpose: "Biometric identity verification and ePASS scholarship linking.",
      categories: ["all"],
      validity: "Clear printout / PVC card with matching name & date of birth.",
      xeroxSets: 2,
    },
  ],
};

async function fetchLivePolycetNotifications(force = false) {
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  if (!force && polycetCache.notifications.data && Date.now() - polycetCache.notifications.timestamp < SIX_HOURS) {
    return polycetCache.notifications.data;
  }

  try {
    const response = await fetch("https://tgpolycet.nic.in/default.aspx", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      const html = await response.text();
      const $ = cheerio.load(html);
      const scraped = [];

      // Always include live candidate allotments link first
      scraped.push({
        id: "polycet_allotment_2026",
        title: "TGPOLYCET 2026 :: College-wise Candidate Allotment Records",
        date: "August 2026",
        badge: "LIVE DATA",
        type: "circular",
        isNew: true,
        href: "/tg-polycet/allotments",
        isExternal: false,
      });

      const IGNORE_TITLES = [
        "tgpolycet",
        "home",
        "verify payment status",
        "candidates login",
        "candidate login",
        "contact us",
        "logout",
        "default",
      ];

      $("a").each((i, el) => {
        const rawText = $(el).text().replace(/\s+/g, " ").trim();
        const href = $(el).attr("href") || "";
        const lowerText = rawText.toLowerCase();

        if (!rawText || IGNORE_TITLES.some((ign) => lowerText === ign || lowerText.startsWith(ign))) {
          return;
        }

        if (href && (href.endsWith(".pdf") || href.includes(".aspx") || href.includes("files/"))) {
          let fullLink = href.startsWith("http") ? href : `https://tgpolycet.nic.in/${href.replace(/^\//, "")}`;
          let isInternal = false;
          let badge = "OFFICIAL CIRCULAR";

          if (lowerText.includes("college-wise allotment") || href.includes("college_allotment")) {
            fullLink = "/tg-polycet/allotments";
            isInternal = true;
            badge = "LIVE DATA";
          } else if (href.includes(".aspx")) {
            fullLink = "https://tgpolycet.nic.in/default.aspx";
            badge = "OFFICIAL PORTAL";
          }

          if (!scraped.some((s) => s.title.toLowerCase() === rawText.toLowerCase() || s.href === fullLink)) {
            const isPdf = href.endsWith(".pdf") || href.includes("files/") || fullLink.endsWith(".pdf");
            scraped.push({
              id: `scraped_polycet_${i}`,
              title: rawText.replace(/\s*NEW\s*$/i, "").trim(),
              href: fullLink,
              date: "August 2026",
              badge: isInternal ? badge : isPdf ? "OFFICIAL PDF" : badge,
              type: isPdf ? "pdf" : "circular",
              isNew: rawText.toLowerCase().includes("new") || i < 4,
              isExternal: !isInternal,
            });
          }
        }
      });

      if (scraped.length > 1) {
        polycetCache.notifications = { data: scraped, timestamp: Date.now() };
        return scraped;
      }
    }
  } catch (err) {
    console.warn("[POLYCET Scrape Warn]:", err.message);
  }

  polycetCache.notifications = { data: POLYCET_COUNSELLING_DATA.notifications, timestamp: Date.now() };
  return POLYCET_COUNSELLING_DATA.notifications;
}

export const polycetController = {
  // GET /api/polycet/notifications
  async getNotifications(req, res) {
    try {
      const force = req.query.force === "true";
      const list = await fetchLivePolycetNotifications(force);
      res.json({ success: true, data: list, count: list.length, timestamp: Date.now() });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // POST /api/polycet/refresh
  async refreshNotifications(req, res) {
    try {
      const list = await fetchLivePolycetNotifications(true);
      res.json({ success: true, message: "Polycet notifications refreshed successfully", data: list, count: list.length });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // GET /api/polycet/counselling-data
  async getCounsellingData(req, res) {
    const notifs = await fetchLivePolycetNotifications(false);
    res.json({
      success: true,
      year: 2026,
      phases: POLYCET_COUNSELLING_DATA.phases,
      conditions: POLYCET_COUNSELLING_DATA.conditions,
      eligibility: POLYCET_COUNSELLING_DATA.eligibility,
      documents: POLYCET_COUNSELLING_DATA.documents,
      notifications: notifs,
      data: { ...POLYCET_COUNSELLING_DATA, notifications: notifs },
    });
  },

  // GET /api/polycet/colleges
  async getColleges(req, res) {
    const { branch = "", district = "", sortBy = "rank" } = req.query;
    const branchKey = branch.toUpperCase();

    let list = [...POLYCET_INSTITUTIONS];

    if (branchKey && branchKey.trim()) {
      list = list.filter(c => c.courses?.some(b => b.branchCode.toUpperCase() === branchKey));
    }

    if (district && district.trim()) {
      list = list.filter(c => (c.district || "").toLowerCase() === district.trim().toLowerCase());
    }

    if (sortBy === "fee_asc") {
      list.sort((a, b) => (a.annualFee || 0) - (b.annualFee || 0));
    } else {
      // Sort government colleges first
      list.sort((a, b) => {
        const isGovtA = a.type?.includes('Government') ? 1 : 0;
        const isGovtB = b.type?.includes('Government') ? 1 : 0;
        if (isGovtA !== isGovtB) return isGovtB - isGovtA;
        return a.name.localeCompare(b.name);
      });
    }

    res.json({
      success: true,
      data: {
        colleges: list,
        total: list.length,
        branches: POLYCET_BRANCHES,
      },
    });
  },

  // GET /api/polycet/allotments/summary
  // GET /api/polycet/allotments/meta
  async getAllotmentMeta(req, res) {
    try {
      const summaryPath = path.join(ALLOTMENTS_DIR, 'allotments_summary.json');
      let collegeBranches = {};
      let colleges = [];
      if (fs.existsSync(summaryPath)) {
        const summaryData = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
        summaryData.forEach((col) => {
          colleges.push({ code: col.code, name: col.name, district: col.district, type: col.type });
          collegeBranches[col.code] = (col.branches || []).map((b) => ({
            code: b.branchCode,
            name: b.branchName || b.branchCode,
            totalAllotted: b.totalAllotted
          }));
        });
      }
      res.json({
        success: true,
        data: {
          years: [{ id: "2026", label: "2026 Final Phase Allotments" }],
          colleges: colleges.length > 0 ? colleges : POLYCET_INSTITUTIONS,
          branches: POLYCET_BRANCHES,
          collegeBranches,
        }
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  },

  // GET /api/polycet/colleges/:code/branches
  async getCollegeBranches(req, res) {
    const code = (req.params.code || "").toUpperCase();
    const summaryPath = path.join(ALLOTMENTS_DIR, 'allotments_summary.json');
    let branches = [];
    if (fs.existsSync(summaryPath)) {
      const summaryData = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      const col = summaryData.find((c) => c.code === code);
      if (col) {
        branches = (col.branches || []).map((b) => ({
          code: b.branchCode,
          name: b.branchName || b.branchCode,
          totalAllotted: b.totalAllotted
        }));
      }
    }
    res.json({ success: true, collegeCode: code, branches });
  },

  // GET /api/polycet/allotments/summary
  async getAllotmentsSummary(req, res) {
    try {
      const summaryPath = path.join(ALLOTMENTS_DIR, 'allotments_summary.json');
      if (fs.existsSync(summaryPath)) {
        const data = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
        return res.json({ success: true, data });
      }
      res.json({ success: true, data: [] });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  },

  // GET /api/polycet/allotments/:collegeCode
  async getCollegeAllotments(req, res) {
    const { collegeCode } = req.params;
    const { branch = "" } = req.query;

    try {
      const collegePath = path.join(ALLOTMENTS_DIR, `${collegeCode.toUpperCase()}.json`);
      if (!fs.existsSync(collegePath)) {
        return res.status(404).json({ success: false, error: `Allotments for college ${collegeCode} not found.` });
      }

      const collegeData = JSON.parse(fs.readFileSync(collegePath, 'utf8'));
      if (branch && branch.trim() && branch.trim().toUpperCase() !== 'ALL') {
        const branchUpper = branch.trim().toUpperCase();
        const branchObj = collegeData.branches?.find(b => b.branchCode.toUpperCase() === branchUpper);
        return res.json({
          success: true,
          data: {
            ...collegeData,
            branches: branchObj ? [branchObj] : []
          }
        });
      }

      res.json({ success: true, data: collegeData });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  },

  // GET /api/polycet/compare?c1=MASB&c2=JNGP&branch=CME
  async compareColleges(req, res) {
    const { c1 = "MASB", c2 = "JNGP", branch = "CME" } = req.query;

    const collegeA = POLYCET_INSTITUTIONS.find(
      (c) => c.code.toLowerCase() === c1.toLowerCase()
    ) || POLYCET_INSTITUTIONS[0];

    const collegeB = POLYCET_INSTITUTIONS.find(
      (c) => c.code.toLowerCase() === c2.toLowerCase()
    ) || POLYCET_INSTITUTIONS[1];

    const feeA = collegeA.annualFee || 3800;
    const feeB = collegeB.annualFee || 3800;

    const comparison = {
      branch: branch.toUpperCase(),
      collegeA,
      collegeB,
      verdict: {
        lowerFee: feeA <= feeB ? collegeA.code : collegeB.code,
        hasHostel: collegeA.hostelAvailable ? collegeA.code : collegeB.code,
      },
    };

    res.json({ success: true, data: comparison });
  },
};
