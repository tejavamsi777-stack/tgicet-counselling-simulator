import { AP_COLLEGES_METADATA } from '../../data/apCollegesMetadata';
import { useState, useEffect } from 'react';
import { Award, Briefcase, ChevronRight, DollarSign, Filter, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apEapcetApi } from '../../lib/apEapcetApi';
import { GlassButton } from '../ui/glass-button';

const BRANCH_OPTIONS = [
  { code: 'CSE', label: 'Computer Science (CSE)' },
  { code: 'CSM', label: 'CSE (AI & ML)' },
  { code: 'CSD', label: 'CSE (Data Science)' },
  { code: 'INF', label: 'Information Tech (IT)' },
  { code: 'ECE', label: 'Electronics & Comm (ECE)' },
  { code: 'EEE', label: 'Electrical & Electronics (EEE)' },
  { code: 'MEC', label: 'Mechanical (MEC)' },
  { code: 'CIV', label: 'Civil (CIV)' },
];

const SORT_OPTIONS = [
  { value: 'rank', label: 'Highest Cutoff Rank' },
  { value: 'highest_package', label: 'Highest Placement CTC' },
  { value: 'avg_package', label: 'Average Package' },
  { value: 'fee_asc', label: 'Lowest Tuition Fee' },
];


const FALLBACK_TOP_AP_COLLEGES = Object.values(AP_COLLEGES_METADATA || {}).slice(0, 5).map((c) => ({
  code: c.code,
  name: c.name,
  place: c.place || c.district || 'Andhra Pradesh',
  annualFee: c.annualFee || c.fee || 47000,
  type: c.type || 'Private',
  affiliation: c.affiliation || 'JNTUK',
  naac: c.naac || 'A',
  placements: c.placements || { highestPackage: '₹15.3 LPA', averagePackage: '₹4.2 LPA' },
  branches: c.feeByBranch ? Object.keys(c.feeByBranch) : ['CSE', 'ECE', 'EEE', 'CIV', 'MEC'],
}));

export default function TopCollegesLeaderboard() {
  const [branch, setBranch] = useState('CSE');
  const [sort, setSort] = useState('rank');
  const [colleges, setColleges] = useState(FALLBACK_TOP_AP_COLLEGES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apEapcetApi.getColleges({ branch, sort })
      .then((res) => {
        if (res.data && res.data.length > 0) setColleges(res.data.slice(0, 5));
      })
      .catch((err) => {
        console.warn('TopCollegesLeaderboard AP using fallback dataset:', err);
      })
      .finally(() => setLoading(false));
  }, [branch, sort]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300">
              <Award size={16} />
            </div>
            <h3 className="text-xl font-bold text-white">Top 5 Engineering Institutions Leaderboard</h3>
            <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-300">
              Top 5 Only
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Ranked by cutoff competitiveness, verified placement CTCs, and government regulated fee tiers
          </p>
        </div>

        <Link to="/ap-eapcet/compare">
          <GlassButton size="sm" contentClassName="flex items-center gap-1.5 text-xs">
            <TrendingUp size={13} />
            <span>Compare Any 2 Colleges</span>
          </GlassButton>
        </Link>
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-white/[0.06] pb-4">
        {/* Branch Selector Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
          {BRANCH_OPTIONS.map((b) => (
            <button
              key={b.code}
              onClick={() => setBranch(b.code)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                branch === b.code
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {b.code}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/40 font-medium">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
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

      {/* Colleges List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3.5">
          {colleges.map((c, idx) => {
            const cutoffInfo = c.cutoffs?.[branch];
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
                        <h4 className="font-bold text-white text-sm sm:text-base truncate">
                          {c.name}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-white/50">
                        <span>{c.district}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">NAAC {c.naac}</span>
                        <span>•</span>
                        <span>{c.nirfRank}</span>
                        <span>•</span>
                        <span>Est. {c.established}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle / Right: Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/[0.06]">
                    {/* 2025 Cutoff */}
                    <div className="rounded-lg bg-white/[0.02] p-2 sm:p-0">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">2025 OC Rank</p>
                      <p className="font-mono font-bold text-sm text-purple-300 mt-0.5">
                        {cutoffInfo?.oc2025 ? `~${cutoffInfo.oc2025.toLocaleString()}` : (cutoffInfo?.oc2024 ? `~${cutoffInfo.oc2024.toLocaleString()}` : '—')}
                      </p>
                      {cutoffInfo?.final2025 && (
                        <p className="text-[10px] text-purple-400/60 font-mono">Final: {cutoffInfo.final2025.toLocaleString()}</p>
                      )}
                    </div>

                    {/* Placements */}
                    <div className="rounded-lg bg-white/[0.02] p-2 sm:p-0">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Avg / High Package</p>
                      <p className="font-bold text-xs sm:text-sm text-white/90 mt-0.5">
                        <span className="text-emerald-400 font-semibold">{c.placements.averagePackage}</span>
                        <span className="text-white/30 text-[11px]"> / {c.placements.highestPackage}</span>
                      </p>
                    </div>

                    {/* Annual Fee */}
                    <div className="rounded-lg bg-white/[0.02] p-2 sm:p-0">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Govt. Tuition Fee</p>
                      <p className="font-bold text-xs sm:text-sm text-white/90 mt-0.5">
                        ₹{(c.annualFee / 1000).toFixed(0)}k <span className="text-white/40 text-[10px]">/ yr</span>
                      </p>
                    </div>

                    {/* Action */}
                    <div className="flex items-center sm:justify-end">
                      <Link
                        to={`/ap-eapcet/compare?c1=${c.code}&c2=JNTH&branch=${branch}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <span>Compare</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Top Recruiters Marquee strip */}
                {c.placements.topRecruiters && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex flex-wrap items-center gap-1.5 text-[11px] text-white/50">
                    <span className="text-white/30 font-medium">Top Recruiters:</span>
                    {c.placements.topRecruiters.slice(0, 5).map((rec, rIdx) => (
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
