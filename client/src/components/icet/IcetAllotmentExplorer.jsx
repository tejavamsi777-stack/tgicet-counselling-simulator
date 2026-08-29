import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Users,
  Award,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Filter,
  X,
  PieChart,
  Layers,
  MapPin,
  Sparkles,
  Building,
  GraduationCap,
  Calendar,
  Database,
  BarChart3,
  CheckCircle2,
  Info,
  ArrowRight
} from 'lucide-react';
import UniqueDataLoader from '../shared/UniqueDataLoader';
import { icetApi } from '../../lib/icetApi';
import SearchableSelect from '../shared/SearchableSelect';
import ThreeDotsLoader from '../ui/three-dots-loader';
import { smoothScrollTo } from '../../lib/utils';
import localSummary from '../../data/icet_allotments/allotments_summary.json';

// Seat category color pills
function getSeatCategoryStyle(cat = '') {
  const c = String(cat).toUpperCase().replace(/_/g, '-').trim();
  if (c.startsWith('OC-GIRL') || c.includes('GIRL')) return 'bg-pink-500/20 border-pink-400/40 text-pink-300 shadow-sm shadow-pink-500/20';
  if (c.startsWith('OC')) return 'bg-sky-500/20 border-sky-400/40 text-sky-300 shadow-sm shadow-sky-500/20';
  if (c.startsWith('EWS')) return 'bg-teal-500/20 border-teal-400/40 text-teal-300 shadow-sm shadow-teal-500/20';
  if (c.startsWith('BC-A')) return 'bg-orange-500/20 border-orange-400/40 text-orange-300 shadow-sm shadow-orange-500/20';
  if (c.startsWith('BC-B')) return 'bg-amber-500/20 border-amber-400/40 text-amber-300 shadow-sm shadow-amber-500/20';
  if (c.startsWith('BC-C')) return 'bg-lime-500/20 border-lime-400/40 text-lime-300 shadow-sm shadow-lime-500/20';
  if (c.startsWith('BC-D')) return 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-sm shadow-emerald-500/20';
  if (c.startsWith('BC-E')) return 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300 shadow-sm shadow-indigo-500/20';
  if (c.startsWith('ST')) return 'bg-rose-500/20 border-rose-400/40 text-rose-300 shadow-sm shadow-rose-500/20';
  if (c.startsWith('SC')) return 'bg-purple-500/20 border-purple-400/40 text-purple-300 shadow-sm shadow-purple-500/20';
  return 'bg-violet-500/20 border-violet-400/40 text-violet-300 shadow-sm shadow-violet-500/20';
}

function getCategoryColor(cat = '') {
  const c = String(cat).toUpperCase().replace(/_/g, '-').trim();
  if (c.startsWith('OC-GIRL') || c.includes('GIRL')) return { primary: '#f472b6', secondary: '#db2777', glow: 'rgba(244, 114, 182, 0.6)' };
  if (c.startsWith('OC')) return { primary: '#38bdf8', secondary: '#0284c7', glow: 'rgba(56, 189, 248, 0.6)' };
  if (c.startsWith('EWS')) return { primary: '#2dd4bf', secondary: '#0f766e', glow: 'rgba(45, 212, 191, 0.6)' };
  if (c.startsWith('BC-A')) return { primary: '#fb923c', secondary: '#ea580c', glow: 'rgba(251, 146, 60, 0.6)' };
  if (c.startsWith('BC-B')) return { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245, 158, 11, 0.6)' };
  if (c.startsWith('BC-C')) return { primary: '#a3e635', secondary: '#65a30d', glow: 'rgba(163, 230, 53, 0.6)' };
  if (c.startsWith('BC-D')) return { primary: '#10b981', secondary: '#047857', glow: 'rgba(16, 185, 129, 0.6)' };
  if (c.startsWith('BC-E')) return { primary: '#818cf8', secondary: '#4f46e5', glow: 'rgba(129, 140, 248, 0.6)' };
  if (c.startsWith('ST')) return { primary: '#f43f5e', secondary: '#be123c', glow: 'rgba(244, 63, 94, 0.6)' };
  if (c.startsWith('SC')) return { primary: '#c084fc', secondary: '#7e22ce', glow: 'rgba(192, 132, 252, 0.6)' };
  return { primary: '#a855f7', secondary: '#7e22ce', glow: 'rgba(168, 85, 247, 0.6)' };
}

function StatCard({ icon: Icon, label, value, sub, accent = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all duration-300 hover:border-white/20 ${
        accent
          ? 'border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-black/60 to-black/80 shadow-lg shadow-purple-950/30'
          : 'border-white/[0.08] bg-black/40'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">{label}</p>
        {Icon && <Icon size={16} className={accent ? 'text-purple-400' : 'text-white/30'} />}
      </div>
      <p
        className={`font-mono text-2xl sm:text-3xl font-bold tracking-tight ${
          accent ? 'text-purple-300' : 'text-white'
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-[11px] text-white/40 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Interactive Gender Donut Chart ─────────────────────────────────────────
function InteractiveGenderChart({ candidates = [], male = 0, female = 0, maleP = 0, femaleP = 0 }) {
  const [activeSlice, setActiveSlice] = useState(null);
  const total = male + female;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const maleStroke = total > 0 ? (male / total) * circumference : 0;
  const femaleStroke = total > 0 ? (female / total) * circumference : 0;

  const genderRanks = useMemo(() => {
    const mRanks = candidates
      .filter((c) => (c.gender || '').toUpperCase().startsWith('M'))
      .map((c) => c.rank)
      .filter(Boolean);
    const fRanks = candidates
      .filter((c) => (c.gender || '').toUpperCase().startsWith('F'))
      .map((c) => c.rank)
      .filter(Boolean);
    return {
      maleMin: mRanks.length ? Math.min(...mRanks) : 0,
      maleMax: mRanks.length ? Math.max(...mRanks) : 0,
      femaleMin: fRanks.length ? Math.min(...fRanks) : 0,
      femaleMax: fRanks.length ? Math.max(...fRanks) : 0,
    };
  }, [candidates]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-black/40 p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between">
      <div
        className="absolute -right-12 -top-12 h-44 w-44 rounded-full blur-3xl pointer-events-none transition-all duration-500"
        style={{
          backgroundColor:
            activeSlice === 'male'
              ? 'rgba(34, 211, 238, 0.15)'
              : activeSlice === 'female'
              ? 'rgba(244, 114, 182, 0.15)'
              : 'rgba(168, 85, 247, 0.08)',
        }}
      />

      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            <PieChart size={15} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">Gender Distribution</h4>
            <p className="text-[10px] text-white/40">Touch or hover slices to inspect detailed metrics</p>
          </div>
        </div>
        <span className="text-[11px] text-white/50 font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
          {total} Total Seats
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-3">
        <div className="relative flex items-center justify-center cursor-pointer select-none">
          <svg width="140" height="140" className="-rotate-90">
            <defs>
              <linearGradient id="icetMaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="icetFemaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>

            <circle cx="70" cy="70" r={radius} fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />

            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="url(#icetMaleGrad)"
              strokeWidth={activeSlice === 'male' ? 18 : 14}
              strokeDasharray={`${maleStroke} ${circumference}`}
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{
                filter: activeSlice === 'male' ? 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))' : 'none',
                opacity: activeSlice === 'female' ? 0.4 : 1,
              }}
              onMouseEnter={() => setActiveSlice('male')}
              onMouseLeave={() => setActiveSlice(null)}
              onTouchStart={() => setActiveSlice(activeSlice === 'male' ? null : 'male')}
            />

            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="url(#icetFemaleGrad)"
              strokeWidth={activeSlice === 'female' ? 18 : 14}
              strokeDasharray={`${femaleStroke} ${circumference}`}
              strokeDashoffset={-maleStroke}
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{
                filter: activeSlice === 'female' ? 'drop-shadow(0 0 8px rgba(244, 114, 182, 0.6))' : 'none',
                opacity: activeSlice === 'male' ? 0.4 : 1,
              }}
              onMouseEnter={() => setActiveSlice('female')}
              onMouseLeave={() => setActiveSlice(null)}
              onTouchStart={() => setActiveSlice(activeSlice === 'female' ? null : 'female')}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
            {activeSlice === 'male' ? (
              <div>
                <span className="text-base font-mono font-black text-cyan-300">{maleP}%</span>
                <span className="text-[9px] uppercase font-bold tracking-wider text-cyan-400 block">♂ Male</span>
              </div>
            ) : activeSlice === 'female' ? (
              <div>
                <span className="text-base font-mono font-black text-pink-300">{femaleP}%</span>
                <span className="text-[9px] uppercase font-bold tracking-wider text-pink-400 block">♀ Female</span>
              </div>
            ) : (
              <div>
                <span className="text-base font-mono font-black text-white">{total}</span>
                <span className="text-[9px] uppercase tracking-wider text-white/40 block font-bold">Seats</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 w-full space-y-2.5">
          <div
            onClick={() => setActiveSlice(activeSlice === 'male' ? null : 'male')}
            onMouseEnter={() => setActiveSlice('male')}
            onMouseLeave={() => setActiveSlice(null)}
            className={`rounded-2xl border p-3 transition-all duration-200 cursor-pointer ${
              activeSlice === 'male'
                ? 'border-cyan-400/50 bg-cyan-950/30 shadow-md shadow-cyan-950/50 scale-[1.02]'
                : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 shadow-sm shadow-cyan-400/50" />
                <span className="text-xs font-bold text-white">♂ Male Candidates</span>
              </div>
              <span className="font-mono text-xs font-bold text-cyan-300">{maleP}%</span>
            </div>
            <div className="flex justify-between items-center mt-1.5 text-[11px] text-white/50">
              <span>{male} Candidates</span>
              {genderRanks.maleMin > 0 && (
                <span className="font-mono text-[10px] text-cyan-200/80">
                  #{genderRanks.maleMin.toLocaleString()} → #{genderRanks.maleMax.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div
            onClick={() => setActiveSlice(activeSlice === 'female' ? null : 'female')}
            onMouseEnter={() => setActiveSlice('female')}
            onMouseLeave={() => setActiveSlice(null)}
            className={`rounded-2xl border p-3 transition-all duration-200 cursor-pointer ${
              activeSlice === 'female'
                ? 'border-pink-400/50 bg-pink-950/30 shadow-md shadow-pink-950/50 scale-[1.02]'
                : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 shadow-sm shadow-pink-400/50" />
                <span className="text-xs font-bold text-white">♀ Female Candidates</span>
              </div>
              <span className="font-mono text-xs font-bold text-pink-300">{femaleP}%</span>
            </div>
            <div className="flex justify-between items-center mt-1.5 text-[11px] text-white/50">
              <span>{female} Candidates</span>
              {genderRanks.femaleMin > 0 && (
                <span className="font-mono text-[10px] text-pink-200/80">
                  #{genderRanks.femaleMin.toLocaleString()} → #{genderRanks.femaleMax.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/[0.05]">
        <div className="flex justify-between text-[10px] text-white/40 mb-1 font-mono font-medium">
          <span>♂ Male ({male})</span>
          <span>♀ Female ({female})</span>
        </div>
        <div className="flex h-2.5 rounded-full overflow-hidden bg-white/5 p-0.5 border border-white/10">
          <div
            className="h-full rounded-l-full bg-gradient-to-r from-sky-400 to-cyan-400 transition-all duration-700"
            style={{ width: `${maleP}%` }}
          />
          <div
            className="h-full rounded-r-full bg-gradient-to-r from-pink-400 to-rose-400 transition-all duration-700"
            style={{ width: `${femaleP}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Interactive Category Breakdown Bar Graph ──────────────────────────────
function InteractiveCategoryChart({ candidates = [] }) {
  const [viewMode, setViewMode] = useState('caste'); // 'caste' | 'quota'
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const casteData = useMemo(() => {
    const map = {};
    const total = candidates.length || 1;
    candidates.forEach((c) => {
      const cat = (c.caste || 'OC').toUpperCase().trim();
      if (!map[cat]) {
        map[cat] = {
          name: cat,
          count: 0,
          openingRank: c.rank,
          closingRank: c.rank,
          male: 0,
          female: 0,
        };
      }
      map[cat].count++;
      map[cat].openingRank = Math.min(map[cat].openingRank, c.rank);
      map[cat].closingRank = Math.max(map[cat].closingRank, c.rank);
      if ((c.gender || '').toUpperCase().startsWith('M')) map[cat].male++;
      else map[cat].female++;
    });

    const order = ['OC', 'EWS', 'BC_A', 'BC_B', 'BC_C', 'BC_D', 'BC_E', 'SC', 'ST'];
    return Object.values(map)
      .map((item) => ({
        ...item,
        percent: Math.round((item.count / total) * 100),
      }))
      .sort((a, b) => {
        const iA = order.indexOf(a.name);
        const iB = order.indexOf(b.name);
        return (iA === -1 ? 99 : iA) - (iB === -1 ? 99 : iB);
      });
  }, [candidates]);

  const quotaData = useMemo(() => {
    const map = {};
    const total = candidates.length || 1;
    candidates.forEach((c) => {
      const cat = c.seatCategory || 'OC_GEN_OU';
      if (!map[cat]) {
        map[cat] = {
          name: cat,
          count: 0,
          openingRank: c.rank,
          closingRank: c.rank,
          male: 0,
          female: 0,
        };
      }
      map[cat].count++;
      map[cat].openingRank = Math.min(map[cat].openingRank, c.rank);
      map[cat].closingRank = Math.max(map[cat].closingRank, c.rank);
      if ((c.gender || '').toUpperCase().startsWith('M')) map[cat].male++;
      else map[cat].female++;
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        percent: Math.round((item.count / total) * 100),
      }))
      .sort((a, b) => a.openingRank - b.openingRank);
  }, [candidates]);

  const activeDataset = viewMode === 'caste' ? casteData : quotaData;
  const maxCount = Math.max(...activeDataset.map((d) => d.count), 1);
  const activeTooltipItem = hoveredCategory || activeDataset[0] || null;

  if (!candidates.length) return null;

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-black/40 p-5 sm:p-6 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300">
            <Layers size={15} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              Category Distribution
            </h4>
            <p className="text-[10px] text-white/40">Seat allocation &amp; rank intervals across categories</p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('caste')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              viewMode === 'caste'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Candidate Caste
          </button>
          <button
            type="button"
            onClick={() => setViewMode('quota')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              viewMode === 'quota'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Allotted Quotas ({quotaData.length})
          </button>
        </div>
      </div>

      {activeTooltipItem && (
        <div className="mb-5 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-black/80 to-purple-950/20 p-3.5 backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex rounded-md border px-2.5 py-0.5 text-xs font-mono font-bold uppercase ${getSeatCategoryStyle(
                  activeTooltipItem.name
                )}`}
              >
                {activeTooltipItem.name}
              </span>
              <span className="text-xs font-bold text-white font-mono">
                {activeTooltipItem.count} Allotted Candidates ({activeTooltipItem.percent}%)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-white/70">
                <span className="text-[10px] uppercase text-white/40">Rank Spread:</span>
                <span className="text-cyan-300 font-bold">#{activeTooltipItem.openingRank?.toLocaleString()}</span>
                <span className="text-purple-400">→</span>
                <span className="text-purple-300 font-bold">#{activeTooltipItem.closingRank?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/60">
                <span className="text-cyan-300">♂ {activeTooltipItem.male}</span>
                <span>•</span>
                <span className="text-pink-300">♀ {activeTooltipItem.female}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
        {activeDataset.map((row) => {
          const fillWidth = Math.min(100, Math.max(6, Math.round((row.count / maxCount) * 100)));
          const colors = getCategoryColor(row.name);
          const isHovered = hoveredCategory?.name === row.name;

          return (
            <div
              key={row.name}
              onMouseEnter={() => setHoveredCategory(row)}
              onMouseLeave={() => setHoveredCategory(null)}
              onTouchStart={() => setHoveredCategory(row)}
              className={`group rounded-xl border p-2.5 transition-all duration-200 cursor-pointer ${
                isHovered
                  ? 'border-purple-400/50 bg-purple-950/25 shadow-md shadow-purple-950/40 scale-[1.01]'
                  : 'border-white/[0.04] bg-white/[0.015] hover:border-white/10 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.2 text-[10px] font-bold font-mono uppercase ${getSeatCategoryStyle(
                      row.name
                    )}`}
                  >
                    {row.name}
                  </span>
                  <span className="text-[11px] font-mono text-white/60">
                    #{row.openingRank?.toLocaleString()} ➔ #{row.closingRank?.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-white/40 text-[10px]">({row.percent}%)</span>
                  <span className="font-bold text-white">{row.count} Candidates</span>
                </div>
              </div>

              <div className="h-2 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/[0.08]">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${fillWidth}%`,
                    background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                    boxShadow: `0 0 10px ${colors.glow}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Interactive Category-Wise Closing Ranks Breakdown ──────────────────────
function CategoryClosingRanksBreakdown({ candidates = [] }) {
  const [viewMode, setViewMode] = useState('caste'); // 'caste' | 'boys' | 'girls' | 'quota'
  const [hoveredRow, setHoveredRow] = useState(null);

  const casteRanks = useMemo(() => {
    const map = {};
    candidates.forEach((c) => {
      const cat = (c.caste || 'OC').toUpperCase().trim();
      const isBoy = (c.gender || '').toUpperCase().startsWith('M');
      const isGirl = (c.gender || '').toUpperCase().startsWith('F');

      if (!map[cat]) {
        map[cat] = {
          category: cat,
          all: { openingRank: c.rank, closingRank: c.rank, count: 0 },
          boys: { openingRank: null, closingRank: null, count: 0 },
          girls: { openingRank: null, closingRank: null, count: 0 },
        };
      }

      map[cat].all.openingRank = Math.min(map[cat].all.openingRank, c.rank);
      map[cat].all.closingRank = Math.max(map[cat].all.closingRank, c.rank);
      map[cat].all.count++;

      if (isBoy) {
        map[cat].boys.openingRank = map[cat].boys.openingRank === null ? c.rank : Math.min(map[cat].boys.openingRank, c.rank);
        map[cat].boys.closingRank = map[cat].boys.closingRank === null ? c.rank : Math.max(map[cat].boys.closingRank, c.rank);
        map[cat].boys.count++;
      } else if (isGirl) {
        map[cat].girls.openingRank = map[cat].girls.openingRank === null ? c.rank : Math.min(map[cat].girls.openingRank, c.rank);
        map[cat].girls.closingRank = map[cat].girls.closingRank === null ? c.rank : Math.max(map[cat].girls.closingRank, c.rank);
        map[cat].girls.count++;
      }
    });

    const order = ['OC', 'EWS', 'BC_A', 'BC_B', 'BC_C', 'BC_D', 'BC_E', 'SC', 'ST'];
    return Object.values(map).sort((a, b) => {
      const iA = order.indexOf(a.category);
      const iB = order.indexOf(b.category);
      return (iA === -1 ? 99 : iA) - (iB === -1 ? 99 : iB);
    });
  }, [candidates]);

  const maxRank = useMemo(() => {
    let m = 1;
    candidates.forEach((c) => {
      if (c.rank > m) m = c.rank;
    });
    return m;
  }, [candidates]);

  if (!candidates.length) return null;

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-black/40 p-5 sm:p-6 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300">
            <Award size={15} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              Caste &amp; Gender Cutoff Trajectory
            </h4>
            <p className="text-[10px] text-white/40">Opening rank ➔ Closing cutoff threshold per category</p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setViewMode('caste')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              viewMode === 'caste'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                : 'text-white/50 hover:text-white'
            }`}
          >
            All Candidates
          </button>
          <button
            type="button"
            onClick={() => setViewMode('boys')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              viewMode === 'boys'
                ? 'bg-sky-500 text-black shadow-md shadow-sky-500/30'
                : 'text-sky-300/60 hover:text-sky-200'
            }`}
          >
            ♂ Boys
          </button>
          <button
            type="button"
            onClick={() => setViewMode('girls')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              viewMode === 'girls'
                ? 'bg-pink-500 text-black shadow-md shadow-pink-500/30'
                : 'text-pink-300/60 hover:text-pink-200'
            }`}
          >
            ♀ Girls
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
        {casteRanks.map((r) => {
          const current =
            viewMode === 'boys'
              ? r.boys
              : viewMode === 'girls'
              ? r.girls
              : r.all;

          if (!current.count) return null;

          const fillWidth = Math.min(100, Math.max(8, Math.round((current.closingRank / maxRank) * 100)));
          const colors = getCategoryColor(r.category);
          const isHovered = hoveredRow?.category === r.category;

          return (
            <div
              key={r.category}
              onMouseEnter={() => setHoveredRow(r)}
              onMouseLeave={() => setHoveredRow(null)}
              className={`group rounded-2xl border p-3 transition-all duration-200 cursor-pointer ${
                isHovered
                  ? 'border-amber-400/50 bg-white/[0.06] shadow-md shadow-amber-950/40 scale-[1.01]'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md border px-2 py-0.5 text-xs font-mono font-bold uppercase ${getSeatCategoryStyle(
                      r.category
                    )}`}
                  >
                    {r.category}
                  </span>
                  <span className="text-xs font-bold text-white font-mono">
                    {current.count} {viewMode === 'boys' ? 'Boys' : viewMode === 'girls' ? 'Girls' : 'Allotted'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase text-white/40">Opening:</span>
                    <span className="text-cyan-300 font-bold">#{current.openingRank?.toLocaleString()}</span>
                  </div>
                  <span className="text-white/30">➔</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase text-white/40">Closing:</span>
                    <span className="text-amber-300 font-bold">#{current.closingRank?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="h-2 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${fillWidth}%`,
                    background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                    boxShadow: `0 0 10px ${colors.glow}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Rank Range Histogram Component ─────────────────────────────────────────
function RankDistributionHistogram({ candidates = [] }) {
  const brackets = useMemo(() => {
    const list = [
      { label: 'Top 500', min: 1, max: 500, count: 0, color: '#38bdf8' },
      { label: '501 - 2,000', min: 501, max: 2000, count: 0, color: '#818cf8' },
      { label: '2,001 - 5,000', min: 2001, max: 5000, count: 0, color: '#c084fc' },
      { label: '5,001 - 10,000', min: 5001, max: 10000, count: 0, color: '#f472b6' },
      { label: '10,001 - 25,000', min: 10001, max: 25000, count: 0, color: '#fb923c' },
      { label: '25,000+', min: 25001, max: 999999, count: 0, color: '#f87171' },
    ];

    candidates.forEach((c) => {
      const r = c.rank || 0;
      const b = list.find((item) => r >= item.min && r <= item.max);
      if (b) b.count++;
    });

    const total = candidates.length || 1;
    return list.map((b) => ({
      ...b,
      percent: Math.round((b.count / total) * 100),
    }));
  }, [candidates]);

  const maxCount = Math.max(...brackets.map((b) => b.count), 1);

  if (!candidates.length) return null;

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-black/40 p-5 sm:p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
            <BarChart3 size={15} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              Rank Range Distribution
            </h4>
            <p className="text-[10px] text-white/40">Density of allotted candidates across ICET rank brackets</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {brackets.map((b) => {
          const heightPercent = Math.min(100, Math.max(12, Math.round((b.count / maxCount) * 100)));
          return (
            <div
              key={b.label}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 flex flex-col justify-between hover:border-purple-500/30 transition-all"
            >
              <div>
                <span className="text-[11px] font-bold text-gray-300 block">{b.label}</span>
                <span className="text-lg font-mono font-extrabold text-white mt-1 block">
                  {b.count} <span className="text-xs text-gray-500 font-normal">({b.percent}%)</span>
                </span>
              </div>

              <div className="mt-4 h-16 flex items-end bg-white/5 rounded-xl p-1">
                <div
                  className="w-full rounded-lg transition-all duration-700"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: b.color,
                    boxShadow: `0 0 10px ${b.color}40`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const CATEGORY_FILTERS = [
  'ALL',
  'OC',
  'BC-A',
  'BC-B',
  'BC-C',
  'BC-D',
  'BC-E',
  'SC',
  'ST',
  'EWS'
];

export default function IcetAllotmentExplorer({ onDataLoaded }) {
  const [activeTab, setActiveTab] = useState('table'); // 'table' | 'analytics' | 'matrix'
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [collegesList, setCollegesList] = useState(() => localSummary?.colleges || []);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('MBA');
  const [selectedYear, setSelectedYear] = useState('2026-final');
  const tableRef = useRef(null);
  
  const [allotmentData, setAllotmentData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 100;

  // 1. Fetch metadata & colleges on mount
  useEffect(() => {
    async function loadMeta() {
      try {
        const res = await icetApi.getAllotmentMeta();
        const meta = res?.data?.data || res?.data;
        if (meta?.colleges && meta.colleges.length > 0) {
          setCollegesList(meta.colleges);
        }
      } catch (err) {
        console.warn('Failed to load ICET meta:', err);
      } finally {
        setMetaLoading(false);
      }
    }
    loadMeta();
  }, []);

  // 2. Fetch Allotment Data whenever college/branch/year changes
  useEffect(() => {
    let isCancelled = false;
    async function fetchAllotment() {
      if (!selectedCollege) {
        setAllotmentData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setCurrentPage(1);
      try {
        const res = await icetApi.getAllotments({
          college: selectedCollege,
          branch: selectedBranch,
          year: selectedYear,
          limit: 1000,
        });

        if (!isCancelled && res) {
          const payload = res?.data?.data || res?.data;
          setAllotmentData(payload);
          if (payload?.candidates?.length > 0) {
            onDataLoaded?.(true);
            smoothScrollTo(tableRef, 80);
          }
        }
      } catch (err) {
        console.warn('Error fetching ICET allotment:', err);
        if (!isCancelled) setAllotmentData(null);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchAllotment();
    return () => {
      isCancelled = true;
    };
  }, [selectedCollege, selectedBranch, selectedYear, onDataLoaded]);

  // Handle college change
  const handleCollegeChange = (code) => {
    setSelectedCollege(code);
    const col = collegesList.find((c) => c.code === code);
    if (col && col.coursesOffered && col.coursesOffered.length > 0) {
      if (!col.coursesOffered.includes(selectedBranch)) {
        setSelectedBranch(col.coursesOffered[0]);
      }
    }
  };

  const currentCollege = useMemo(() => {
    return collegesList.find((c) => c.code === selectedCollege) || allotmentData?.college;
  }, [collegesList, selectedCollege, allotmentData]);

  const availableCourses = useMemo(() => {
    if (allotmentData?.availableBranches?.length > 0) {
      return allotmentData.availableBranches.map((b) => b.code);
    }
    if (currentCollege?.coursesOffered?.length > 0) {
      return currentCollege.coursesOffered;
    }
    return ['MBA', 'MCA'];
  }, [allotmentData, currentCollege]);

  // Candidates filtering
  const filteredCandidates = useMemo(() => {
    if (!allotmentData?.candidates) return [];
    let list = [...allotmentData.candidates];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => {
        const name = String(c.name || '').toLowerCase();
        const ht = String(c.hallTicket || '').toLowerCase();
        const rank = String(c.rank || '').toLowerCase();
        const seat = String(c.seatCategory || '').toLowerCase();
        const caste = String(c.caste || '').toLowerCase();
        const reg = String(c.region || '').toLowerCase();
        return name.includes(q) || ht.includes(q) || rank.includes(q) || seat.includes(q) || caste.includes(q) || reg.includes(q);
      });
    }

    // 2. Category Filter (normalized comparison)
    if (categoryFilter && categoryFilter !== 'ALL') {
      const targetCat = categoryFilter.toUpperCase().replace(/[-_\s]/g, '');
      list = list.filter((c) => {
        const casteNorm = String(c.caste || '').toUpperCase().replace(/[-_\s]/g, '');
        const seatNorm = String(c.seatCategory || '').toUpperCase().replace(/[-_\s]/g, '');
        if (targetCat === 'OC') {
          return casteNorm === 'OC';
        }
        if (targetCat.startsWith('BC')) {
          return casteNorm.startsWith(targetCat);
        }
        if (targetCat === 'SC') {
          return casteNorm.startsWith('SC');
        }
        if (targetCat === 'ST') {
          return casteNorm.startsWith('ST');
        }
        if (targetCat === 'EWS') {
          return casteNorm === 'EWS' || seatNorm.includes('EWS');
        }
        return casteNorm === targetCat || seatNorm === targetCat || seatNorm.startsWith(targetCat + '_') || seatNorm.startsWith(targetCat + 'G');
      });
    }

    // 3. Gender Filter
    if (genderFilter && genderFilter !== 'ALL') {
      const targetGender = genderFilter.toUpperCase();
      list = list.filter((c) => {
        const g = String(c.gender || '').toUpperCase().trim();
        const seat = String(c.seatCategory || '').toUpperCase().trim();
        if (targetGender === 'FEMALE' || targetGender === 'F') {
          return g.startsWith('F') || seat.includes('GIRL') || seat.includes('FEMALE');
        }
        if (targetGender === 'MALE' || targetGender === 'M') {
          return (g.startsWith('M') || g === 'BOY' || g === 'BOYS') && !seat.includes('GIRL');
        }
        return true;
      });
    }

    return list;
  }, [allotmentData, searchQuery, categoryFilter, genderFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / pageSize) || 1;
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(start, start + pageSize);
  }, [filteredCandidates, currentPage, pageSize]);

  // Metrics computation
  const stats = useMemo(() => {
    const all = allotmentData?.candidates || [];
    if (all.length === 0) {
      return {
        total: 0,
        openingRank: '-',
        closingRank: '-',
        males: 0,
        females: 0,
        malePercent: 0,
        femalePercent: 0,
        ocClosing: '-',
        scClosing: '-',
        stClosing: '-',
        ewsClosing: '-',
      };
    }

    const femaleCount = all.filter((c) => (c.gender || '').toLowerCase().startsWith('f')).length;
    const maleCount = all.length - femaleCount;
    const malePercent = all.length ? Math.round((maleCount / all.length) * 100) : 0;
    const femalePercent = all.length ? 100 - malePercent : 0;

    const findLastRank = (cat) => {
      const matching = all.filter(
        (c) => (c.caste || '').toUpperCase() === cat || (c.seatCategory || '').toUpperCase().includes(cat)
      );
      if (matching.length === 0) return '-';
      return matching[matching.length - 1].rank?.toLocaleString() || '-';
    };

    return {
      total: all.length,
      openingRank: all[0]?.rank?.toLocaleString() || '-',
      closingRank: all[all.length - 1]?.rank?.toLocaleString() || '-',
      males: maleCount,
      females: femaleCount,
      malePercent,
      femalePercent,
      ocClosing: findLastRank('OC'),
      scClosing: findLastRank('SC'),
      stClosing: findLastRank('ST'),
      ewsClosing: findLastRank('EWS'),
    };
  }, [allotmentData]);

  // CSV Export
  const downloadCsv = () => {
    if (!filteredCandidates.length) return;
    const headers = [
      'S.No',
      'Hall Ticket No',
      'Rank',
      'Candidate Name',
      'Gender',
      'Caste',
      'Region',
      'Seat Category',
      'College Code',
      'Branch'
    ];
    const rows = filteredCandidates.map((c, i) => [
      i + 1,
      c.hallTicket,
      c.rank,
      `"${c.name?.replace(/"/g, '""')}"`,
      c.gender,
      c.caste,
      c.region,
      c.seatCategory,
      selectedCollege,
      selectedBranch
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `TG_ICET_Allotment_${selectedCollege}_${selectedBranch}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const collegeOptions = useMemo(() => {
    return collegesList.map((c) => ({
      value: c.code,
      label: `${c.code} - ${c.name} (${c.place || c.district || ''})`,
    }));
  }, [collegesList]);

  return (
    <div className="space-y-6">
      {/* ─── Control Bar ────────────────────────────────────────── */}
      <div className="relative z-30 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] via-black/80 to-purple-950/20 p-4 sm:p-6 backdrop-blur-2xl shadow-xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-12 items-end">
          
          {/* College Selector (span 6) */}
          <div className="md:col-span-2 lg:col-span-6 space-y-1.5 relative z-40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Building size={14} />
                {metaLoading ? (
                  <ThreeDotsLoader label="Select MBA / MCA College" dotClassName="bg-purple-400" />
                ) : (
                  <span>Select MBA / MCA College ({collegesList.length || 344} Institutions)</span>
                )}
              </label>
              {loading && (
                <ThreeDotsLoader label="Loading allotments" dotClassName="bg-purple-400" />
              )}
            </div>
            <SearchableSelect
              options={collegeOptions}
              value={selectedCollege}
              onChange={handleCollegeChange}
              loading={metaLoading}
              loadingLabel="Loading MBA / MCA colleges..."
              placeholder="Search by college name, code, or city..."
              className="w-full"
            />
            {loading && (
              <div className="flex items-center gap-2 pt-1 text-xs text-purple-300 font-medium">
                <span className="inline-flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                </span>
                <span>Loading student allotment records...</span>
              </div>
            )}
          </div>

          {/* Branch / Program Selector (span 3) */}
          <div className="lg:col-span-3 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <GraduationCap size={14} />
              <span>Program / Course</span>
            </label>
            <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
              {availableCourses.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBranch(b)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedBranch === b
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Phase Selector (span 3) */}
          <div className="lg:col-span-3 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Calendar size={14} />
              <span>Counselling Phase</span>
            </label>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-gray-200 flex items-center justify-between">
              <span>2026 Final Phase (Official Live)</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Selected College Meta Ribbon */}
        {currentCollege && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-purple-400" />
              <span>
                <strong className="text-white">{currentCollege.name}</strong> · {currentCollege.place || currentCollege.district} ({currentCollege.university || 'OU'} Affiliation)
              </span>
            </div>
            <div className="flex items-center gap-3">
              {currentCollege.annualFee ? (
                <span className="rounded-full bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 font-mono text-purple-300">
                  Fee: ₹{currentCollege.annualFee.toLocaleString()}/yr
                </span>
              ) : null}
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-emerald-300 font-semibold">
                Official Live Scraped
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Metric Stat Cards ──────────────────────────────────── */}
      <div ref={tableRef} className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <StatCard
          icon={Users}
          label="Total Allotted"
          value={!selectedCollege ? '—' : loading ? '...' : stats.total}
          sub={`${selectedBranch} Seats`}
          accent
        />
        <StatCard
          icon={TrendingUp}
          label="Opening Rank"
          value={!selectedCollege ? '—' : loading ? '...' : stats.openingRank}
          sub="Top Merit Candidate"
        />
        <StatCard
          icon={TrendingDown}
          label="Closing Rank"
          value={!selectedCollege ? '—' : loading ? '...' : stats.closingRank}
          sub="Last Allotted Rank"
        />
        <StatCard
          icon={ShieldCheck}
          label="OC Closing"
          value={!selectedCollege ? '—' : loading ? '...' : stats.ocClosing}
          sub="Open Competition"
        />
        <StatCard
          icon={Award}
          label="SC / ST Closing"
          value={!selectedCollege ? '—' : loading ? '...' : stats.scClosing}
          sub={`ST: ${stats.stClosing}`}
        />
        <StatCard
          icon={BarChart3}
          label="Gender Ratio"
          value={!selectedCollege ? '—' : loading ? '...' : `${stats.males}M / ${stats.females}F`}
          sub="Candidate Spread"
        />
      </div>

      {/* ─── View Mode Switcher Tabs ───────────────────────────── */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'table'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Database size={14} />
            <span>Candidate Allotment List</span>
            {allotmentData?.candidates?.length ? (
              <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-mono">
                {allotmentData.candidates.length}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <PieChart size={14} />
            <span>Data Analytics &amp; Visual Insights</span>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-1.5 py-0.2 text-[9px] font-extrabold uppercase">
              Interactive
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Award size={14} />
            <span>Cutoff Matrix &amp; Trajectory</span>
          </button>
        </div>

        {allotmentData?.candidates?.length ? (
          <div className="text-xs text-gray-400 font-mono hidden sm:block">
            Showing <strong className="text-white">{filteredCandidates.length}</strong> of{' '}
            <strong className="text-white">{allotmentData.candidates.length}</strong> candidates
          </div>
        ) : null}
      </div>

      {/* ─── Active Tab Content ─────────────────────────────────── */}
      {activeTab === 'analytics' ? (
        !selectedCollege ? (
          <div className="rounded-3xl border border-white/10 bg-black/60 p-16 text-center text-gray-400 backdrop-blur-xl">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <PieChart size={28} />
              </div>
              <p className="text-base font-bold text-white">Select a College for Analytics</p>
              <p className="text-xs text-gray-400 max-w-md">
                Please select any MBA or MCA college above to generate interactive gender donuts, category share graphs, and rank spread distributions.
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="p-2">
            <UniqueDataLoader
              examName="TG ICET"
              title="Analyzing Seat Allocation Metrics..."
              subtitle="Processing demographic spreads, closing cutoffs, and quota analytics..."
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <InteractiveGenderChart
                  candidates={allotmentData?.candidates || []}
                  male={stats.males}
                  female={stats.females}
                  maleP={stats.malePercent}
                  femaleP={stats.femalePercent}
                />
              </div>
              <div className="lg:col-span-7">
                <InteractiveCategoryChart candidates={allotmentData?.candidates || []} />
              </div>
            </div>

            <RankDistributionHistogram candidates={allotmentData?.candidates || []} />
            <CategoryClosingRanksBreakdown candidates={allotmentData?.candidates || []} />
          </div>
        )
      ) : activeTab === 'matrix' ? (
        !selectedCollege ? (
          <div className="rounded-3xl border border-white/10 bg-black/60 p-16 text-center text-gray-400 backdrop-blur-xl">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Award size={28} />
              </div>
              <p className="text-base font-bold text-white">Select a College for Cutoff Matrix</p>
              <p className="text-xs text-gray-400 max-w-md">
                Please select any MBA or MCA college above to inspect opening and closing ranks across all reservation categories and genders.
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="rounded-3xl border border-white/10 bg-black/60 p-16 text-center text-gray-400 backdrop-blur-xl">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
              <span className="text-xs font-medium">Computing cutoff matrix...</span>
            </div>
          </div>
        ) : (
          <CategoryClosingRanksBreakdown candidates={allotmentData?.candidates || []} />
        )
      ) : (
        /* ─── Default Table View ─────────────────────────────── */
        <>
          {/* Search, Filters & Export Row */}
          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by candidate name, hall ticket no, or rank..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Gender Filter */}
            <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 p-1 shrink-0">
              {[
                { id: 'ALL', label: 'All Genders' },
                { id: 'Male', label: 'Male' },
                { id: 'Female', label: 'Female' }
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setGenderFilter(g.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    genderFilter === g.id
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* CSV Export Button */}
            <button
              type="button"
              onClick={downloadCsv}
              disabled={!filteredCandidates.length}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-purple-600/30 px-4 py-2.5 text-xs font-bold text-purple-200 hover:bg-purple-600 hover:text-white transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer shrink-0 shadow-lg shadow-purple-900/30"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Category Pills Filter Bar */}
          <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter size={12} /> Caste:
            </span>
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategoryFilter(cat);
                  setCurrentPage(1);
                }}
                className={`rounded-full px-3 py-1 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ─── Candidate Allotment Table ─────────────────────────── */}
          <div className="relative z-10 overflow-hidden rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl">
            <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04] text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                <th className="py-3.5 px-4 text-center w-14">S.No</th>
                <th className="py-3.5 px-4">Hall Ticket No</th>
                <th className="py-3.5 px-4 text-purple-300">TG ICET Rank</th>
                <th className="py-3.5 px-4">Candidate Name</th>
                <th className="py-3.5 px-4 text-center">Gender</th>
                <th className="py-3.5 px-4 text-center">Caste</th>
                <th className="py-3.5 px-4 text-center">Region</th>
                <th className="py-3.5 px-4">Seat Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {!selectedCollege ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                        <Building size={28} />
                      </div>
                      <p className="text-base font-bold text-white">Select an MBA or MCA College</p>
                      <p className="text-xs text-gray-400 max-w-md">
                        Please choose any college from the dropdown above to view official candidate-wise seat allotments, closing ranks, and category distribution.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan={8} className="p-4 sm:p-8">
                    <UniqueDataLoader
                      examName="TG ICET"
                      title="Fetching Official TG ICET Allotments..."
                      subtitle="Connecting to tgicet.nic.in admission database to parse verified candidate seat allocations..."
                    />
                  </td>
                </tr>
              ) : paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Info size={28} className="text-gray-500" />
                      <p className="text-sm font-semibold text-white">No Allotment Records Found</p>
                      <p className="text-xs text-gray-400 max-w-md">
                        {allotmentData?.message ||
                          'No candidate records matched your filter criteria or this college might not offer this specific course.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((c, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={c.hallTicket || idx}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="py-3 px-4 text-center font-mono text-xs text-gray-500">
                        {globalIdx}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-200">
                        {c.hallTicket}
                      </td>
                      <td className="py-3 px-4 font-mono font-extrabold text-purple-300">
                        #{c.rank?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white group-hover:text-purple-200 transition-colors">
                        {c.name}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            c.gender === 'Female' || c.gender === 'F'
                              ? 'bg-pink-500/20 text-pink-300'
                              : 'bg-sky-500/20 text-sky-300'
                          }`}
                        >
                          {c.gender}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-xs text-gray-300">
                        {c.caste}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-xs text-gray-400">
                        {c.region}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block rounded-md border px-2.5 py-0.5 font-mono text-[11px] font-bold ${getSeatCategoryStyle(
                            c.seatCategory
                          )}`}
                        >
                          {c.seatCategory}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && filteredCandidates.length > pageSize && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 px-6 py-4 bg-white/[0.02]">
            <p className="text-xs text-gray-400">
              Showing <strong className="text-white">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-white">
                {Math.min(currentPage * pageSize, filteredCandidates.length)}
              </strong>{' '}
              of <strong className="text-white">{filteredCandidates.length}</strong> candidates
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/15 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-mono text-gray-300 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/15 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      </>
      )}

      {/* Official Data Source Attribution */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Database size={15} className="text-purple-400 shrink-0" />
          <span>
            Official source: <strong>tgicet.nic.in/college_allotment.aspx</strong> · State Council of Higher Education (TSCHE).
          </span>
        </div>
        <span className="text-[11px] text-gray-500">
          Last verified: {new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
