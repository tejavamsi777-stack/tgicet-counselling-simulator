import { useState } from 'react';

const STATUS_STYLES = {
  concluded: 'bg-white/10 text-white/60 text-xs px-2 py-0.5 rounded-full',
  active: 'bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full',
  upcoming: 'bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full',
  'Live Now': 'bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full',
  'Concluded': 'bg-white/10 text-white/60 text-xs px-2 py-0.5 rounded-full',
  'Upcoming': 'bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full',
};

export default function PhaseScheduleTable({ phases = [] }) {
  const [activePhase, setActivePhase] = useState(
    phases.find((p) => p.id === 'spot_admissions')?.id || phases[0]?.id || 'first_phase'
  );

  const phase = phases.find((p) => p.id === activePhase) || phases[0];

  if (!phases.length) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6">
      {/* Phase tab switcher */}
      <div className="flex flex-wrap gap-2 mb-6">
        {phases.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActivePhase(p.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
              activePhase === p.id
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {p.name || p.label}
          </button>
        ))}
      </div>

      {phase && (
        <>
          {/* Constraint notice */}
          {phase.description && (
            <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-3.5 mb-4 text-purple-200 text-sm">
              ℹ️ {phase.description}
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
                {(phase.events || phase.steps || []).map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 text-white/90 font-medium">
                      {row.label || row.action}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-white/60 whitespace-nowrap">{row.date || row.dates}</td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <span className={STATUS_STYLES[phase.status] || STATUS_STYLES.concluded}>
                        {phase.badge || phase.status || 'Concluded'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
