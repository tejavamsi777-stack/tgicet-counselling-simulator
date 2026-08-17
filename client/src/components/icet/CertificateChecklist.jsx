import { useState, useMemo } from 'react';
import { Download, Check } from 'lucide-react';
import { GlassButton } from '../ui/glass-button';
import { useChecklist } from '../../hooks/useChecklist';

const CATEGORY_PILLS = [
  { id: 'all',      label: 'All' },
  { id: 'oc',       label: 'OC (General)' },
  { id: 'ews',      label: 'EWS' },
  { id: 'bc',       label: 'BC' },
  { id: 'sc_st',    label: 'SC/ST' },
  { id: 'minority', label: 'Minority' },
  { id: 'special',  label: 'Special Quota' },
];

const SPECIAL_CATS = ['ph', 'cap', 'ncc', 'sports'];

function filterDocs(documents, pill) {
  switch (pill) {
    case 'all':
      return documents;
    case 'oc':
      return documents.filter(d => d.categories?.includes('all'));
    case 'ews':
      return documents.filter(d => d.categories?.includes('ews') || d.categories?.includes('all'));
    case 'bc':
      return documents.filter(d => d.categories?.includes('bc') || d.categories?.includes('all'));
    case 'sc_st':
      return documents.filter(d =>
        d.categories?.includes('sc') ||
        d.categories?.includes('st') ||
        d.categories?.includes('all')
      );
    case 'minority':
      return documents.filter(d => d.categories?.includes('minority') || d.categories?.includes('all'));
    case 'special':
      return documents.filter(d => d.categories?.some(c => SPECIAL_CATS.includes(c)));
    default:
      return documents;
  }
}

export default function CertificateChecklist({ documents = [], examSlug = 'tg-icet' }) {
  const { ticked, toggleDoc } = useChecklist(examSlug);
  const [activePill, setActivePill] = useState('all');

  const filtered = useMemo(() => filterDocs(documents, activePill), [documents, activePill]);
  const tickedCount = filtered.filter(d => ticked.has(d.id)).length;
  const progress = filtered.length ? (tickedCount / filtered.length) * 100 : 0;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6">
      <style>{'@media print { .no-print { display: none !important; } .print-only { display: block !important; } }'}</style>

      {/* Category filter pills */}
      <div className="no-print flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        {CATEGORY_PILLS.map(pill => (
          <button
            key={pill.id}
            onClick={() => setActivePill(pill.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activePill === pill.id
                ? 'bg-purple-500/25 border border-purple-400/40 text-purple-200'
                : 'border border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <p className="text-white/60 text-xs font-medium">
            {tickedCount} of {filtered.length} documents verified
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

      {/* Download button */}
      <div className="no-print mb-5 flex justify-end">
        <GlassButton
          size="sm"
          onClick={() => window.print()}
          contentClassName="flex items-center gap-1.5"
        >
          <Download size={13} />
          <span>Download Checklist</span>
        </GlassButton>
      </div>

      {/* Documents table */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
        <table className="w-full text-sm">
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
              return (
                <tr
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`cursor-pointer transition-colors ${
                    isChecked ? 'bg-purple-950/20' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Custom circular checkbox */}
                  <td className="py-3.5 px-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isChecked
                        ? 'bg-purple-500 border-purple-400'
                        : 'border-white/20 bg-transparent'
                    }`}>
                      {isChecked && <Check size={11} className="text-white" strokeWidth={3} />}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-white/30 text-xs">{i + 1}</td>
                  <td className="py-3.5 px-4">
                    <p className={`font-semibold ${isChecked ? 'text-white/50 line-through' : 'text-white/90'}`}>
                      {doc.name}
                    </p>
                    {(doc.purpose || doc.note) && (
                      <p className="text-white/40 text-xs mt-0.5">{doc.purpose || doc.note}</p>
                    )}
                    {doc.xeroxSets && (
                      <p className="text-purple-300/60 text-[11px] mt-0.5">📋 {doc.xeroxSets} photocopy set{doc.xeroxSets > 1 ? 's' : ''} required</p>
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
  );
}
