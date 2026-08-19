import { useState, useMemo } from 'react';
import { Info } from 'lucide-react';

const STATUS_STYLES = {
  concluded: 'bg-white/10 text-white/60 text-xs px-2.5 py-0.5 rounded-full font-medium',
  active: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1.5',
  upcoming: 'bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium',
  'Live Now': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1.5',
  'Concluded': 'bg-white/10 text-white/60 text-xs px-2.5 py-0.5 rounded-full font-medium',
  'Upcoming': 'bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium',
};

/**
 * Parses date strings like "July 24 – July 28, 2026" or "June 30, 2026"
 * and dynamically returns 'Active' | 'Upcoming' | 'Concluded'.
 */
function resolveEventStatus(dateStr = '', parentPhaseStatus = '') {
  if (!dateStr) return parentPhaseStatus || 'Concluded';

  try {
    const now = new Date();
    const cleanStr = dateStr.replace(/on or before/i, '').replace(/after.*$/i, '').trim();
    const yearMatch = cleanStr.match(/\b(202\d)\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : now.getFullYear();

    const parts = cleanStr.split(/[–—\-]/);
    if (parts.length === 2) {
      const startStr = parts[0].trim();
      const endStr = parts[1].trim();

      const startDate = new Date(`${startStr} ${year}`);
      const endDate = new Date(endStr.includes(String(year)) ? endStr : `${endStr} ${year}`);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        endDate.setHours(23, 59, 59, 999);
        startDate.setHours(0, 0, 0, 0);
        if (now >= startDate && now <= endDate) return 'Active';
        if (now > endDate) return 'Concluded';
        if (now < startDate) return 'Upcoming';
      }
    } else {
      const singleDate = new Date(cleanStr.includes(String(year)) ? cleanStr : `${cleanStr} ${year}`);
      if (!isNaN(singleDate.getTime())) {
        const startOfDay = new Date(singleDate);
        startOfDay.setHours(0, 0, 0, 0);
        singleDate.setHours(23, 59, 59, 999);
        if (now >= startOfDay && now <= singleDate) return 'Active';
        if (now > singleDate) return 'Concluded';
        if (now < startOfDay) return 'Upcoming';
      }
    }
  } catch {
    // fallback below
  }

  if (parentPhaseStatus) {
    const s = parentPhaseStatus.toLowerCase();
    if (s.includes('live') || s.includes('active')) return 'Active';
    if (s.includes('upcom')) return 'Upcoming';
    if (s.includes('conclud') || s.includes('complet')) return 'Concluded';
  }
  return 'Concluded';
}

function isPhaseCurrentlyLive(phase) {
  if (!phase) return false;
  const events = phase.events || phase.steps || phase.schedule || [];
  if (events.length > 0) {
    return events.some(e => resolveEventStatus(e.date || e.dates, e.status) === 'Active');
  }
  if (phase.dates || phase.date) {
    return resolveEventStatus(phase.dates || phase.date, '') === 'Active';
  }
  return false;
}

export default function PhaseScheduleTable({ phases = [] }) {
  // Automatically select the active or most relevant phase
  const defaultPhaseId = useMemo(() => {
    if (!phases.length) return '';
    // 1. Live phase strictly based on date evaluation
    const livePhase = phases.find(p => isPhaseCurrentlyLive(p));
    if (livePhase) return livePhase.id;

    // 2. Upcoming phase
    const upcomingPhase = phases.find(p => {
      const events = p.events || p.steps || p.schedule || [];
      return events.some(e => resolveEventStatus(e.date || e.dates, e.status) === 'Upcoming');
    });
    if (upcomingPhase) return upcomingPhase.id;

    // 3. All concluded -> default to first phase
    return phases[0]?.id || '';
  }, [phases]);

  const [activePhase, setActivePhase] = useState(defaultPhaseId);
  const currentPhaseId = activePhase || defaultPhaseId;
  const phase = phases.find((p) => p.id === currentPhaseId) || phases[0];

  if (!phases.length) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6">
      {/* Phase tab switcher */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {phases.map((p) => {
          const isSelected = currentPhaseId === p.id;
          const isLive = isPhaseCurrentlyLive(p);

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePhase(p.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                  : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span>{p.name || p.label}</span>
              {isLive && (
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {phase && (
        <>
          {/* Constraint notice */}
          {phase.description && (
            <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 px-3.5 py-2 mb-4 flex items-center gap-2.5">
              <Info size={14} className="text-purple-400 shrink-0" />
              <p className="text-xs text-purple-200/85 font-medium leading-normal">
                {phase.description}
              </p>
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
                {(phase.events || phase.steps || []).map((row, i) => {
                  const dateText = row.date || row.dates || '';
                  const rowStatus = row.status || resolveEventStatus(dateText, phase.status);

                  return (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 text-white/90 font-medium">
                        {row.label || row.action}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-white/60 whitespace-nowrap">{dateText}</td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <span className={STATUS_STYLES[rowStatus] || STATUS_STYLES.concluded}>
                          {rowStatus === 'Active' && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                          <span>{rowStatus}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

