import { useState, useEffect } from 'react';
import { eapcetApi } from '../lib/eapcetApi';

export const EAPCET_DOCUMENTS = [
  {
    id: "rank_card",
    name: "TG EAPCET 2026 Rank Card",
    purpose: "Primary merit rank document for seat allotment.",
    categories: ["all"],
    validity: "Official download from tgeapcet.nic.in.",
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
    validity: "MeeSeva-issued. MUST be issued on or after January 1st of the current admission year (2026).",
    xeroxSets: 2,
  },
];

export const EAPCET_FALLBACK_PHASES = [
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
];

export const EAPCET_FALLBACK_CONDITIONS = [
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
];

export const EAPCET_FALLBACK_ELIGIBILITY = {
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
};

export const EAPCET_FALLBACK_DATA = {
  year: 2026,
  documents: EAPCET_DOCUMENTS,
  phases: EAPCET_FALLBACK_PHASES,
  conditions: EAPCET_FALLBACK_CONDITIONS,
  eligibility: EAPCET_FALLBACK_ELIGIBILITY
};

let _cache = EAPCET_FALLBACK_DATA;

export function useEapcetData() {
  const [data, setData] = useState(_cache || EAPCET_FALLBACK_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    eapcetApi.getCounsellingData()
      .then(res => {
        if (res?.data && res.data.phases && res.data.phases.length > 0 && res.data.phases[0]?.steps) {
          _cache = { ...EAPCET_FALLBACK_DATA, ...res.data };
          setData(_cache);
        }
      })
      .catch(err => {
        console.warn("[useEapcetData] Fetch failed, using fallback data:", err.message);
      });
  }, []);

  return { data: data || EAPCET_FALLBACK_DATA, loading, error };
}
