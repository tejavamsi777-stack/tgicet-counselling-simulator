import { GraduationCap, Banknote } from 'lucide-react';

export default function EligibilityMatrix({ eligibility = {} }) {
  const academic = eligibility.academic || [];
  const fees     = eligibility.fees     || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left card — Admission Criteria */}
      <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 border border-purple-500/20">
            <GraduationCap size={16} className="text-purple-300" />
          </div>
          <h4 className="text-white font-semibold text-sm">Admission Criteria</h4>
        </div>
        <ul className="space-y-2">
          {academic.map((item, i) => (
            <li key={i} className="flex gap-2 text-white/75 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400/60" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right card — Processing Fees & Quota Reservations */}
      <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20">
            <Banknote size={16} className="text-green-300" />
          </div>
          <h4 className="text-white font-semibold text-sm">Exam &amp; Processing Fees, Quota Reservations</h4>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {fees.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                <td className="py-2 pl-2 pr-4 text-white/60 rounded-l">{row.label}</td>
                <td className="py-2 pr-2 text-white font-medium text-right rounded-r">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
