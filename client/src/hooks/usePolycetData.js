import { useState, useEffect } from 'react';
import { polycetApi } from '../lib/polycetApi';

// Default static fallback state
const DEFAULT_POLYCET_DATA = {
  year: 2026,
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
  notifications: [
    {
      id: "polycet_allotment_2026",
      title: "TGPOLYCET 2026 :: College-wise Candidate Allotment Records",
      date: "August 2026",
      badge: "LIVE DATA",
      type: "circular",
      isNew: true,
      href: "/tg-polycet/allotments",
    },
    {
      id: "polycet_2026_notification",
      title: "TGPOLYCET 2026 :: Detailed Notification & Counselling Schedule",
      date: "June 2026",
      badge: "OFFICIAL PDF",
      type: "notification",
      isNew: true,
      href: "/files/TG_POLYCET_2026_DETAILEDNOTIFICATION.pdf",
    },
    {
      id: "polycet_2025_final_cutoff",
      title: "TGPOLYCET 2025 Final Phase Last Rank Statement (Closing Ranks)",
      date: "July 2025",
      badge: "OFFICIAL PDF",
      type: "last_ranks",
      isNew: true,
      href: "/files/TGPOLYCET_2025_FINALPHASE.pdf",
    },
    {
      id: "polycet_2025_first_cutoff",
      title: "TGPOLYCET 2025 First Phase Last Rank Statement",
      date: "July 2025",
      badge: "OFFICIAL PDF",
      type: "last_ranks",
      isNew: false,
      href: "/files/TGPOLYCET_2025_FirstPhase.pdf",
    },
    {
      id: "polycet_spot_guidelines",
      title: "TGPOLYCET 2026 :: Institutional Spot Admission Guidelines & Vacancies",
      date: "July 2026",
      badge: "OFFICIAL PDF",
      type: "guidelines",
      isNew: true,
      href: "/files/TGPOLYCET_2026_SPOT_GUIDELINES.pdf",
    },
    {
      id: "polycet_candidate_guide",
      title: "TGPOLYCET 2026 Candidate User Guide & Option Entry Manual",
      date: "June 2026",
      badge: "OFFICIAL PDF",
      type: "manual",
      isNew: false,
      href: "/files/TGPOLYCET_2026_Candidate_User_Guide.pdf",
    },
  ],
  documents: [
    {
      id: "polycet_hall_ticket",
      name: "TG POLYCET-2026 Hall Ticket",
      purpose: "Identity proof and verification of examination candidature.",
      categories: ["all"],
      validity: "Original printed hall ticket issued by SBTET.",
      xeroxSets: 2,
    },
    {
      id: "polycet_rank_card",
      name: "TG POLYCET-2026 Rank Card",
      purpose: "Merit rank verification for web options and seat allocation.",
      categories: ["all"],
      validity: "Downloaded official rank card with candidate photo & barcode.",
      xeroxSets: 2,
    },
    {
      id: "ssc_memo",
      name: "SSC (10th) Marks Memo / Pass Certificate",
      purpose: "Date of Birth proof, Mathematics pass verification & eligibility check.",
      categories: ["all"],
      validity: "Original SSC certificate / CBSE / ICSE marks sheet.",
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
      name: "Transfer Certificate (T.C.) from 10th School",
      purpose: "Institutional admission release and migration verification.",
      categories: ["all"],
      validity: "Original Transfer Certificate (T.C.) issued by the head of the institution last attended.",
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
    {
      id: "special_category_certificate",
      name: "Special Category Certificate (PH / CAP / NCC / Sports)",
      purpose: "PH (SADAREM ≥40%), CAP (Zilla Sainik Welfare), NCC (A/B/C), Sports (Form-1/2/3).",
      categories: ["special", "ph", "cap", "ncc", "sports"],
      validity: "Original certificate from authorized authority (Masab Tank HLC only).",
      xeroxSets: 3,
    },
  ],
};

let _cache = null;

export function usePolycetData() {
  const [data, setData] = useState(_cache || DEFAULT_POLYCET_DATA);
  const [loading, setLoading] = useState(!_cache);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (_cache) return;
    polycetApi
      .getCounsellingData()
      .then((res) => {
        const payload = res.data?.data || res.data || DEFAULT_POLYCET_DATA;
        _cache = payload;
        setData(payload);
      })
      .catch((err) => {
        setError(err.message);
        setData(DEFAULT_POLYCET_DATA);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
