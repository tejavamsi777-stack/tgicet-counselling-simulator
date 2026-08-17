import { GraduationCap, Banknote } from 'lucide-react';

export default function EligibilityMatrix({ eligibility = {} }) {
  // If eligibility is provided as academic/fees arrays, use them; otherwise extract from mba/mca objects
  const academic = eligibility.academic || [
    "MBA Qualification: Recognized 3-Year Bachelor's Degree in any discipline (B.Com / B.Sc / B.A / BBA / B.Tech) with at least 50% aggregate marks (45% for SC, ST, BC).",
    "MCA Qualification: BCA / B.Sc / B.Com / B.A with Mathematics at 10+2 level or at Graduation level with at least 50% aggregate marks (45% for reserved categories).",
    "TG ICET Qualifying Cutoff: Minimum 25% (50 marks out of 200) for OC, BC, and EWS. No minimum qualifying score required for SC and ST candidates.",
    "Open University / Distance Degree: Must be recognized by UGC, AICTE, and Distance Education Bureau (DEB).",
    "Domicile & Jurisdiction: Candidate must be an Indian National and satisfy Telangana Local Status (85% OU / KU Region) or Non-Local Status (15% Unreserved).",
  ];

  const fees = eligibility.fees || [
    { label: "Exam Registration Fee (OC / BC / EWS)", value: "₹750 (Online via Net Banking/UPI)" },
    { label: "Exam Registration Fee (SC / ST / PH)", value: "₹500 (Online via Net Banking/UPI)" },
    { label: "Counselling Processing Fee (OC / BC / EWS)", value: "₹1,200 (Online via Net Banking/UPI)" },
    { label: "Counselling Processing Fee (SC / ST)", value: "₹600 (Online via Net Banking/UPI)" },
    { label: "Tuition Fee Reimbursement (RTF)", value: "100% for SC/ST; As per Govt Norms for BC/EWS" },
    { label: "Parental Income Limit (RTF/ePASS)", value: "≤ ₹2.00 Lakh (Rural) / ≤ ₹1.50 Lakh (Urban)" },
    { label: "Local Reservation (OU / KU)", value: "85% Local Quota (15% Unreserved / Open)" },
    { label: "EWS Reservation", value: "10% Supernumerary (G.O. Ms. No. 244)" },
    { label: "BC Sub-quota Breakdown", value: "29% Total (BC-A 7%, BC-B 10%, BC-C 1%, BC-D 7%, BC-E 4%)" },
    { label: "SC / ST Category Quota", value: "SC (15%), ST (10%)" },
    { label: "Special Categories Quota", value: "PH (5% SADAREM), CAP (2%), NCC (1%), Sports (0.5%)" },
    { label: "Women Horizontal Reservation", value: "33.33% (1/3rd in each category)" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left card — Admission Criteria */}
      <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 border border-purple-500/20">
            <GraduationCap size={16} className="text-purple-300" />
          </div>
          <h4 className="text-white font-semibold text-sm">Admission Criteria &amp; Degree Prerequisites</h4>
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
