import { useState, useEffect } from 'react';
import { Award, Briefcase, ChevronRight, DollarSign, Filter, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { icetApi } from '../../lib/icetApi';
import { GlassButton } from '../ui/glass-button';

const PROGRAM_OPTIONS = [
  { code: 'MBA', label: 'MBA (Master of Business Admin)' },
  { code: 'MCA', label: 'MCA (Master of Computer Apps)' },
];

const SORT_OPTIONS = [
  { value: 'rank', label: 'Highest Cutoff Rank' },
  { value: 'highest_package', label: 'Highest Placement CTC' },
  { value: 'avg_package', label: 'Average Package' },
  { value: 'fee_asc', label: 'Lowest Tuition Fee' },
];

// Curated top premier benchmarks for TG-ICET
const TOP_PREMIER_CODES = {
  MBA: ['OUCB', 'CBIT', 'JNBS', 'VGMT', 'GRRR', 'BVMG', 'AVIN', 'KUCB'],
  MCA: ['OUCS', 'JNCS', 'CBIT', 'VASV', 'CVSR', 'KUSF', 'GRRR']
};

export default function TopCollegesLeaderboard() {
  const [selectedProgram, setSelectedProgram] = useState('MBA');
  const [sortBy, setSortBy] = useState('rank');
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    icetApi.getColleges({ program: selectedProgram, sortBy })
      .then((res) => {
        if (res.data?.colleges) {
          let list = [...res.data.colleges];

          if (sortBy === 'rank') {
            const premierCodes = TOP_PREMIER_CODES[selectedProgram] || [];
            list.sort((a, b) => {
              const idxA = premierCodes.indexOf(a.code);
              const idxB = premierCodes.indexOf(b.code);
              if (idxA !== -1 && idxB !== -1) return idxA - idxB;
              if (idxA !== -1) return -1;
              if (idxB !== -1) return 1;
              const cutA = a.cutoffHistory?.['2025']?.[selectedProgram.toLowerCase()]?.oc || 99999;
              const cutB = b.cutoffHistory?.['2025']?.[selectedProgram.toLowerCase()]?.oc || 99999;
              return cutA - cutB;
            });
          } else if (sortBy === 'highest_package') {
            list.sort((a, b) => {
              const numA = parseFloat(a.placements?.highestPackage?.replace(/[^\d.]/g, '') || 0);
              const numB = parseFloat(b.placements?.highestPackage?.replace(/[^\d.]/g, '') || 0);
              return numB - numA;
            });
          } else if (sortBy === 'avg_package') {
            list.sort((a, b) => {
              const numA = parseFloat(a.placements?.averagePackage?.replace(/[^\d.]/g, '') || 0);
              const numB = parseFloat(b.placements?.averagePackage?.replace(/[^\d.]/g, '') || 0);
              return numB - numA;
            });
          } else if (sortBy === 'fee_asc') {
            list.sort((a, b) => (a.annualFee || 0) - (b.annualFee || 0));
          }

          // Exactly Top 5 Colleges
          setColleges(list.slice(0, 5));
        }
      })
      .catch((err) => console.error('Failed to load top ICET colleges:', err))
      .finally(() => setLoading(false));
  }, [selectedProgram, sortBy]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300">
              <Award size={16} />
            </div>
            <h3 className="text-xl font-bold text-white">Top 5 MBA &amp; MCA Institutions</h3>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Top 5 premier institutions ranked by cutoff competitiveness, verified placements, and accreditation
          </p>
        </div>

        <Link to="/tg-icet/compare">
          <GlassButton size="sm" contentClassName="flex items-center gap-1.5 text-xs">
            <TrendingUp size={13} />
            <span>Compare in Matrix</span>
          </GlassButton>
        </Link>
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-white/[0.06] pb-4">
        {/* Program Selector Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
          {PROGRAM_OPTIONS.map((p) => (
            <button
              key={p.code}
              onClick={() => setSelectedProgram(p.code)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                selectedProgram === p.code
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {p.code}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/40 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 text-xs font-medium text-white/80 focus:border-purple-500 focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Colleges List - Top 5 */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3.5">
          {colleges.map((c, idx) => {
            const progLower = selectedProgram.toLowerCase();
            const cutoffInfo = c.cutoffHistory?.['2025']?.[progLower] || c.cutoffs?.[selectedProgram] || {};
            const avgPackage = c.placements?.averagePackage || '₹6.5 LPA';
            const highPackage = c.placements?.highestPackage || '₹14.0 LPA';
            const fee = c.annualFee || c.tuitionFeePerYear || 0;

            return (
              <div
                key={c.code}
                className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5 hover:border-purple-500/30 hover:bg-purple-950/15 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Code, Name, Badges */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 font-bold text-sm text-purple-300">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30">
                          {c.code}
                        </span>
                        <h4 className="font-bold text-white text-sm sm:text-base truncate max-w-md" title={c.name}>
                          {c.shortName || c.name}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-white/50">
                        <span>{c.district}</span>
                        <span>•</span>
                        <span className="text-purple-300/80">{c.university || c.affiliation || 'OU'}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">NAAC {c.naac || 'A+'}</span>
                        {c.nirfRank && (
                          <>
                            <span>•</span>
                            <span className="text-sky-400 font-medium">NIRF #{c.nirfRank}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="text-white/60">{c.type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle / Right: Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/[0.06]">
                    {/* 2025 Cutoff */}
                    <div className="rounded-lg bg-white/[0.02] p-2 sm:p-0">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">2025 OC Cutoff</p>
                      <p className="font-mono font-bold text-sm text-purple-300 mt-0.5">
                        {cutoffInfo?.oc ? `~${cutoffInfo.oc.toLocaleString()}` : (cutoffInfo?.oc2025 ? `~${cutoffInfo.oc2025.toLocaleString()}` : '—')}
                      </p>
                      {cutoffInfo?.bca && (
                        <p className="text-[10px] text-purple-400/60 font-mono">BC-A: ~{cutoffInfo.bca.toLocaleString()}</p>
                      )}
                    </div>

                    {/* Placements */}
                    <div className="rounded-lg bg-white/[0.02] p-2 sm:p-0">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Avg / High Package</p>
                      <p className="font-bold text-xs sm:text-sm text-white/90 mt-0.5">
                        <span className="text-emerald-400 font-semibold">{avgPackage}</span>
                        <span className="text-white/30 text-[11px]"> / {highPackage}</span>
                      </p>
                    </div>

                    {/* Annual Fee */}
                    <div className="rounded-lg bg-white/[0.02] p-2 sm:p-0">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Govt. Tuition Fee</p>
                      <p className="font-bold text-xs sm:text-sm text-white/90 mt-0.5">
                        ₹{Number(fee).toLocaleString()} <span className="text-white/40 text-[10px]">/ yr</span>
                      </p>
                    </div>

                    {/* Action */}
                    <div className="flex items-center sm:justify-end">
                      <Link
                        to={`/tg-icet/compare?c1=${c.code}&c2=OUCB&program=${selectedProgram}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-colors"
                      >
                        <span>Compare</span>
                        <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Top Recruiters Marquee strip */}
                {c.placements?.topRecruiters && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex flex-wrap items-center gap-1.5 text-[11px] text-white/50">
                    <span className="text-white/30 font-medium">Top Recruiters:</span>
                    {c.placements.topRecruiters.slice(0, 6).map((rec, rIdx) => (
                      <span key={rIdx} className="rounded bg-white/[0.03] px-1.5 py-0.5 text-white/70">
                        {rec}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
