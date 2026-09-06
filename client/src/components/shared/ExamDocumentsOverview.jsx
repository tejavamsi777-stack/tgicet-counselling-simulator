import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCheck, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  ClipboardCheck, 
  ExternalLink,
  Info
} from 'lucide-react';
import { GlassButton } from '../ui/glass-button';

const DEFAULT_DOCUMENTS = [
  {
    name: "Entrance Exam Rank Card & Hall Ticket",
    desc: "Original scorecard and admit card downloaded from the official admission portal.",
    tag: "Mandatory for All",
    tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
  },
  {
    name: "SSC (10th) / Equivalent Marks Memo",
    desc: "Proof of date of birth (DOB) and foundation academic qualification.",
    tag: "Mandatory for All",
    tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
  },
  {
    name: "Qualifying Examination Marks Memo",
    desc: "Intermediate (10+2) / Diploma / Degree pass certificate with consolidated marks.",
    tag: "Mandatory for All",
    tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
  },
  {
    name: "Transfer Certificate (T.C.)",
    desc: "Original T.C. issued by the head of the institution last studied.",
    tag: "Mandatory at Reporting",
    tagColor: "bg-purple-500/20 text-purple-300 border-purple-500/30"
  },
  {
    name: "Study & Bonafide Certificates (7 Consecutive Years)",
    desc: "From Class 6 to qualifying exam to confirm local residential status (OU/AU/SVU).",
    tag: "Local Status Proof",
    tagColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
  },
  {
    name: "Integrated Community Certificate (Caste)",
    desc: "MeeSeva-issued certificate for BC, SC, and ST category reservation benefits.",
    tag: "Category Specific",
    tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
  },
  {
    name: "Income Certificate / Ration Card",
    desc: "Issued on or after official financial cutoff date for government fee reimbursement.",
    tag: "Fee Reimbursement",
    tagColor: "bg-lime-500/20 text-lime-300 border-lime-500/30"
  },
  {
    name: "EWS / Special Category Certificate",
    desc: "Economically Weaker Section or PH, CAP, NCC, Sports certificates for quota seats.",
    tag: "Quota Specific",
    tagColor: "bg-rose-500/20 text-rose-300 border-rose-500/30"
  }
];

export default function ExamDocumentsOverview({
  examName = "TG EAPCET",
  checklistPath = "/tg-eapcet/documents",
  customDocs = null,
  hlcNote = null
}) {
  const docs = customDocs || DEFAULT_DOCUMENTS;

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-black/40 p-4 sm:p-5 backdrop-blur-xl shadow-lg relative overflow-hidden text-left">
      <div className="relative z-10">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3.5 mb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-purple-500/30 bg-purple-500/10 text-purple-300">
                <ClipboardCheck size={14} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Documents Needed for {examName} Verification
              </h2>
            </div>
            <p className="mt-1 text-[11px] text-gray-400 max-w-xl">
              Original certificates + 2 sets of self-attested photocopies required for slot verification.
            </p>
          </div>

          {/* Interactive HLC Checklist / Documents Checklist CTA Button */}
          <Link to={checklistPath} className="self-start sm:self-auto shrink-0">
            <GlassButton
              size="sm"
              contentClassName="flex items-center justify-center gap-1.5 text-xs font-semibold"
            >
              <span>Documents Checklist (To Understand Better)</span>
              <ArrowRight size={13} />
            </GlassButton>
          </Link>
        </div>

        {/* 8 Essential Document Cards Grid - Compact & Tight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 mb-3">
          {docs.map((doc, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-2.5 sm:p-3 transition-all flex flex-col justify-between group hover:border-purple-500/30"
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 shrink-0">
                    <CheckCircle2 size={12} />
                  </div>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${doc.tagColor}`}>
                    {doc.tag}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white mb-1 group-hover:text-purple-200 transition-colors leading-snug line-clamp-1">
                  {doc.name}
                </h3>
                <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2">
                  {doc.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* HLC Notice & Full Checklist Banner - Slim strip */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Info size={13} className="text-purple-300 shrink-0" />
            <p className="text-[11px] text-gray-300 leading-normal">
              <span className="font-semibold text-white">HLC Physical Verification: </span>
              {hlcNote || "Carry 1 set of originals and 2 sets of xerox copies. Special categories (PH/CAP/NCC/Sports) verify at nodal centres."}
            </p>
          </div>

          <Link
            to={checklistPath}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-300 hover:text-white transition-colors shrink-0 whitespace-nowrap self-end sm:self-auto"
          >
            <span>Open Checklist</span>
            <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </section>
  );
}
