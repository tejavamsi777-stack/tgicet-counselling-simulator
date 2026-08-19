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
    validity: "State / National level participation certificate from Sports Authority of Telangana (SAT).",
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
  documents: EAPCET_DOCUMENTS,
};

let _cache = EAPCET_FALLBACK_DATA;

export function useEapcetData() {
  const [data, setData] = useState(_cache || EAPCET_FALLBACK_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    eapcetApi.getCounsellingData()
      .then(res => {
        if (res?.data) {
          _cache = res.data;
          setData(res.data);
        }
      })
      .catch(err => {
        // Keep fallback data on error
        console.warn("[useEapcetData] Fetch failed, using fallback data:", err.message);
      });
  }, []);

  return { data: data || EAPCET_FALLBACK_DATA, loading, error };
}
