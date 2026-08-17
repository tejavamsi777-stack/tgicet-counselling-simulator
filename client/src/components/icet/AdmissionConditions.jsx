export default function AdmissionConditions({ conditions = [] }) {
  const high   = conditions.filter(c => c.severity === 'high' || c.tag === 'Crucial Step' || c.tag === 'Allotment Policy');
  const medium = conditions.filter(c => c.severity === 'medium' || c.tag === 'Financial Support');
  const low    = conditions.filter(c => c.severity === 'low' || c.tag === 'Reservation Quota');

  if (!conditions.length) return null;

  return (
    <div>
      <h3 className="text-lg font-bold text-amber-300 mb-4 flex items-center gap-2">
        ⚠️ TG ICET Admission Conditions &amp; Binding Rules
      </h3>

      {/* High severity */}
      {high.map((item, i) => (
        <div key={i} className="bg-amber-950/20 border border-amber-500/25 rounded-xl p-4 mb-3">
          <p className="text-amber-200 font-semibold text-sm">{item.title}</p>
          {(item.body || item.desc) && (
            <p className="text-white/70 text-sm mt-1 leading-relaxed">{item.body || item.desc}</p>
          )}
        </div>
      ))}

      {/* Medium severity */}
      {medium.map((item, i) => (
        <div key={i} className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4 mb-3">
          <p className="text-blue-200 font-semibold text-sm">{item.title}</p>
          {(item.body || item.desc) && (
            <p className="text-white/70 text-sm mt-1 leading-relaxed">{item.body || item.desc}</p>
          )}
        </div>
      ))}

      {/* Low severity — grouped */}
      {low.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-4">
          <ul className="space-y-1.5">
            {low.map((item, i) => (
              <li key={i} className="flex gap-2 text-white/60 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/25" />
                <span>
                  <span className="text-white/80 font-medium">{item.title}</span>
                  {(item.body || item.desc) ? ` — ${item.body || item.desc}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
