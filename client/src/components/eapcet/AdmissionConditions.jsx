const FALLBACK_CONDITIONS = [
  {
    title: "16+ Years Minimum Age & Qualifying Exam Rules",
    body: "Candidates must be Indian Nationals & belong to Telangana / Andhra Pradesh. Must have completed 16 years of age as of December 31st of the admission year. Minimum 45% marks in Intermediate (MPC/BiPC) for General / 40% for Reserved categories.",
    severity: "high"
  },
  {
    title: "Local Area Jurisdiction (85% Local Reservation)",
    body: "85% of Convenor Quota seats in each college are reserved for Local Candidates (Osmania University / JNTUH local area based on 7 consecutive years of study in Telangana). Remaining 15% seats are open for Unreserved / Non-local candidates.",
    severity: "high"
  },
  {
    title: "TS ePASS Fee Reimbursement Income Limits",
    body: "Full tuition fee reimbursement for SC/ST students & rank holders under 10,000 in TG EAPCET. Partial reimbursement (₹35,000/yr) for BC, EWS & OC students with parental annual income below ₹2,000,000 (Urban) or ₹1,500,000 (Rural).",
    severity: "medium"
  },
  {
    title: "Document Verification at Help Line Centres (HLC)",
    body: "Mandatory physical certificate verification at designated HLCs for Special Category (PH, CAP, NCC, Sports) & offline verification candidates before option freezing.",
    severity: "low"
  }
];

export default function AdmissionConditions({ conditions = [] }) {
  const activeConditions = (conditions && conditions.length > 0) ? conditions : FALLBACK_CONDITIONS;

  const high   = activeConditions.filter(c => c.severity === 'high');
  const medium = activeConditions.filter(c => c.severity === 'medium');
  const low    = activeConditions.filter(c => c.severity === 'low');

  return (
    <div>
      <h3 className="text-lg font-bold text-amber-300 mb-4 flex items-center gap-2">
        <span>⚠️ Admission Conditions &amp; Binding Rules</span>
      </h3>

      {/* High severity */}
      {high.map((item, i) => (
        <div key={i} className="bg-amber-950/20 border border-amber-500/25 rounded-xl p-4 mb-3">
          <p className="text-amber-200 font-semibold text-sm">{item.title}</p>
          {item.body && <p className="text-white/70 text-sm mt-1 leading-relaxed">{item.body}</p>}
        </div>
      ))}

      {/* Medium severity */}
      {medium.map((item, i) => (
        <div key={i} className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4 mb-3">
          <p className="text-blue-200 font-semibold text-sm">{item.title}</p>
          {item.body && <p className="text-white/70 text-sm mt-1 leading-relaxed">{item.body}</p>}
        </div>
      ))}

      {/* Low severity — grouped */}
      {low.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-4">
          <ul className="space-y-1.5">
            {low.map((item, i) => (
              <li key={i} className="flex gap-2 text-white/60 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/25" />
                <span><span className="text-white/80 font-medium">{item.title}</span>{item.body ? ` — ${item.body}` : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
