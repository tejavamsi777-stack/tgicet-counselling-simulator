import { useState } from 'react';
import { FileCheck, CheckCircle2, Circle, Star, GraduationCap, Users, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';

/* ─── Document definitions ─── */
const SECTIONS = [
  {
    id: 'entrance',
    label: 'Entrance Exam Documents',
    color: 'amber',
    icon: Star,
    note: 'Carry originals + 2 sets of self-attested photocopies',
    docs: [
      {
        id: 'gate_card',
        title: 'GATE / GPAT Score Card',
        desc: 'Required only for candidates admitted via GATE/GPAT score. Must show valid score for 2024 or 2025 examination.',
        tag: 'GATE/GPAT only',
        tagColor: 'amber',
        mandatory: false,
        detail: 'GATE score is valid for 3 years. Minimum qualifying score: OC/EWS — 25, BC — 22.5, SC/ST/PH — 16.67 (out of 100). GPAT qualified candidates must carry GPAT score card with percentile.',
      },
      {
        id: 'pgecet_rank',
        title: 'TG PGECET 2026 Rank Card & Hall Ticket',
        desc: 'Required for candidates admitted via TG PGECET rank. Must show HTNO, percentile, and state rank clearly.',
        tag: 'TG PGECET only',
        tagColor: 'cyan',
        mandatory: false,
        detail: 'Minimum qualifying criteria: OC — 25th percentile, BC — 22.5th percentile, SC/ST/PH — no minimum percentile. Rank card must match registration number used during web options entry.',
      },
      {
        id: 'allotment_order',
        title: 'Seat Allotment Order (Phase I / Phase II)',
        desc: 'Downloaded from pgecetadm.tgche.ac.in after seat allotment. Print and carry for HLC verification.',
        tag: 'All candidates',
        tagColor: 'purple',
        mandatory: true,
        detail: 'Allotment order contains your unique allotment ID, allotted college code, branch, category, and fee details. Required at both HLC and at the allotted college.',
      },
    ],
  },
  {
    id: 'academic',
    label: 'Academic / Educational Certificates',
    color: 'purple',
    icon: GraduationCap,
    note: 'All marks memos must show aggregated marks / CGPA',
    docs: [
      {
        id: 'ssc',
        title: 'SSC / 10th Class Marks Memo & Pass Certificate',
        desc: 'Proof of date of birth, father/mother name. The name must match Aadhaar and degree certificate exactly.',
        tag: 'All candidates',
        tagColor: 'purple',
        mandatory: true,
        detail: null,
      },
      {
        id: 'inter',
        title: 'Intermediate (+2) Marks Memo or Diploma Certificate',
        desc: '10+2 (PCM/PCB) pass certificate or 3-year polytechnic diploma in relevant engineering stream.',
        tag: 'All candidates',
        tagColor: 'purple',
        mandatory: true,
        detail: null,
      },
      {
        id: 'degree_marks',
        title: 'B.E. / B.Tech / B.Pharm Consolidated Marks Memo (All Semesters)',
        desc: 'Semester-wise marks memos from 1st to final semester. Minimum 50% aggregate (45% for SC/ST) in qualifying degree.',
        tag: 'All candidates',
        tagColor: 'purple',
        mandatory: true,
        detail: 'For GATE candidates, qualifying degree must be in the relevant discipline. For PGECET, the qualifying exam must be B.E./B.Tech/B.Pharm/B.Sc (Engg) with ≥50% marks (≥45% for SC/ST/PH).',
      },
      {
        id: 'provisional',
        title: 'Provisional Certificate or Degree Certificate',
        desc: 'Issued by the university after final semester. If awaiting results, a course completion letter/memo is accepted temporarily.',
        tag: 'All candidates',
        tagColor: 'purple',
        mandatory: true,
        detail: null,
      },
      {
        id: 'tc',
        title: 'Transfer Certificate (T.C.) from Last Attended Institution',
        desc: 'Original TC is submitted at the time of final reporting to the allotted college. Carry at HLC for verification.',
        tag: 'All candidates',
        tagColor: 'purple',
        mandatory: true,
        detail: null,
      },
      {
        id: 'study',
        title: 'Study / Bonafide Certificates (Class 6 through Graduation)',
        desc: 'Needed to establish local candidature under Osmania / Kakatiya / JNTUH university jurisdiction for 7 or more consecutive years.',
        tag: 'Local category candidates',
        tagColor: 'green',
        mandatory: false,
        detail: 'Candidates who studied in Telangana for 4–6 years of schooling and remaining in Telangana for graduation qualify as local candidates. Non-local candidates must declare so during web options.',
      },
    ],
  },
  {
    id: 'identity',
    label: 'Identity & Category Certificates',
    color: 'cyan',
    icon: Users,
    note: 'Category certificates must be from a competent Telangana authority (MRO / Tahsildar)',
    docs: [
      {
        id: 'aadhaar',
        title: 'Aadhaar Card (Original + Photocopy)',
        desc: 'Mandatory for all candidates. Name and date of birth must match SSC and degree records. Biometric-linked Aadhaar preferred.',
        tag: 'All candidates',
        tagColor: 'purple',
        mandatory: true,
        detail: null,
      },
      {
        id: 'caste',
        title: 'Integrated Community / Caste Certificate (SC / ST / BC)',
        desc: 'Issued by MRO / Tahsildar through MeeSeva portal. Must specify community (e.g., BC-B, SC, ST). Digital-signed certificates accepted.',
        tag: 'SC / ST / BC candidates',
        tagColor: 'rose',
        mandatory: false,
        detail: 'BC candidates: must clearly mention group (BC-A, BC-B, BC-C, BC-D, BC-E). For Muslims claiming BC-E, minority status certificate may be required additionally.',
      },
      {
        id: 'income',
        title: 'Latest Income Certificate (issued after 01-01-2026)',
        desc: 'Mandatory for Tuition Fee Reimbursement (TFR) eligibility. Annual family income must be ≤ ₹2.5 lakh for full waiver.',
        tag: 'TFR / Fee waiver',
        tagColor: 'green',
        mandatory: false,
        detail: 'Income certificate issued before 01-01-2026 will not be accepted. Must be issued by MRO/Tahsildar through MeeSeva. Required for SC/ST/BC candidates claiming fee reimbursement.',
      },
      {
        id: 'ews',
        title: 'EWS Certificate (Economically Weaker Sections)',
        desc: 'Valid for 2025–2026 academic year. Issued by Tahsildar under G.O.Ms No. 244. Annual family income ≤ ₹8 lakh.',
        tag: 'EWS candidates',
        tagColor: 'teal',
        mandatory: false,
        detail: 'EWS candidates who are not SC/ST/BC are eligible for 10% horizontal reservation. Certificate must be for the current academic year.',
      },
      {
        id: 'minority',
        title: 'Minority Certificate (Muslim / Christian candidates)',
        desc: 'Required if claiming seats under minority quota. Issued by authorised minority commission authority or SSC TC containing religion.',
        tag: 'Minority candidates',
        tagColor: 'indigo',
        mandatory: false,
        detail: null,
      },
    ],
  },
  {
    id: 'special',
    label: 'Special Category Certificates',
    color: 'rose',
    icon: AlertTriangle,
    note: 'Special category candidates must attend physical HLC verification — online verification is NOT sufficient',
    docs: [
      {
        id: 'ph',
        title: 'Disability Certificate (PH / Divyangjan)',
        desc: 'Certificate from District Medical Board (≥40% disability). Required for 3% horizontal reservation under PH category.',
        tag: 'PH candidates',
        tagColor: 'rose',
        mandatory: false,
        detail: null,
      },
      {
        id: 'ncc',
        title: 'NCC Certificate (B or C grade)',
        desc: 'Valid NCC certificate for current or previous 2 academic years. Required for NCC special category seats.',
        tag: 'NCC candidates',
        tagColor: 'green',
        mandatory: false,
        detail: null,
      },
      {
        id: 'cap',
        title: 'CAP Certificate (Children of Armed Personnel)',
        desc: 'Service/pension certificate of parent/spouse in Indian Armed Forces. Issued by Commanding Officer / Record Office.',
        tag: 'CAP candidates',
        tagColor: 'slate',
        mandatory: false,
        detail: null,
      },
      {
        id: 'sports',
        title: 'Sports / Games Certificate',
        desc: 'Participation/achievement certificate in State/National level sports. Verified by Telangana Sports Authority.',
        tag: 'Sports candidates',
        tagColor: 'orange',
        mandatory: false,
        detail: null,
      },
      {
        id: 'employer',
        title: 'Employer Certificate (Govt. / PSU employees\' children)',
        desc: 'For children of State/Central Govt., Public Sector Corporation employees posted in Telangana for ≥10 years.',
        tag: 'Govt. employee children',
        tagColor: 'blue',
        mandatory: false,
        detail: null,
      },
    ],
  },
];

const TAG_STYLES = {
  amber:  'border-amber-400/40 bg-amber-500/10 text-amber-300',
  cyan:   'border-cyan-400/40 bg-cyan-500/10 text-cyan-300',
  purple: 'border-purple-400/40 bg-purple-500/10 text-purple-300',
  green:  'border-green-400/40 bg-green-500/10 text-green-300',
  rose:   'border-rose-400/40 bg-rose-500/10 text-rose-300',
  teal:   'border-teal-400/40 bg-teal-500/10 text-teal-300',
  indigo: 'border-indigo-400/40 bg-indigo-500/10 text-indigo-300',
  slate:  'border-slate-400/40 bg-slate-500/10 text-slate-300',
  orange: 'border-orange-400/40 bg-orange-500/10 text-orange-300',
  blue:   'border-blue-400/40 bg-blue-500/10 text-blue-300',
};

const SECTION_COLORS = {
  amber:  { border: 'border-amber-500/25',  header: 'text-amber-300', icon: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-400/30' },
  purple: { border: 'border-purple-500/25', header: 'text-purple-300', icon: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-400/30' },
  cyan:   { border: 'border-cyan-500/25',   header: 'text-cyan-300', icon: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-400/30' },
  rose:   { border: 'border-rose-500/25',   header: 'text-rose-300', icon: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-400/30' },
};

function DocItem({ doc, checked, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const tagStyle = TAG_STYLES[doc.tagColor] || TAG_STYLES.purple;
  return (
    <div className={`rounded-xl border transition ${checked ? 'border-white/10 bg-white/[0.02]' : 'border-white/[0.06] bg-black/20'}`}>
      <label className="flex items-start gap-3 p-3.5 cursor-pointer select-none">
        <button
          type="button"
          onClick={onToggle}
          className="mt-0.5 shrink-0 transition"
        >
          {checked
            ? <CheckCircle2 size={18} className="text-green-400" />
            : <Circle size={18} className="text-white/30" />
          }
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs sm:text-sm font-semibold ${checked ? 'line-through text-white/35' : 'text-white'}`}>
              {doc.title}
            </span>
            {doc.mandatory && (
              <span className="rounded border border-red-400/40 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-300">Required</span>
            )}
          </div>
          <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold mt-1 ${tagStyle}`}>{doc.tag}</span>
          <p className={`text-[11px] mt-1.5 leading-relaxed ${checked ? 'text-white/30' : 'text-white/50'}`}>{doc.desc}</p>
          {doc.detail && (
            <button
              type="button"
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 mt-1.5 text-[11px] text-purple-400 hover:text-purple-300 transition"
            >
              <Info size={11} />
              {expanded ? 'Hide details' : 'Show eligibility details'}
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          )}
          {expanded && doc.detail && (
            <div className="mt-2 rounded-lg border border-purple-500/20 bg-purple-500/5 p-2.5 text-[11px] text-purple-200/80 leading-relaxed">
              {doc.detail}
            </div>
          )}
        </div>
      </label>
    </div>
  );
}

export default function CertificateChecklist() {
  const [checked, setChecked] = useState({});

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const allDocs = SECTIONS.flatMap(s => s.docs);
  const mandatoryDocs = allDocs.filter(d => d.mandatory);
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const mandatoryChecked = mandatoryDocs.filter(d => checked[d.id]).length;
  const readyPct = Math.round((checkedCount / allDocs.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header + Progress */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#120a22]/90 via-[#180f2d]/90 to-[#0c0616]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-2 text-purple-400">
              <FileCheck size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">HLC Certificate Verification Checklist</h3>
              <p className="text-xs text-white/50">
                Document readiness tracker for TG PGECET 2026 Help Line Centre verification
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-full border border-purple-400/30 bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300">
              {checkedCount} / {allDocs.length} Checked
            </div>
            <div className={`rounded-full border px-3 py-1 text-xs font-bold ${mandatoryChecked === mandatoryDocs.length ? 'border-green-400/30 bg-green-500/20 text-green-300' : 'border-red-400/30 bg-red-500/10 text-red-300'}`}>
              {mandatoryChecked}/{mandatoryDocs.length} Required ✓
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex justify-between text-[11px] text-white/40 mb-1.5">
            <span>Overall readiness</span>
            <span className="font-mono font-bold text-purple-300">{readyPct}%</span>
          </div>
          <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${readyPct}%` }}
            />
          </div>
        </div>

        {/* Quick eligibility box */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star size={14} className="text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">GATE / GPAT Eligibility</span>
            </div>
            <ul className="space-y-1 text-[11px] text-white/60">
              <li>• Qualifying score: OC/EWS ≥ 25, BC ≥ 22.5, SC/ST/PH ≥ 16.67</li>
              <li>• GATE score valid for 3 years (2024 or 2025 exam)</li>
              <li>• GPAT qualified candidates — no minimum score required</li>
              <li>• Degree: B.E./B.Tech in relevant discipline with ≥ 50% marks</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap size={14} className="text-cyan-400 shrink-0" />
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">TG PGECET Eligibility</span>
            </div>
            <ul className="space-y-1 text-[11px] text-white/60">
              <li>• Min. percentile: OC/EWS ≥ 25th, BC ≥ 22.5th, SC/ST/PH — nil</li>
              <li>• PGECET 2026 rank card with HTNO, percentile &amp; rank clearly visible</li>
              <li>• Degree: B.E./B.Tech/B.Pharm/B.Sc (Engg) ≥ 50% (45% for SC/ST)</li>
              <li>• Final year appearing candidates also eligible (provisional basis)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map(section => {
        const sc = SECTION_COLORS[section.color] || SECTION_COLORS.purple;
        const SIcon = section.icon;
        return (
          <div key={section.id} className={`rounded-3xl border ${sc.border} bg-black/40 p-5 sm:p-6 shadow-xl`}>
            <div className="flex items-center gap-2.5 mb-1">
              <div className={`rounded-xl border p-1.5 ${sc.bg}`}>
                <SIcon size={16} className={sc.icon} />
              </div>
              <h4 className={`text-sm sm:text-base font-bold ${sc.header}`}>{section.label}</h4>
            </div>
            {section.note && (
              <p className="text-[11px] text-white/40 mb-4 ml-9">{section.note}</p>
            )}
            <div className="space-y-2 mt-3">
              {section.docs.map(doc => (
                <DocItem
                  key={doc.id}
                  doc={doc}
                  checked={!!checked[doc.id]}
                  onToggle={() => toggle(doc.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      <p className="text-center text-[11px] text-white/30 pb-2">
        Document requirements based on official <span className="text-purple-300">tgche.ac.in</span> guidelines &amp; <span className="text-purple-300">pgecetadm.tgche.ac.in</span> · TG PGECET 2026
      </p>
    </div>
  );
}
