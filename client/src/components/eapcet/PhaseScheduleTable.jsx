import { useState } from 'react';

const STATUS_STYLES = {
  concluded: 'bg-white/10 text-white/60 text-xs px-2 py-0.5 rounded-full',
  active:    'bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full',
  upcoming:  'bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full',
};

export default function PhaseScheduleTable({ phases = [] }) {
  const [activePhase, setActivePhase] = useState(
    phases.find(p => p.id === 'final')?.id || phases[0]?.id || 'final'
  );

  const phase = phases.find(p => p.id === activePhase) || phases[0];

  if (!phases.length) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6">
      {/* Phase tab switcher */}
      <div className="flex flex-wrap gap-2 mb-6">
        {phases.map(p => (
          <button
            key={p.id}
            onClick={() => setActivePhase(p.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              activePhase === p.id
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {phase && (
        <>
          {/* Constraint notice */}
          {phase.constraint && (
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 mb-4 text-amber-200 text-sm">
              ⚠️ {phase.constraint}
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
                {(phase.steps || phase.schedule || []).map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 text-white/90 font-medium">{row.action}</td>
                    <td className="py-3.5 px-4 sm:px-6 text-white/60 whitespace-nowrap">{row.dates}</td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <span className={STATUS_STYLES[row.status] || STATUS_STYLES.concluded}>
                        {row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Logistics cards */}
          {phase.logistics && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {phase.logistics.collegeUpgrade && (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">College Upgrade</p>
                  <p className="text-white/70 text-sm leading-relaxed">{phase.logistics.collegeUpgrade}</p>
                </div>
              )}
              {phase.logistics.branchUpgrade && (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Branch Upgrade</p>
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
