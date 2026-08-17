import { useState } from 'react';
import { LineChart, TrendingUp, Minus, Flame, Sparkles } from 'lucide-react';
import { ICET_INSTITUTIONS } from '../../data/icetInstitutions';

const PROGRAM_OPTIONS = [
  { code: 'MBA', label: 'MBA' },
  { code: 'MCA', label: 'MCA' },
];

const TOP_TRAJECTORY_CODES = {
  MBA: ['OUCB', 'JNTM', 'NIZBSF', 'KUCV', 'CBIT', 'BDRK', 'MVSR'],
  MCA: ['JNTH', 'OUCESF', 'CBIT', 'OUPSSF', 'OUSCSF', 'NIZBSF', 'KUCS']
};

export default function CutoffTrendAnalyzer() {
  const [selectedProgram, setSelectedProgram] = useState('MBA');
  const progLower = selectedProgram.toLowerCase();
  const topCodes = TOP_TRAJECTORY_CODES[selectedProgram] || [];

  // Filter and sort exactly the top 7 premier colleges
  const eligibleColleges = topCodes
    .map(code => ICET_INSTITUTIONS.find(c => c.code === code))
    .filter(Boolean);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300">
            <LineChart size={16} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Top 7 Multi-Year Cutoff Trajectory &amp; Shifts (2022–2025)</h3>
            <p className="text-xs text-white/50">Tracking closing rank movement and competition across 2022, 2023, 2024, and 2025</p>
          </div>
        </div>

        {/* Program Selector */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {PROGRAM_OPTIONS.map((p) => (
            <button
              key={p.code}
              onClick={() => setSelectedProgram(p.code)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                selectedProgram === p.code
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trajectory Table */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-white/40 bg-white/[0.02]">
              <th className="py-3.5 px-4 sm:px-6 text-left font-semibold">Institution</th>
              <th className="py-3.5 px-4 sm:px-6 text-center font-semibold">2022 Cutoff</th>
              <th className="py-3.5 px-4 sm:px-6 text-center font-semibold">2023 Cutoff</th>
              <th className="py-3.5 px-4 sm:px-6 text-center font-semibold">2024 Cutoff</th>
              <th className="py-3.5 px-4 sm:px-6 text-center font-semibold text-purple-300">2025 Final Cutoff</th>
              <th className="py-3.5 px-4 sm:px-6 text-right font-semibold">Competition Shift</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {eligibleColleges.map((c) => {
              const r22 = c.cutoffHistory?.['2022']?.[progLower]?.oc || 0;
              const r23 = c.cutoffHistory?.['2023']?.[progLower]?.oc || 0;
              const r24 = c.cutoffHistory?.['2024']?.[progLower]?.oc || 0;
              const r25 = c.cutoffHistory?.['2025']?.[progLower]?.oc || 0;

              const isTougher = r25 < r22 && r25 > 0;
              const diff = Math.abs(r22 - r25);

              return (
                <tr key={c.code} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-white">
                    <span className="font-mono text-xs font-bold text-purple-300 mr-2 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-500/20">
                      {c.code}
                    </span>
                    <span className="truncate max-w-[240px] inline-block align-bottom" title={c.name}>{c.shortName || c.name}</span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-center font-mono text-white/60">
                    {r22 ? `~${r22.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-center font-mono text-white/80">
                    {r23 ? `~${r23.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-center font-mono text-white/90">
                    {r24 ? `~${r24.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-center font-mono font-bold text-purple-200">
                    {r25 ? `~${r25.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    {isTougher ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300">
                        <TrendingUp size={11} className="rotate-45" />
                        <span>Rising (+{diff} ranks harder)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                        <Minus size={11} />
                        <span>Stable / Easing</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
