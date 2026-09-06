import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Building2 } from 'lucide-react';
import { ICET_INSTITUTIONS } from '../../data/icetInstitutions';
import { getIcetCollegeRating, getScoreColor } from '../../pages/icet/IcetCollegesDirectoryPage';

export default function TopIcetCollegesExplorer() {
  // Show top 3 colleges as a teaser preview (e.g. OUCB, JNTM, CBIT)
  const topThree = useMemo(() => {
    return [...(ICET_INSTITUTIONS || [])]
      .sort((a, b) => getIcetCollegeRating(b) - getIcetCollegeRating(a))
      .slice(0, 3);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 p-4 sm:p-5 backdrop-blur-xl shadow-lg">
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3.5 mb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-purple-500/30 bg-purple-500/10 text-purple-300">
                <Building2 size={14} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Telangana MBA &amp; MCA Colleges Directory
              </h2>
            </div>
            <p className="mt-1 text-[11px] text-gray-400 max-w-xl">
              336 accredited MBA &amp; MCA institutions ranked by cutoff competitiveness, quality score &amp; tuition fees.
            </p>
          </div>

          {/* CTA button */}
          <Link
            to="/tg-icet/colleges"
            className="self-start sm:self-auto shrink-0"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white hover:text-black transition-all px-4 py-1.5 text-xs font-semibold text-white shadow-sm cursor-pointer">
              <span>Explore All 336 Colleges</span>
              <ArrowUpRight size={13} />
            </span>
          </Link>
        </div>

        {/* Top 3 preview cards */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {topThree.map((col, idx) => {
              const rating = getIcetCollegeRating(col);
              const coursesStr = (col.coursesOffered || ['MBA']).join(' & ');
              return (
                <a
                  key={col.code}
                  href={`/tg-icet/colleges/${col.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 hover:border-purple-500/40 hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25 px-1.5 py-0.2 text-[9px] font-bold">
                        Rank #{idx + 1} · {col.code}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1 truncate group-hover:text-purple-200">{col.name}</h4>
                      <p className="text-[10px] text-gray-400 truncate">{col.district || col.place || 'Hyderabad'}, Telangana · {col.type}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-0.5 justify-end">
                        <span className={`text-xs font-extrabold ${getScoreColor(rating)}`}>
                          {rating.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-white/40 font-semibold">/10</span>
                      </div>
                      <span className="text-[9px] text-purple-300 font-medium block mt-0.5">{coursesStr}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-white/[0.04]">
                    <span className="text-gray-300 font-medium">₹{(col.annualFee || 0) > 0 ? col.annualFee.toLocaleString() : '35,000'} / yr</span>
                    <span className="text-purple-400 font-semibold group-hover:text-purple-300 flex items-center gap-0.5">
                      View Profile <ArrowUpRight size={11} />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
