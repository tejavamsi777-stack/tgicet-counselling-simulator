import { useState, useEffect } from 'react';
import { LineChart, TrendingDown, TrendingUp, Minus, Sparkles } from 'lucide-react';
import { apEapcetApi } from '../../lib/apEapcetApi';

const BRANCHES = [
  { code: 'CSE', label: 'CSE' },
  { code: 'CSM', label: 'AI & ML' },
  { code: 'INF', label: 'IT' },
  { code: 'ECE', label: 'ECE' },
  { code: 'EEE', label: 'EEE' },
];

export default function CutoffTrendAnalyzer() {
  const [branch, setBranch] = useState('CSE');
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apEapcetApi.getColleges({ branch, sort: 'rank' })
      .then((res) => {
        if (res.data) setColleges(res.data.slice(0, 6)); // Top 6 for clean visual trend
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [branch]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300">
            <LineChart size={16} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Multi-Year Cutoff Trajectory &amp; Shifts (2022–2025)</h3>
            <p className="text-xs text-white/50">Tracking closing rank movement and competition across 2022, 2023, 2024, and 2025</p>
          </div>
        </div>

        {/* Branch Selector */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {BRANCHES.map((b) => (
            <button
              key={b.code}
              onClick={() => setBranch(b.code)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                branch === b.code
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trajectory Table */}
      {loading ? (
        <div className="h-48 rounded-xl bg-white/5 animate-pulse" />
      ) : (
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
              {colleges.map((c) => {
                const info = c.cutoffs?.[branch];
                if (!info) return null;
                const r22 = info.oc2022 || 0;
                const r25 = info.oc2025 || info.oc2024 || 0;
                // If 2025 rank is lower than 2022 rank, it means it got harder/more competitive!
                const isTougher = r25 < r22;
                const diff = Math.abs(r22 - r25);

                return (
                  <tr key={c.code} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-white">
                      <span className="font-mono text-xs font-bold text-purple-300 mr-2 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-500/20">
                        {c.code}
                      </span>
                      <span className="hidden sm:inline">{c.shortName}</span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center font-mono text-white/60">
                      {info.oc2022 ? `~${info.oc2022.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center font-mono text-white/80">
                      {info.oc2023 ? `~${info.oc2023.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center font-mono text-white/90">
                      {info.oc2024 ? `~${info.oc2024.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center font-mono font-bold text-purple-200">
                      {info.oc2025 ? `~${info.oc2025.toLocaleString()}` : '—'}
                      {info.final2025 && (
                        <span className="block text-[10px] font-normal text-purple-400/70">(Final: {info.final2025.toLocaleString()})</span>
                      )}
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
      )}
    </div>
  );
}
