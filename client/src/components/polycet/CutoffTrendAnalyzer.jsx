import { useState } from 'react';
import { TrendingDown, TrendingUp, Sparkles, Filter } from 'lucide-react';

const CUTOFF_TRAJECTORY_DATA = [
  {
    code: 'MASB',
    name: 'Govt Polytechnic, Masab Tank',
    branch: 'CME',
    y2022: 2450,
    y2023: 2180,
    y2024: 1990,
    y2025: 1885,
    trend: 'up',
    shift: '+105 (Harder)',
  },
  {
    code: 'MASB',
    name: 'Govt Polytechnic, Masab Tank',
    branch: 'ECE',
    y2022: 4100,
    y2023: 3850,
    y2024: 3620,
    y2025: 3420,
    trend: 'up',
    shift: '+200 (Harder)',
  },
  {
    code: 'JNGP',
    name: 'J N Govt Polytechnic, Ramanthapur',
    branch: 'CME',
    y2022: 3200,
    y2023: 2950,
    y2024: 2680,
    y2025: 2450,
    trend: 'up',
    shift: '+230 (Harder)',
  },
  {
    code: 'IOES',
    name: 'Govt Institute of Electronics, Secunderabad',
    branch: 'CME',
    y2022: 3950,
    y2023: 3620,
    y2024: 3340,
    y2025: 3100,
    trend: 'up',
    shift: '+240 (Harder)',
  },
  {
    code: 'GPWS',
    name: 'Govt Polytechnic for Women, Secunderabad',
    branch: 'CME',
    y2022: 5200,
    y2023: 4850,
    y2024: 4500,
    y2025: 4200,
    trend: 'up',
    shift: '+300 (Harder)',
  },
  {
    code: 'WRGL',
    name: 'Govt Polytechnic, Warangal',
    branch: 'CME',
    y2022: 6100,
    y2023: 5650,
    y2024: 5200,
    y2025: 4900,
    trend: 'up',
    shift: '+300 (Harder)',
  },
  {
    code: 'NZBD',
    name: 'Govt Polytechnic, Nizamabad',
    branch: 'CME',
    y2022: 6800,
    y2023: 6200,
    y2024: 5750,
    y2025: 5300,
    trend: 'up',
    shift: '+450 (Harder)',
  },
];

export default function CutoffTrendAnalyzer() {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-black/40 p-6 sm:p-8 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Multi-Year Cutoff Trajectory (2022 – 2025)
            </h2>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Tracking year-over-year closing rank competition shifts for OC Boys / General Merit
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.04] text-white/50 uppercase font-bold tracking-wider text-[11px]">
              <th className="py-3 px-4">College Code</th>
              <th className="py-3 px-4">Institution Name</th>
              <th className="py-3 px-4">Branch</th>
              <th className="py-3 px-4 font-mono">2022 Cutoff</th>
              <th className="py-3 px-4 font-mono">2023 Cutoff</th>
              <th className="py-3 px-4 font-mono">2024 Cutoff</th>
              <th className="py-3 px-4 font-mono text-purple-300">2025 Cutoff (Final Phase)</th>
              <th className="py-3 px-4 text-right">Competition Shift</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-white/80 font-medium">
            {CUTOFF_TRAJECTORY_DATA.map((row, idx) => (
              <tr key={`${row.code}-${row.branch}-${idx}`} className="hover:bg-white/[0.03] transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-purple-300">{row.code}</td>
                <td className="py-3.5 px-4 font-bold text-white">{row.name}</td>
                <td className="py-3.5 px-4">
                  <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold font-mono text-cyan-300">
                    {row.branch}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-white/60">#{row.y2022.toLocaleString()}</td>
                <td className="py-3.5 px-4 font-mono text-white/60">#{row.y2023.toLocaleString()}</td>
                <td className="py-3.5 px-4 font-mono text-white/60">#{row.y2024.toLocaleString()}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-purple-300">#{row.y2025.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400">
                    <TrendingUp size={12} />
                    {row.shift}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
