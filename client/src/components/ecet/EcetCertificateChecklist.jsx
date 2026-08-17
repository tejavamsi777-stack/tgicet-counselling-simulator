import { useState, useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  Circle,
  Download,
  Printer,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useChecklist } from '../../hooks/useChecklist';
import { ECET_DOCUMENTS } from '../../hooks/useEcetData';

export default function EcetCertificateChecklist() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { checkedItems, toggleItem, syncStatus } = useChecklist('tg-ecet');

  const categories = ['All', 'OC', 'EWS', 'BC', 'SC/ST', 'Minority', 'Special Quota'];

  const filteredDocs = useMemo(() => {
    if (selectedCategory === 'All') return ECET_DOCUMENTS;
    return ECET_DOCUMENTS.filter(
      (d) => d.applicableFor.includes('All') || d.applicableFor.includes(selectedCategory)
    );
  }, [selectedCategory]);

  const totalRequired = filteredDocs.length;
  const totalChecked = filteredDocs.filter((d) => checkedItems[d.id]).length;
  const progressPercent = Math.round((totalChecked / (totalRequired || 1)) * 100);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ── Progress & Action Bar ───────────────────────────────────── */}
      <div className="rounded-3xl border border-white/[0.08] bg-black/50 p-5 sm:p-7 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-xs font-semibold text-purple-300 mb-1.5">
              <ShieldCheck size={13} />
              <span>HLC Verification Readiness</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              TG ECET 2026 Certificate Verification Checklist
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer"
            >
              <Printer size={14} />
              <span>Print Checklist</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-white/60">
              Readiness: <b className="text-purple-300">{totalChecked}</b> of <b className="text-white">{totalRequired}</b> documents ready
            </span>
            <span className="font-bold text-purple-300">{progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mt-5 pt-4 border-t border-white/10">
          <span className="text-xs text-white/40 mr-1">Filter by Quota:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Document Items List ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredDocs.map((doc, idx) => {
          const isChecked = !!checkedItems[doc.id];

          return (
            <div
              key={doc.id}
              onClick={() => toggleItem(doc.id)}
              className={`rounded-2xl border p-4 transition-all duration-200 cursor-pointer flex items-start gap-3.5 ${
                isChecked
                  ? 'border-emerald-500/40 bg-emerald-950/20 shadow-md shadow-emerald-950/30'
                  : 'border-white/[0.06] bg-black/40 hover:border-white/20'
              }`}
            >
              <button
                type="button"
                className={`mt-0.5 shrink-0 transition-colors ${
                  isChecked ? 'text-emerald-400' : 'text-white/30 hover:text-white/60'
                }`}
              >
                {isChecked ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-mono font-bold text-white/40">#{idx + 1}</span>
                  <h4 className={`text-sm font-bold tracking-tight ${isChecked ? 'text-emerald-200 line-through opacity-90' : 'text-white'}`}>
                    {doc.name}
                  </h4>
                  {doc.required && (
                    <span className="rounded bg-rose-500/20 border border-rose-500/30 px-1.5 py-0.2 text-[9px] font-bold text-rose-300 uppercase">
                      Mandatory
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{doc.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
