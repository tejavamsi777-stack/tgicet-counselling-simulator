import { useState, useMemo } from "react";
import { Download, Check, RefreshCw, Save, Star, GraduationCap, Users } from "lucide-react";
import { GlassButton } from "../ui/glass-button";
import { useChecklist } from "../../hooks/useChecklist";

const CATEGORY_PILLS = [
  { id: "all",      label: "All" },
  { id: "oc",       label: "OC (General)" },
  { id: "ews",      label: "EWS" },
  { id: "bc",       label: "BC" },
  { id: "sc_st",    label: "SC/ST" },
  { id: "minority", label: "Minority" },
  { id: "special",  label: "Special Quota" },
];

const SPECIAL_CATS = ["ph", "cap", "ncc", "sports", "special"];

const PGECET_DOCUMENTS = [
  // 1. Entrance Exam Documents
  {
    id: "gate_score",
    name: "GATE / GPAT Score Card",
    note: "Required for candidates seeking admission via GATE/GPAT score. Valid score card for 2024, 2025, or 2026.",
    xeroxSets: 2,
    validity: "Valid for 3 years from exam date",
    categories: ["all", "oc", "ews", "bc", "sc", "st"]
  },
  {
    id: "pgecet_rank",
    name: "TG PGECET 2026 Rank Card & Hall Ticket",
    note: "Required for candidates seeking admission via PGECET. Must show HTNO and state rank clearly.",
    xeroxSets: 2,
    validity: "Original Rank Card + Hall Ticket",
    categories: ["all", "oc", "ews", "bc", "sc", "st"]
  },
  {
    id: "allotment_order",
    name: "Seat Allotment Order & Self-Reporting Confirmation",
    note: "Downloaded from the PGECET portal after allotment. Carry for help line verification and college reporting.",
    xeroxSets: 2,
    validity: "Fresh printout from official portal",
    categories: ["all", "oc", "ews", "bc", "sc", "st"]
  },

  // 2. Academic Certificates
  {
    id: "ssc_memo",
    name: "SSC or equivalent Marks Memo & Pass Certificate",
    note: "Used to verify candidate name, parent names, and Date of Birth.",
    xeroxSets: 2,
    validity: "Must match name in Aadhaar & Degree",
    categories: ["all", "oc", "ews", "bc", "sc", "st"]
  },
  {
    id: "inter_memo",
    name: "Intermediate (10+2) or Equivalent Marks Memo",
    note: "Pass memo / Consolidated Marks Memo of 10+2 or equivalent 3-year Diploma.",
    xeroxSets: 2,
    validity: "Board of Intermediate Education / Board of Tech Ed",
    categories: ["all", "oc", "ews", "bc", "sc", "st"]
  },
  {
    id: "degree_memo",
    name: "B.E. / B.Tech / B.Pharm Consolidated Marks Memo (All Semesters)",
    note: "Semester-wise marks memos of all semesters. General/BC candidates: ≥50% aggregate. SC/ST/PH: ≥45% aggregate.",
    xeroxSets: 2,
    validity: "University Consolidated Marks Memo",
    categories: ["all", "oc", "ews", "bc", "sc", "st"]
  },
  {
    id: "degree_provisional",
    name: "Provisional Degree Certificate (PDC)",
    note: "PDC or original degree certificate issued by the university last attended.",
    xeroxSets: 2,
    validity: "Competent University Registrar",
    categories: ["all", "oc", "ews", "bc", "sc", "st"]
  },
  {
    id: "tc",
    name: "Transfer Certificate (T.C.)",
    note: "T.C. issued by the institution last attended. Carry at HLC, final submission at college.",
    xeroxSets: 2,
    validity: "Original TC required",
    categories: ["all", "oc", "ews", "bc", "sc", "st"]
  },
  {
    id: "study_certs",
    name: "Study or Bonafide Certificates (Class 6 to Degree)",
    note: "Required to establish local region candidature (OU/KU/JNTUH) for 7 consecutive study years.",
    xeroxSets: 2,
    validity: "Signed by school and college heads",
    categories: ["all", "oc", "ews", "bc", "sc", "st"]
  },

  // 3. Identity & Category Certificates
  {
    id: "aadhaar",
    name: "Aadhaar Card (Original + Copy)",
    note: "Mandatory identity proof linked with mobile number. Name must match SSC record.",
    xeroxSets: 2,
    validity: "Valid UIDAI identity card",
    categories: ["all", "oc", "ews", "bc", "sc", "st"]
  },
  {
    id: "caste",
    name: "Integrated Community / Caste Certificate (SC / ST / BC)",
    note: "Required if claiming category seats or fee reimbursement. Must specify sub-group (e.g. BC-D).",
    xeroxSets: 2,
    validity: "Issued by Tahsildar via MeeSeva",
    categories: ["bc", "sc", "st"]
  },
  {
    id: "income",
    name: "Latest Income Certificate (issued after 01-01-2026)",
    note: "Mandatory for claiming Tuition Fee Reimbursement (TFR). Annual family income limit applies.",
    xeroxSets: 2,
    validity: "Must be issued on or after 01-01-2026",
    categories: ["bc", "sc", "st"]
  },
  {
    id: "ews_cert",
    name: "EWS Reservation Certificate",
    note: "For Economically Weaker Section candidates claiming 10% horizontal reservation.",
    xeroxSets: 2,
    validity: "Valid EWS certificate for 2026",
    categories: ["ews"]
  },
  {
    id: "minority_cert",
    name: "Minority Status Certificate",
    note: "For Muslim or Christian candidates claiming seats under minority quota. SSC TC showing religion is accepted.",
    xeroxSets: 2,
    validity: "TC or competent Minority Authority",
    categories: ["minority"]
  },

  // 4. Special Categories
  {
    id: "ph_cert",
    name: "Disability / PH (Physically Handicapped) Certificate",
    note: "SADAREM certificate with minimum 40% disability. Physical HLC attendance required.",
    xeroxSets: 2,
    validity: "SADAREM Medical Board Certificate",
    categories: ["special", "ph"]
  },
  {
    id: "ncc_cert",
    name: "NCC (National Cadet Corps) B or C Certificate",
    note: "Original certificates showing participation at school or college level.",
    xeroxSets: 2,
    validity: "DG NCC Authority",
    categories: ["special", "ncc"]
  },
  {
    id: "cap_cert",
    name: "CAP (Children of Armed Personnel) Certificate",
    note: "Ex-servicemen identity book / serving certificate from competent military record office.",
    xeroxSets: 2,
    validity: "Zilla Sainik Welfare Board",
    categories: ["special", "cap"]
  },
  {
    id: "sports_cert",
    name: "Sports Certificate (State/National Level)",
    note: "Participation certificate signed by sports federation and counter-signed by SATS.",
    xeroxSets: 2,
    validity: "Telangana Sports Authority (SATS)",
    categories: ["special", "sports"]
  },
  {
    id: "employer_cert",
    name: "Employer Certificate (for Sponsored Category)",
    note: "For sponsored M.Tech/M.Pharm seats. Showing minimum 2 years of continuous work experience.",
    xeroxSets: 2,
    validity: "From active employer / organization",
    categories: ["special"]
  }
];

function filterDocs(documents, pill) {
  switch (pill) {
    case "all":
      return documents;
    case "oc":
      return documents.filter(d => d.categories?.includes("all") || d.categories?.includes("oc"));
    case "ews":
      return documents.filter(d => d.categories?.includes("ews") || d.categories?.includes("all"));
    case "bc":
      return documents.filter(d => d.categories?.includes("bc") || d.categories?.includes("all"));
    case "sc_st":
      return documents.filter(d =>
        d.categories?.includes("sc") ||
        d.categories?.includes("st") ||
        d.categories?.includes("all")
      );
    case "minority":
      return documents.filter(d => d.categories?.includes("minority") || d.categories?.includes("all"));
    case "special":
      return documents.filter(d => d.categories?.some(c => SPECIAL_CATS.includes(c)));
    default:
      return documents;
  }
}

export function formatLastSaved(timestamp) {
  if (!timestamp) return null;
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diffMs = now - time;

  if (diffMs <= 60000 && diffMs >= -300000) return "Saved just now";

  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Saved just now";
  if (diffMins === 1) return "Last saved 1 minute ago";
  if (diffMins < 60) return `Last saved ${diffMins} minutes ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Last saved ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `Last saved ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export default function CertificateChecklist() {
  const {
    ticked,
    toggleDoc,
    isOffline,
  } = useChecklist("tg-pgecet");

  const [activePill, setActivePill] = useState("all");

  const filtered = useMemo(() => filterDocs(PGECET_DOCUMENTS, activePill), [activePill]);
  const tickedCount = filtered.filter(d => ticked.has(d.id)).length;
  
  // Since GATE score and PGECET rank are mutually exclusive, the max possible verified count is total - 1
  const hasBothEntranceDocs = useMemo(() => {
    return filtered.some(d => d.id === "gate_score") && filtered.some(d => d.id === "pgecet_rank");
  }, [filtered]);

  const totalCount = hasBothEntranceDocs ? filtered.length - 1 : filtered.length;
  const progress = totalCount ? (tickedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* ─── Eligibility Cards ─── */}
      <div className="no-print grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GATE Card */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 mb-3">
            <Star size={14} className="text-amber-400" /> GATE / GPAT ELIGIBILITY
          </h3>
          <ul className="text-xs text-white/70 space-y-2 list-disc list-inside">
            <li>Qualifying score: OC/EWS &ge; 25, BC &ge; 22.5, SC/ST/PH &ge; 16.67</li>
            <li>GATE score valid for 3 years (2024, 2025, or 2026 exam)</li>
            <li>GPAT qualified candidates &mdash; no minimum score required</li>
            <li>Degree: B.E./B.Tech in relevant discipline with &gt; 50% marks</li>
          </ul>
        </div>

        {/* PGECET Card */}
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 sm:p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 mb-3">
            <GraduationCap size={14} className="text-cyan-400" /> TG PGECET ELIGIBILITY
          </h3>
          <ul className="text-xs text-white/70 space-y-2 list-disc list-inside">
            <li>Min. percentile: OC/EWS &ge; 25th, BC &ge; 22.5th, SC/ST/PH &mdash; nil</li>
            <li>PGECET 2026 rank card with HTNO, percentile &amp; rank clearly visible</li>
            <li>Degree: B.E./B.Tech/B.Pharm/B.Sc (Engg) &ge; 50% (45% for SC/ST)</li>
            <li>Final year appearing candidates also eligible (provisional basis)</li>
          </ul>
        </div>
      </div>

      {/* ─── Main Checklist Container ─── */}
      <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6">
        <style>{`
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
          }
        `}</style>

        {/* Category Filter Pills */}
        <div className="no-print flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
          {CATEGORY_PILLS.map(pill => (
            <button
              key={pill.id}
              onClick={() => setActivePill(pill.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activePill === pill.id
                  ? "bg-purple-500/25 border border-purple-400/40 text-purple-200"
                  : "border border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Offline Alert */}
        {isOffline && (
          <div className="no-print mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-200">
            <span>📡 Offline &mdash; changes not synced. They will remain saved locally until connection returns.</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
             <p className="text-white/60 text-xs font-medium">
              {tickedCount} of {totalCount} documents verified
            </p>
            <p className="text-white/40 text-xs">{Math.round(progress)}%</p>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="no-print mb-5 flex items-center justify-end">
          <GlassButton
            size="sm"
            onClick={() => window.print()}
            contentClassName="flex items-center gap-1.5"
          >
            <Download size={13} />
            <span>Download Checklist</span>
          </GlassButton>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
          <table className="w-full text-sm min-w-[650px] border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-white/40 bg-white/[0.02]">
                <th className="py-3.5 px-4 text-left font-semibold w-8"></th>
                <th className="py-3.5 px-3 text-left font-semibold w-8">#</th>
                <th className="py-3.5 px-4 text-left font-semibold">Required Document</th>
                <th className="py-3.5 px-4 text-left font-semibold hidden sm:table-cell">MeeSeva / Authority Validity Rules</th>
                <th className="py-3.5 px-4 text-left font-semibold">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((doc, i) => {
                const isChecked = ticked.has(doc.id);
                const isDisabled =
                  (doc.id === "gate_score" && ticked.has("pgecet_rank")) ||
                  (doc.id === "pgecet_rank" && ticked.has("gate_score"));

                return (
                  <tr
                    key={doc.id}
                    onClick={() => {
                      if (isDisabled) return;
                      toggleDoc(doc.id);
                    }}
                    className={`transition-colors ${
                      isDisabled
                        ? "opacity-35 cursor-not-allowed select-none bg-black/40"
                        : isChecked
                        ? "bg-purple-950/20 cursor-pointer"
                        : "hover:bg-white/[0.02] cursor-pointer"
                    }`}
                  >
                    {/* Circular Checkbox */}
                    <td className="py-3.5 px-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isDisabled
                          ? "border-white/10 bg-black/40"
                          : isChecked
                          ? "bg-purple-500 border-purple-400"
                          : "border-white/20 bg-transparent"
                      }`}>
                        {isChecked && <Check size={11} className="text-white" strokeWidth={3} />}
                      </div>
                    </td>
                    
                    <td className="py-3.5 px-3 text-white/30 text-xs font-mono">{i + 1}</td>
                    
                    <td className="py-3.5 px-4">
                      <p className={`font-semibold ${isChecked ? "text-white/50 line-through" : "text-white/90"}`}>
                        {doc.name}
                      </p>
                      {doc.note && (
                        <p className="text-white/40 text-xs mt-0.5 max-w-xl">{doc.note}</p>
                      )}
                      {doc.xeroxSets && (
                        <p className="text-purple-300/60 text-[11px] mt-0.5">📋 {doc.xeroxSets} photocopy sets required</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      {doc.validity && (
                        <span className="text-amber-300/80 text-xs">{doc.validity}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isChecked ? (
                        <span className="inline-flex items-center gap-1 bg-green-500/15 border border-green-500/20 text-green-300 text-xs px-2.5 py-0.5 rounded-full font-medium">
                          Ready ✅
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 text-white/40 text-xs px-2.5 py-0.5 rounded-full font-medium">
                          Pending ⏳
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-white/30 py-8 text-sm">No documents for this category.</p>
          )}
        </div>
      </div>
    </div>
  );
}
