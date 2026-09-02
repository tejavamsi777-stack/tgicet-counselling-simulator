import { useState, useEffect } from 'react';
import { apEapcetApi } from '../lib/apEapcetApi';

export const EAPCET_DOCUMENTS = [
  {
    id: "rank_card",
    name: "AP EAPCET 2026 Rank Card",
    purpose: "Primary merit rank document for seat allotment.",
    categories: ["all"],
    validity: "Official download from cets.apsche.ap.gov.in.",
    xeroxSets: 2,
  },
  {
    id: "hall_ticket",
    name: "AP EAPCET 2026 Hall Ticket",
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
    validity: "Original marks sheet from BIEAP/BIEAP or equivalent Board.",
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
    validity: "Original certificates from each school/college for 7 consecutive years of study in Andhra Pradesh.",
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
    validity: "MeeSeva-issued. MUST be issued on or after January 1st of the current admission year (2026).",
    xeroxSets: 2,
  },
  {
    id: "ews_cert",
    name: "Economically Weaker Section (EWS) Certificate",
    purpose: "Claim 10% EWS reservation for OC candidates below income threshold.",
    categories: ["ews"],
    validity: "Issued by Tahsildar for the current Financial Year (2025–26). Must be on prescribed format.",
    xeroxSets: 2,
  },
  {
    id: "minority_cert",
    name: "Minority Certificate",
    purpose: "Muslim / Christian minority candidates for minority quota colleges.",
    categories: ["minority"],
    validity: "SSC Transfer Certificate mentioning religion, OR Bonafide Certificate confirming minority status.",
    xeroxSets: 2,
  },
  {
    id: "ph_cert",
    name: "Disability Certificate (PH — Physically Handicapped)",
    purpose: "Claim 5% PH reservation. Must indicate % of disability.",
    categories: ["ph", "special"],
    validity: "SADAREM-authenticated certificate issued by District Medical Board. Minimum 40% disability.",
    xeroxSets: 2,
  },
  {
    id: "cap_cert",
    name: "CAP Certificate (Children of Armed Personnel)",
    purpose: "Claim 2% CAP reservation for children of defence/paramilitary personnel.",
    categories: ["cap", "special"],
    validity: "Appendix-3 certificate signed by Unit Commanding Officer with authenticated Service Register.",
    xeroxSets: 2,
  },
  {
    id: "ncc_cert",
    name: "NCC Certificate",
    purpose: "Claim NCC special quota seats.",
    categories: ["ncc", "special"],
    validity: "'B' or 'C' Certificate issued by NCC authority.",
    xeroxSets: 2,
  },
  {
    id: "sports_cert",
    name: "Sports / Games Certificate",
    purpose: "Claim Sports/Games (SG) special quota seats.",
    categories: ["sports", "special"],
    validity: "State / National level participation certificate from Sports Authority of Andhra Pradesh (SAT).",
    xeroxSets: 2,
  },
  {
    id: "income_cert_fr",
    name: "Income & Assets Certificate (Fee Reimbursement)",
    purpose: "Required exclusively for Fee Reimbursement Scheme application.",
    categories: ["ews", "bc", "sc", "st"],
    validity: "Annual family income ≤ ₹2,00,000 (urban) / ₹1,50,000 (rural). MeeSeva-issued for 2026.",
    xeroxSets: 2,
  },
];

export const EAPCET_FALLBACK_DATA = {
  year: 2026,
  examName: "AP EAPCET 2026 (M.P.C. Stream)",
  authority: "Commissionerate of Higher Education, Andhra Pradesh / APSCHE",
  officialWebsite: "https://cap.apcfss.in/",
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
      { label: "Post Matric Scholarships (RTF)", value: "100% Full Tuition Fee Reimbursement (Income ≤ ₹2.5L / Rice Card)" },
    ],
  },
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
  ],
  documents: EAPCET_DOCUMENTS,
};

let _cache = EAPCET_FALLBACK_DATA;

export function useApEapcetData() {
  const [data, setData] = useState(_cache || EAPCET_FALLBACK_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apEapcetApi.getCounsellingData()
      .then(res => {
        if (res?.data) {
          _cache = res.data;
          setData(res.data);
        }
      })
      .catch(err => {
        // Keep fallback data on error
        console.warn("[useApEapcetData] Fetch failed, using fallback data:", err.message);
      });
  }, []);

  return { data: data || EAPCET_FALLBACK_DATA, loading, error };
}
