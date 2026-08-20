import { Calendar, CheckCircle2 } from 'lucide-react';

const PGECET_SCHEDULE = [
  {
    step: '1',
    activity: 'Online Registration and Fee Payment',
    phase1: 'July 30 – August 09',
    finalPhase: 'September 12 – September 15',
    status: 'completed',
  },
  {
    step: '2',
    activity: 'Online Certificate Verification (OCV)',
    phase1: 'August 01 – August 10',
    finalPhase: 'September 14 – September 16',
    status: 'completed',
  },
  {
    step: '3',
    activity: 'Display of List of Eligible Candidates',
    phase1: 'August 12',
    finalPhase: 'September 17',
    status: 'completed',
  },
  {
    step: '4',
    activity: 'Exercising Web Options (College & Branch Entry)',
    phase1: 'August 13 – August 15',
    finalPhase: 'September 18 – September 19',
    status: 'active',
  },
  {
    step: '5',
    activity: 'Edit / Freeze of Web Options',
    phase1: 'August 16',
    finalPhase: 'September 20',
    status: 'upcoming',
  },
  {
    step: '6',
    activity: 'Provisional Seat Allotment (Phase 1 & Final)',
    phase1: 'August 19',
    finalPhase: 'September 23',
    status: 'upcoming',
  },
  {
    step: '7',
    activity: 'Payment of Tuition Fee & Reporting at Allotted Colleges',
    phase1: 'August 20 – August 24',
    finalPhase: 'September 24 – September 27',
    status: 'upcoming',
  },
];

export default function PhaseScheduleTable() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0e071c]/90 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-center gap-2.5 p-5 sm:p-6 border-b border-white/10 bg-white/[0.02]">
        <Calendar className="text-purple-400" size={20} />
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            Phase-Wise Counselling Schedule 2026
          </h3>
          <p className="text-xs text-white/50">
            Official timeline for M.Tech, M.E., M.Arch &amp; M.Pharmacy admissions
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-black/40 text-[11px] font-bold uppercase tracking-wider text-white/60">
              <th className="py-3 px-4 text-center w-12">#</th>
              <th className="py-3 px-4">Counselling Stage</th>
              <th className="py-3 px-4">Phase I Dates</th>
              <th className="py-3 px-4">Final Phase Dates</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-white/80">
            {PGECET_SCHEDULE.map((row) => (
              <tr key={row.step} className="hover:bg-white/[0.03] transition">
                <td className="py-3 px-4 text-center font-mono text-white/40">{row.step}</td>
                <td className="py-3 px-4 font-semibold text-white">{row.activity}</td>
                <td className="py-3 px-4 font-mono text-purple-300">{row.phase1}</td>
                <td className="py-3 px-4 font-mono text-cyan-300">{row.finalPhase}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
