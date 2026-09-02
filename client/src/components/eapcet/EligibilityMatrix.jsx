import { GraduationCap, Banknote } from 'lucide-react';

const FALLBACK_ELIGIBILITY = {
  academic: [
    "Qualified in TG EAPCET-2026 with minimum 45% marks in Intermediate group subjects (40% for reserved categories).",
    "Must be an Indian National satisfying local/unreserved status per G.O. Ms. No. 15 dated 27-02-2025.",
    "Seat matrix: 85% reserved for Local (O.U. Area) candidates; 15% Unreserved (open to O.U. locals, 10-year state residents, government employee children/spouses).",
    "Minimum age: 16 years as of 31-12-2026 for Engineering (17 for Pharm-D); Maximum 25 years (OC) or 29 years (others) as of 01-07-2026 for scholarship eligibility.",
    "Minority Exemption: Muslim/Christian minority candidates without a TG EAPCET rank may apply for leftover minority college seats with required Inter % (not eligible for Fee Reimbursement).",
  ],
  fees: [
    { label: "Exam Fee — Engg (E) / Agri (AP) [OC / BC]", value: "₹900 (online)" },
    { label: "Exam Fee — Engg (E) / Agri (AP) [SC / ST / PH]", value: "₹500 (online)" },
    { label: "Exam Fee — Both Streams (E & AP) [OC / BC]", value: "₹1,800 (online)" },
    { label: "Exam Fee — Both Streams (E & AP) [SC / ST / PH]", value: "₹1,000 (online)" },
    { label: "Counselling Processing Fee (OC / BC / EWS)", value: "₹1,200 (online)" },
    { label: "Counselling Processing Fee (SC / ST)", value: "₹600 (online)" },
    { label: "EWS Reservation", value: "10% (G.O. Ms. No. 244)" },
    { label: "ST Reservation", value: "10% (G.O. Ms. No. 33)" },
    { label: "PH Reservation", value: "5% (G.O. Ms. No. 2)" },
    { label: "CAP (Armed Personnel Children)", value: "2%" },
    { label: "SC Grouping", value: "Applies per G.O. Ms. No. 10" },
    { label: "Minimum Tuition Floor (SC/ST)", value: "₹5,000 (refundable on final reporting; forfeited if not reported)" },
    { label: "Minimum Tuition Floor (Others)", value: "₹10,000 (refundable on final reporting; forfeited if not reported)" },
  ],
};

export default function EligibilityMatrix({ eligibility = {} }) {
  const activeEligibility = (eligibility && eligibility.academic && eligibility.academic.length > 0)
    ? eligibility
    : FALLBACK_ELIGIBILITY;

  const academic = activeEligibility.academic || FALLBACK_ELIGIBILITY.academic;
  const fees     = activeEligibility.fees     || FALLBACK_ELIGIBILITY.fees;

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
