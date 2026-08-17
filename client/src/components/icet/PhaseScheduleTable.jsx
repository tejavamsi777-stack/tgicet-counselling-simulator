import { useState } from 'react';
import { getAutoStatus, getPhaseAutoStatus } from '../../utils/dateStatus';

const STATUS_BADGES = {
  active: (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      Live Now
    </span>
  ),
  upcoming: (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 text-xs font-semibold text-sky-300">
      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
      Upcoming
    </span>
  ),
  concluded: (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/50">
      <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
      Concluded
    </span>
  ),
};

export default function PhaseScheduleTable({ phases = [] }) {
  // Find currently active or first upcoming phase as default tab
  const defaultPhaseId = phases.find(p => {
    const status = getPhaseAutoStatus(p);
    return status === 'active' || status === 'upcoming';
  })?.id || phases[0]?.id || 'final';

  const [activePhase, setActivePhase] = useState(defaultPhaseId);

  const phase = phases.find(p => p.id === activePhase) || phases[0];

  if (!phases.length) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6">
      {/* Phase tab switcher with dynamic live status badges */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {phases.map(p => {
          const phaseStatus = getPhaseAutoStatus(p);
          const isSelected = activePhase === (p.id || p.phaseName);

          return (
            <button
              key={p.id || p.phaseName}
              onClick={() => setActivePhase(p.id || p.phaseName)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-white/[0.06]'
              }`}
            >
              <span>{p.label || p.phaseName}</span>
              {phaseStatus === 'active' && (
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {phase && (
        <>
          {/* Constraint notice */}
          {phase.constraint && (
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3.5 mb-4 text-amber-200 text-sm flex items-start gap-2.5">
              <span className="text-base leading-none">⚠️</span>
              <span className="leading-relaxed">{phase.constraint}</span>
            </div>
          )}

          {/* Schedule table */}
          <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-white/40 bg-white/[0.02]">
                  <th className="py-3.5 px-4 sm:px-6 text-left font-semibold">Action</th>
                  <th className="py-3.5 px-4 sm:px-6 text-left font-semibold">Dates</th>
                  <th className="py-3.5 px-4 sm:px-6 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {(phase.steps || phase.schedule || []).map((row, i) => {
                  const autoStatus = getAutoStatus(row.dates);

                  return (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 text-white/90 font-medium">{row.action}</td>
                      <td className="py-3.5 px-4 sm:px-6 text-white/70 whitespace-nowrap font-mono text-xs">{row.dates}</td>
                      <td className="py-3.5 px-4 sm:px-6">
                        {STATUS_BADGES[autoStatus] || STATUS_BADGES.upcoming}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Logistics cards */}
          {phase.logistics && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {phase.logistics.collegeUpgrade && (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">College Upgrade Logistics</p>
                  <p className="text-white/70 text-sm leading-relaxed">{phase.logistics.collegeUpgrade}</p>
                </div>
              )}
              {phase.logistics.branchUpgrade && (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">Branch Upgrade Logistics</p>
                  <p className="text-white/70 text-sm leading-relaxed">{phase.logistics.branchUpgrade}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
