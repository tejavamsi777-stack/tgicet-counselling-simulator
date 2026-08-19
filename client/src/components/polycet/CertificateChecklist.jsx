import { useState, useMemo } from 'react';
import { Download, Check, Printer, Save, RefreshCw } from 'lucide-react';
import { GlassButton } from '../ui/glass-button';
import { useChecklist } from '../../hooks/useChecklist';

const CATEGORY_PILLS = [
  { id: 'all', label: 'All' },
  { id: 'oc', label: 'OC (General)' },
  { id: 'ews', label: 'EWS' },
  { id: 'bc', label: 'BC' },
  { id: 'sc_st', label: 'SC/ST' },
  { id: 'minority', label: 'Minority' },
  { id: 'special', label: 'Special Quota' },
];

const SPECIAL_CATS = ['ph', 'cap', 'ncc', 'sports'];

function filterDocs(documents, pill) {
  switch (pill) {
    case 'all':
      return documents;
    case 'oc':
      return documents.filter((d) => d.categories?.includes('all'));
    case 'ews':
      return documents.filter((d) => d.categories?.includes('ews') || d.categories?.includes('all'));
    case 'bc':
      return documents.filter((d) => d.categories?.includes('bc') || d.categories?.includes('all'));
    case 'sc_st':
      return documents.filter(
        (d) => d.categories?.includes('sc') || d.categories?.includes('st') || d.categories?.includes('all')
      );
    case 'minority':
      return documents.filter((d) => d.categories?.includes('minority') || d.categories?.includes('all'));
    case 'special':
      return documents.filter((d) => d.categories?.some((c) => SPECIAL_CATS.includes(c)));
    default:
      return documents;
  }
}

export default function CertificateChecklist({ documents = [], examSlug = 'tg-polycet' }) {
  const {
    ticked,
    toggleDoc,
    saveChecklist,
    isSaving,
    saveSuccess,
    saveError,
    isRegisteredUser
  } = useChecklist(examSlug);
  const [activePill, setActivePill] = useState('all');

  const filtered = useMemo(() => filterDocs(documents, activePill), [documents, activePill]);
  const tickedCount = filtered.filter((d) => ticked.has(d.id)).length;
  const progress = filtered.length ? (tickedCount / filtered.length) * 100 : 0;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6">
      <style>{'@media print { .no-print { display: none !important; } .print-only { display: block !important; } }'}</style>

      {/* Category filter pills */}
      <div className="no-print flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        {CATEGORY_PILLS.map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => setActivePill(pill.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activePill === pill.id
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-white/10'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-white/70">
          <span>HLC Document Verification Progress</span>
          <span>
            {tickedCount} of {filtered.length} documents ready ({Math.round(progress)}%)
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Save & Download Action Buttons */}
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        {isRegisteredUser && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 max-w-full">
            <button
              onClick={saveChecklist}
              disabled={isSaving}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50 ${
                saveSuccess
                  ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-200'
                  : saveError
                  ? 'bg-rose-600/30 border border-rose-500/50 text-rose-200'
                  : 'bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200'
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw size={13} className="animate-spin text-purple-300" />
                  <span>Saving...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-300 font-bold">✓ Saved & Synced</span>
                </>
              ) : (
                <>
                  <Save size={13} className="text-purple-300" />
                  <span>Save & Sync Across Devices</span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="ml-auto">
          <GlassButton
            size="sm"
            onClick={() => window.print()}
            contentClassName="flex items-center gap-1.5"
          >
            <Download size={13} />
            <span>Download Checklist</span>
          </GlassButton>
        </div>
      </div>

      {/* Documents table / list */}
      <div className="space-y-3">
        {filtered.map((doc) => {
          const isTicked = ticked.has(doc.id);
          return (
            <div
              key={doc.id}
              onClick={() => toggleDoc(doc.id)}
              className={`flex items-start gap-4 rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
                isTicked
                  ? 'border-green-500/30 bg-green-950/15'
                  : 'border-white/[0.06] bg-white/[0.01] hover:border-white/15'
              }`}
            >
              {/* Checkbox */}
              <div
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                  isTicked
                    ? 'border-green-400 bg-green-500 text-black'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                {isTicked && <Check size={12} strokeWidth={3} />}
              </div>

              {/* Text details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className={`text-sm font-semibold ${isTicked ? 'text-green-200 line-through' : 'text-white'}`}>
                    {doc.name}
                  </h4>
                  {doc.xeroxSets && (
                    <span className="text-[11px] text-white/40 font-mono">
                      {doc.xeroxSets} Sets Xerox + Original
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50 mt-0.5">{doc.purpose}</p>
                {doc.validity && (
                  <p className="text-[11px] text-purple-300/80 mt-1">
                    <span className="text-white/40">Requirement: </span>
                    {doc.validity}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Print action */}
      <div className="no-print mt-6 flex justify-end">
        <GlassButton
          size="sm"
          onClick={() => window.print()}
          contentClassName="flex items-center gap-1.5 text-xs"
        >
          <Printer size={13} />
          <span>Print Checklist</span>
        </GlassButton>
      </div>
    </div>
  );
}
