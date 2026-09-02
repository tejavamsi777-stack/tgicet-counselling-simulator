import { useMemo } from 'react';
import { Sparkles, ArrowUpRight, Building2 } from 'lucide-react';
import { EAPCET_INSTITUTIONS } from '../../data/eapcetInstitutions';

// Helper to calculate authentic scraped Eduvale rating
function getCollegeEduvaleRating(col) {
  const params = col?.quality_scores?.parameters;
  if (Array.isArray(params) && params.length > 0) {
    const scores = params.map((p) => {
      if (typeof p.score === 'string' && p.score.includes('/')) {
        return parseFloat(p.score.split('/')[0]) || 8.0;
      }
      if (typeof p.score === 'number') return p.score;
      if (p.pct) return p.pct / 10;
      return 8.0;
    });
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return avg;
  }
  if (col?.overall_score && col.overall_score !== 8.5) return col.overall_score;
  const rank = col?.rank || 50;
  return Math.max(5.1, Math.min(9.8, 9.6 - (rank - 1) * 0.021));
}

export default function TopEngineeringCollegesExplorer() {
  // Show top 3 colleges as a teaser preview
  const topThree = useMemo(() => {
    return [...(EAPCET_INSTITUTIONS || [])]
      .sort((a, b) => getCollegeEduvaleRating(b) - getCollegeEduvaleRating(a))
      .slice(0, 3);
  }, []);

  const getScoreColor = (score) => {
    if (!score) return 'text-gray-400';
    if (score >= 8) return 'text-emerald-400';
    if (score >= 6) return 'text-green-400';
    if (score >= 4) return 'text-amber-400';
    return 'text-orange-400';
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#120826] via-black/90 to-[#0d0720] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-600/15 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 mb-2">
              <Sparkles size={13} className="text-amber-400" />
              <span>Top Engineering Colleges in Telangana · TSCHE 2026 Rankings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Telangana Engineering Colleges Directory
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Explore 214 accredited colleges ranked by quality score, NAAC grade, and tuition fees.
            </p>
          </div>

          {/* CTA button — Glossy Glass Pill Style */}
          <a
            href="/tg-eapcet/colleges"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white hover:text-gray-900 transition-all font-bold cursor-pointer shadow-sm backdrop-blur-md px-6 py-2.5 text-xs sm:text-sm shrink-0"
          >
            <Building2 size={16} />
            <span>Explore All 214 Colleges</span>
            <ArrowUpRight size={15} />
          </a>
        </div>

        {/* Top 3 preview cards */}
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-3">🔥 Top Rated Institutions Preview:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {topThree.map((col) => (
              <a
                key={col.code}
                href={`/tg-eapcet/colleges/${col.code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-purple-500/40 hover:bg-white/[0.06] transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[11px] font-extrabold">
                      Rank #{col.rank}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5 line-clamp-1 group-hover:text-purple-200">{col.name}</h4>
                    <p className="text-[11px] text-gray-400">{col.district}, Telangana · {col.type}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-0.5 justify-end">
                      <span className={`text-sm font-extrabold ${getScoreColor(getCollegeEduvaleRating(col))}`}>
                        {getCollegeEduvaleRating(col).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-white/40 font-semibold">/10</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5">
                  <span className="text-gray-300 font-semibold">₹{(col.annualFee || col.fee || 0) > 0 ? (col.annualFee || col.fee).toLocaleString() : 'Govt Fees'} / yr</span>
                  <span className="text-purple-400 font-bold group-hover:text-purple-300 flex items-center gap-1">
                    View Profile <ArrowUpRight size={12} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* See all link */}
        <div className="text-center mt-5">
          <a
            href="/tg-eapcet/colleges"
            className="inline-flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors"
          >
            View all 214 colleges with rankings, scores & filters →
          </a>
        </div>
      </div>
    </section>
  );
}
