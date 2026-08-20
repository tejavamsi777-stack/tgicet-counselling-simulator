import { ShieldCheck, Info, CheckCircle2 } from 'lucide-react';

const PGECET_CONDITIONS = [
  {
    title: 'GATE / GPAT First Preference Rule',
    desc: 'Candidates with valid GATE/GPAT scores receive first preference in allotment of seats in all categories. PGECET qualified candidates are considered for remaining vacant seats.',
  },
  {
    title: 'Minimum Qualifying Marks in B.Tech / B.Pharm',
    desc: 'Candidates must obtain at least 50% marks (45% in case of candidates belonging to reserved categories SC/ST/BC) in the qualifying degree examination (B.E./B.Tech./AMIE/B.Pharm).',
  },
  {
    title: '85% Local vs 15% Non-Local Reservation',
    desc: '85% of seats in each course are reserved for local candidates of Osmania University / Kakatiya University area. The remaining 15% unreserved seats are open to both local and non-local candidates.',
  },
  {
    title: 'Reservation Matrix & SC Sub-Classification (2025-2026)',
    desc: 'Statutory reservations apply: SC (15% with Group 1, 2, 3 classifications), ST (10%), BC (29% across A, B, C, D, E sub-groups), and EWS (10% under G.O.Ms No 244). 33.33% horizontal reservation for women.',
  },
  {
    title: 'AICTE / Non-AICTE Fellowship Guidelines',
    desc: 'GATE/GPAT qualified candidates admitted into AICTE-approved PG programs are eligible for AICTE PG stipend/fellowship as per central government norms.',
  },
];

export default function AdmissionConditions() {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#120a22]/90 via-[#180f2d]/90 to-[#0c0616]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-center gap-2.5 border-b border-white/10 pb-5">
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-2 text-purple-400">
          <ShieldCheck size={18} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">
            Official Admission Conditions &amp; Statutory Guidelines
          </h3>
          <p className="text-xs text-white/50">
            Mandatory eligibility, reservation quotas, and fellowship rules
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {PGECET_CONDITIONS.map((cond, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-black/40 p-4 hover:border-purple-500/40 transition"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
              <CheckCircle2 size={14} className="text-cyan-400" />
              <span>{cond.title}</span>
            </div>
            <p className="mt-2 text-xs text-gray-300/90 leading-relaxed">{cond.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
