import { useState, useEffect } from 'react';
import { Award, Briefcase, ChevronRight, DollarSign, Filter, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ecetApi } from '../../lib/ecetApi';
import { ECET_INSTITUTIONS } from '../../data/ecetInstitutions';
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

export default function TopCollegesLeaderboard() {
  const [branch, setBranch] = useState('CSE');
  const [sort, setSort] = useState('rank');
  const [colleges, setColleges] = useState(ECET_INSTITUTIONS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ecetApi
      .getColleges({ branch, sort })
      .then((res) => {
        const list = res?.data || (Array.isArray(res) ? res : []);
        if (list.length > 0) setColleges(list);
      })
      .catch((err) => console.error('Failed to load top colleges:', err))
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
            <h3 className="text-xl font-bold text-white">Top Engineering Institutions Leaderboard</h3>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Ranked by lateral entry cutoff competitiveness, verified placement CTCs, and government regulated fee tiers
          </p>
        </div>

        <Link to="/tg-ecet/compare">
          <GlassButton size="sm" contentClassName="flex items-center gap-1.5 text-xs">
            <TrendingUp size={13} />
            <span>Compare Any 2 Colleges</span>
          </GlassButton>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/[0.06]">
        {/* Branch Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {BRANCH_OPTIONS.map((b) => (
            <button
              key={b.code}
              onClick={() => setBranch(b.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                branch === b.code
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {b.code}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={13} className="text-white/40" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/80 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value} className="bg-gray-900 text-white">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* College Cards Grid */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {colleges.slice(0, 9).map((college, idx) => {
            const cut = college.cutoffs?.[branch];
            const ocRank = cut?.oc2025 || cut?.oc2024 || '—';

            return (
              <div
                key={college.code}
                className="group relative flex flex-col justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-purple-500/30 hover:bg-purple-950/20 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white/70">
                        {idx + 1}
                      </span>
                      <span className="rounded bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 font-mono text-[11px] font-bold text-purple-300">
                        {college.code}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40">{college.district}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors line-clamp-1">
                    {college.shortName || college.name}
                  </h4>
                  <p className="text-xs text-white/40 mt-0.5">{college.type}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.05] grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-white/40 block">OC Cutoff</span>
                    <span className="font-mono font-bold text-purple-300">#{ocRank}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block">Max CTC</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {college.placements?.highestPackage || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block">Fee/Yr</span>
                    <span className="font-mono font-bold text-cyan-300">
                      {college.annualFee ? `₹${(college.annualFee / 1000).toFixed(0)}k` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
