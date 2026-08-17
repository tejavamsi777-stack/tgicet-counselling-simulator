import { useState, useEffect } from 'react';
import { ecetApi } from '../lib/ecetApi';
import { ECET_INSTITUTIONS, ECET_BRANCHES } from '../data/ecetInstitutions';

export const ECET_FALLBACK_DATA = {
  year: '2026',
  phases: [
    {
      id: 'phase1',
      label: 'First Phase',
      badge: 'Completed',
      status: 'concluded',
      color: 'purple',
      steps: [
        { action: 'Online Registration, Slot Booking & Processing Fee Payment', dates: 'July 08 – July 12, 2026', status: 'concluded' },
        { action: 'Certificate Verification at Help Line Centres (HLC)', dates: 'July 10 – July 13, 2026', status: 'concluded' },
        { action: 'Exercising Web Options after Verification', dates: 'July 10 – July 15, 2026', status: 'concluded' },
        { action: 'Provisional First Phase Seat Allotment', dates: 'July 18, 2026', status: 'concluded' },
        { action: 'Payment of Tuition Fee & Self-Reporting through Website', dates: 'July 18 – July 22, 2026', status: 'concluded' },
      ],
    },
    {
      id: 'final_phase',
      label: 'Final Phase',
      badge: 'Concluded',
      status: 'concluded',
      color: 'indigo',
      steps: [
        { action: 'Online Registration & Slot Booking (Unverified Only)', dates: 'July 24, 2026', status: 'concluded' },
        { action: 'Certificate Verification at HLC', dates: 'July 25, 2026', status: 'concluded' },
        { action: 'Exercising Web Options (Fresh Entry & Sliding)', dates: 'July 24 – July 26, 2026', status: 'concluded' },
        { action: 'Provisional Final Phase Seat Allotment', dates: 'July 29, 2026', status: 'concluded' },
        { action: 'Tuition Fee Payment & Physical Reporting at Allotted College', dates: 'July 29 – August 02, 2026', status: 'concluded' },
      ],
    },
    {
      id: 'spot_admissions',
      label: 'Spot Admissions',
      badge: 'Active Guidelines',
      status: 'active',
      color: 'emerald',
      steps: [
        { action: 'Display of Vacancy Position by TSCHE', dates: 'August 05, 2026', status: 'active' },
        { action: 'Institutional Spot Admissions at Engineering Colleges', dates: 'August 06 – August 10, 2026', status: 'active' },
        { action: 'Uploading Spot Allotted Details to TSCHE Portal', dates: 'August 12, 2026', status: 'upcoming' },
      ],
    },
  ],
  conditions: [
    {
      id: 'lateral_entry_quota',
      severity: 'high',
      title: '10% Lateral Entry Supernumerary Quota',
      body: 'Admissions are made directly into 2nd Year (3rd Semester) of B.Tech against 10% supernumerary intake plus un-filled seats of 1st year B.Tech.',
    },
    {
      id: 'branch_eligibility_matrix',
      severity: 'high',
      title: 'Diploma-to-Degree Branch Mapping Matrix',
      body: 'Diploma holders are eligible for specific B.Tech branches per official TSCHE mapping (e.g. CME to CSE/IT/CSM/CSD; ECE to ECE/CSE/EEE; MEC to Mechanical/CSE/Civil).',
    },
    {
      id: 'special_quota_masab_tank',
      severity: 'medium',
      title: 'Masab Tank Centralized HLC Verification',
      body: 'NCC, Sports, CAP, and PH candidates must attend certificate verification exclusively at Government Polytechnic, Masab Tank, Hyderabad.',
    },
    {
      id: 'degree_relinquishment',
      severity: 'medium',
      title: 'DOST / Degree Admission Relinquishment',
      body: 'Candidates pursuing regular Degree (B.Sc/B.Com) through DOST must cancel that admission before joining the allotted engineering college.',
    },
    {
      id: 'fee_reimbursement',
      severity: 'medium',
      title: 'Full Fee Reimbursement (JVD / ePASS Guidelines)',
      body: 'Parental annual income must be ≤ ₹2 Lakhs (Rural) or ≤ ₹1.5 Lakhs (Urban) for 100% tuition fee reimbursement as prescribed by Government rules.',
    },
  ],
  eligibility: {
    academic: [
      'Must have obtained Diploma in Engineering & Technology / Pharmacy from SBTET Telangana or any recognized board with minimum 45% aggregate (40% for reserved categories).',
      'B.Sc (Mathematics) degree holders with minimum 45% aggregate (40% for reserved) are eligible for B.Tech lateral entry provided they studied Mathematics at 10+2 level.',
      'Seat Allocation Quota: 85% seats reserved for Local (Osmania University area) candidates; 15% Unreserved Merit quota open to all eligible Telangana residents.',
      'Maximum age for fee reimbursement eligibility is 25 years for OC candidates and 29 years for BC/SC/ST/Minority candidates as of 01-07-2026.',
    ],
    fees: [
      { label: 'Exam Registration Fee (OC / BC / EWS)', value: '₹900 (Online via TSOnline/Card/UPI)' },
      { label: 'Exam Registration Fee (SC / ST / PH)', value: '₹500 (Online via TSOnline/Card/UPI)' },
      { label: 'Counselling Processing Fee (OC / BC / EWS)', value: '₹1,200 (Online payment)' },
      { label: 'Counselling Processing Fee (SC / ST)', value: '₹600 (Online payment)' },
      { label: 'Tuition Fee Reimbursement (RTF)', value: '100% for SC/ST; As per Govt Norms for BC/EWS' },
      { label: 'Parental Income Limit (RTF/ePASS)', value: '≤ ₹2.00 Lakh (Rural) / ≤ ₹1.50 Lakh (Urban)' },
      { label: 'Local Reservation (OU Region)', value: '85% Local Quota (15% Unreserved / Open)' },
      { label: 'EWS Reservation', value: '10% Supernumerary (G.O. Ms. No. 244)' },
      { label: 'BC Sub-quota Breakdown', value: '29% Total (BC-A 7%, BC-B 10%, BC-C 1%, BC-D 7%, BC-E 4%)' },
      { label: 'SC / ST Category Quota', value: 'SC (15%), ST (10%)' },
      { label: 'Special Categories Quota', value: 'PH (5% SADAREM), CAP (2%), NCC (1%), Sports (0.5%)' },
      { label: 'Women Horizontal Reservation', value: '33.33% (1/3rd in each category)' },
    ],
    categories: [
      { name: 'Open Competition (OC)', percent: '50% (Open Merit)' },
      { name: 'Backward Classes (BC)', percent: '29% (A: 7%, B: 10%, C: 1%, D: 7%, E: 4%)' },
      { name: 'Scheduled Castes (SC)', percent: '15%' },
      { name: 'Scheduled Tribes (ST)', percent: '10%' },
      { name: 'Economically Weaker Sections (EWS)', percent: '10% (Supernumerary)' },
      { name: 'Women Reservation', percent: '33.33% (Horizontal)' },
    ],
  },
  documents: [
    {
      id: 'rank_card',
      name: 'TG ECET 2026 Rank Card',
      category: 'mandatory',
      applicableFor: ['All'],
      desc: 'Official score and rank card downloaded from tgecet.nic.in',
      required: true,
      xeroxSets: 2,
    },
    {
      id: 'hall_ticket',
      name: 'TG ECET 2026 Hall Ticket',
      category: 'mandatory',
      applicableFor: ['All'],
      desc: 'Original admit card with invigilator verification signature',
      required: true,
      xeroxSets: 2,
    },
    {
      id: 'aadhaar_card',
      name: 'Candidate Aadhaar Card',
      category: 'mandatory',
      applicableFor: ['All'],
      desc: 'Original UIDAI Aadhaar Card for biometric & identity validation',
      required: true,
      xeroxSets: 2,
    },
    {
      id: 'ssc_memo',
      name: 'S.S.C or Equivalent Marks Memo',
      category: 'mandatory',
      applicableFor: ['All'],
      desc: 'Class 10th marks memo for Date of Birth & name verification',
      required: true,
      xeroxSets: 2,
    },
    {
      id: 'diploma_memos',
      name: 'Diploma / B.Sc (Maths) All Semesters Marks Memos',
      category: 'mandatory',
      applicableFor: ['All'],
      desc: 'Consolidated marks memos with minimum 45% aggregate (40% for reserved)',
      required: true,
      xeroxSets: 2,
    },
    {
      id: 'diploma_pc',
      name: 'Diploma Provisional Certificate (PC) / Degree Certificate',
      category: 'mandatory',
      applicableFor: ['All'],
      desc: 'Provisional pass certificate issued by SBTET or University',
      required: true,
      xeroxSets: 2,
    },
    {
      id: 'study_cert',
      name: 'Study / Bonafide Certificates (Class 4th to Diploma)',
      category: 'mandatory',
      applicableFor: ['All'],
      desc: '7 consecutive academic years study certificates for Local Status (OU Region)',
      required: true,
      xeroxSets: 2,
    },
    {
      id: 'transfer_cert',
      name: 'Transfer Certificate (T.C.)',
      category: 'mandatory',
      applicableFor: ['All'],
      desc: 'Original T.C. from the polytechnic / college last attended',
      required: true,
      xeroxSets: 2,
    },
    {
      id: 'income_cert',
      name: 'Income Certificate (Issued on or after 01-01-2026)',
      category: 'financial',
      applicableFor: ['BC', 'SC/ST', 'EWS', 'Minority'],
      desc: 'Issued by Tahsildar / MeeSeva for 100% Fee Reimbursement eligibility',
      required: false,
      xeroxSets: 2,
    },
    {
      id: 'caste_cert',
      name: 'Caste Certificate (BC / SC / ST)',
      category: 'reservation',
      applicableFor: ['BC', 'SC/ST'],
      desc: 'Permanent digitally signed MeeSeva Caste Certificate with barcode',
      required: false,
      xeroxSets: 2,
    },
    {
      id: 'ews_cert',
      name: 'EWS Certificate for 2026–27',
      category: 'reservation',
      applicableFor: ['EWS'],
      desc: 'Valid EWS certificate issued by Tahsildar for 10% supernumerary quota',
      required: false,
      xeroxSets: 2,
    },
    {
      id: 'special_quota',
      name: 'Special Category Certificate (NCC, Sports, CAP, PH)',
      category: 'special_quota',
      applicableFor: ['Special Quota'],
      desc: 'Verified exclusively at Govt Polytechnic, Masab Tank HLC, Hyderabad',
      required: false,
      xeroxSets: 3,
    },
  ],
  colleges: ECET_INSTITUTIONS,
  branches: ECET_BRANCHES,
};

let _cache = null;

export function useEcetData() {
  const [data, setData] = useState(_cache || ECET_FALLBACK_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    ecetApi
      .getCounsellingData()
      .then((res) => {
        const payload = res?.data || res;
        if (payload && (payload.phases || payload.colleges)) {
          const merged = {
            ...ECET_FALLBACK_DATA,
            ...payload,
            colleges: payload.colleges?.length ? payload.colleges : ECET_INSTITUTIONS,
            branches: payload.branches?.length ? payload.branches : ECET_BRANCHES,
            phases: payload.phases?.length ? payload.phases : ECET_FALLBACK_DATA.phases,
            documents: payload.documents?.length ? payload.documents : ECET_FALLBACK_DATA.documents,
            conditions: payload.conditions?.length ? payload.conditions : ECET_FALLBACK_DATA.conditions,
            eligibility: payload.eligibility || ECET_FALLBACK_DATA.eligibility,
          };
          _cache = merged;
          setData(merged);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
