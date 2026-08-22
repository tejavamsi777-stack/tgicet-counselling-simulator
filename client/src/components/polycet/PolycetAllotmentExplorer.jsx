import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  ArrowRight,
  Database,
  BarChart3,
  CheckCircle2,
  Info
} from 'lucide-react';
import { polycetApi } from '../../lib/polycetApi';
import { POLYCET_INSTITUTIONS, POLYCET_BRANCHES } from '../../data/polycetInstitutions';
import allotmentsSummary from '../../data/polycet_allotments/allotments_summary.json';
import SearchableSelect from '../shared/SearchableSelect';

// ─── Seat category color pills ─────────────────────────────────────────────
function getSeatCategoryStyle(cat = '') {
  const c = String(cat).toUpperCase().replace(/_/g, '-').trim();
  if (c.startsWith('OC-GIRL')) return 'bg-pink-500/20 border-pink-400/40 text-pink-300 shadow-sm shadow-pink-500/20';
  if (c.startsWith('OC')) return 'bg-sky-500/20 border-sky-400/40 text-sky-300 shadow-sm shadow-sky-500/20';
  if (c.startsWith('EWS')) return 'bg-teal-500/20 border-teal-400/40 text-teal-300 shadow-sm shadow-teal-500/20';
  if (c.startsWith('BC-A')) return 'bg-orange-500/20 border-orange-400/40 text-orange-300 shadow-sm shadow-orange-500/20';
  if (c.startsWith('BC-B')) return 'bg-amber-500/20 border-amber-400/40 text-amber-300 shadow-sm shadow-amber-500/20';
  if (c.startsWith('BC-C')) return 'bg-lime-500/20 border-lime-400/40 text-lime-300 shadow-sm shadow-lime-500/20';
  if (c.startsWith('BC-D')) return 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-sm shadow-emerald-500/20';
  if (c.startsWith('BC-E')) return 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300 shadow-sm shadow-indigo-500/20';
  if (c.startsWith('ST')) return 'bg-rose-500/20 border-rose-400/40 text-rose-300 shadow-sm shadow-rose-500/20';
  if (c.includes('SC-3') || c.includes('SC-III') || c.includes('SC3')) return 'bg-pink-500/20 border-pink-400/40 text-pink-300 shadow-sm shadow-pink-500/20';
  if (c.includes('SC-2') || c.includes('SC-II') || c.includes('SC2')) return 'bg-fuchsia-500/20 border-fuchsia-400/40 text-fuchsia-300 shadow-sm shadow-fuchsia-500/20';
  if (c.startsWith('SC')) return 'bg-purple-500/20 border-purple-400/40 text-purple-300 shadow-sm shadow-purple-500/20';
  return 'bg-violet-500/20 border-violet-400/40 text-violet-300 shadow-sm shadow-violet-500/20';
}

function getCategoryColor(cat = '') {
  const c = String(cat).toUpperCase().replace(/_/g, '-').trim();
  if (c.startsWith('OC-GIRL')) return { primary: '#f472b6', secondary: '#db2777', glow: 'rgba(244, 114, 182, 0.6)' };
  if (c.startsWith('OC')) return { primary: '#38bdf8', secondary: '#0284c7', glow: 'rgba(56, 189, 248, 0.6)' };
  if (c.startsWith('EWS')) return { primary: '#2dd4bf', secondary: '#0f766e', glow: 'rgba(45, 212, 191, 0.6)' };
  if (c.startsWith('BC-A')) return { primary: '#fb923c', secondary: '#ea580c', glow: 'rgba(251, 146, 60, 0.6)' };
  if (c.startsWith('BC-B')) return { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245, 158, 11, 0.6)' };
  if (c.startsWith('BC-C')) return { primary: '#a3e635', secondary: '#65a30d', glow: 'rgba(163, 230, 53, 0.6)' };
  if (c.startsWith('BC-D')) return { primary: '#10b981', secondary: '#047857', glow: 'rgba(16, 185, 129, 0.6)' };
  if (c.startsWith('BC-E')) return { primary: '#818cf8', secondary: '#4f46e5', glow: 'rgba(129, 140, 248, 0.6)' };
  if (c.startsWith('ST')) return { primary: '#f43f5e', secondary: '#be123c', glow: 'rgba(244, 63, 94, 0.6)' };
  if (c.includes('SC-3') || c.includes('SC-III') || c.includes('SC3')) return { primary: '#f472b6', secondary: '#be185d', glow: 'rgba(244, 114, 182, 0.6)' };
  if (c.includes('SC-2') || c.includes('SC-II') || c.includes('SC2')) return { primary: '#e879f9', secondary: '#a21caf', glow: 'rgba(232, 121, 249, 0.6)' };
  if (c.startsWith('SC')) return { primary: '#c084fc', secondary: '#7e22ce', glow: 'rgba(192, 132, 252, 0.6)' };
  return { primary: '#a855f7', secondary: '#7e22ce', glow: 'rgba(168, 85, 247, 0.6)' };
}

// ─── Stat card ──────────────────────────────────────────────────────────────
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

// ─── Interactive SVG Gender Donut Chart (With Touch & Hover Tooltip) ─────────
function InteractiveGenderChart({ candidates = [], male = 0, female = 0, maleP = 0, femaleP = 0 }) {
  const [activeSlice, setActiveSlice] = useState(null); // 'male' | 'female' | null
  const total = male + female;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const maleStroke = total > 0 ? (male / total) * circumference : 0;
  const femaleStroke = total > 0 ? (female / total) * circumference : 0;

  // Gender rank details
  const genderRanks = useMemo(() => {
    const mRanks = candidates.filter((c) => (c.gender || '').toUpperCase().startsWith('M')).map((c) => c.rank).filter(Boolean);
    const fRanks = candidates.filter((c) => (c.gender || '').toUpperCase().startsWith('F')).map((c) => c.rank).filter(Boolean);
    return {
      maleMin: mRanks.length ? Math.min(...mRanks) : 0,
      maleMax: mRanks.length ? Math.max(...mRanks) : 0,
      femaleMin: fRanks.length ? Math.min(...fRanks) : 0,
      femaleMax: fRanks.length ? Math.max(...fRanks) : 0,
    };
  }, [candidates]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-black/40 p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between">
      {/* Background radial glow */}
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

      {/* Header */}
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

      {/* Donut & Interactive Center HUD */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-3">
        {/* SVG Donut */}
        <div className="relative flex items-center justify-center cursor-pointer select-none">
          <svg width="140" height="140" className="-rotate-90">
            <defs>
              <linearGradient id="maleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="femaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <filter id="glowMale" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background track */}
            <circle cx="70" cy="70" r={radius} fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />

            {/* Male Slice */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="url(#maleGrad)"
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

            {/* Female Slice */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="url(#femaleGrad)"
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

          {/* Center Info Hub */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
            {activeSlice === 'male' ? (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <span className="text-base font-mono font-black text-cyan-300">{maleP}%</span>
                <span className="text-[9px] uppercase font-bold tracking-wider text-cyan-400 block">♂ Male</span>
              </div>
            ) : activeSlice === 'female' ? (
              <div className="animate-in fade-in zoom-in-95 duration-200">
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

        {/* Interactive Legend Cards */}
        <div className="flex-1 w-full space-y-2.5">
          {/* Male Card */}
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

          {/* Female Card */}
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

      {/* Dual Gradient Ratio Bar Track */}
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

// Helper to check if candidate is Physically Handicapped
function isPHReservation(seatCategory = '', caste = '') {
  const seat = String(seatCategory || '').toUpperCase();
  const cst = String(caste || '').toUpperCase();
  return (
    seat.includes('_PHH_') ||
    seat.includes('_PHO_') ||
    seat.includes('_PHV_') ||
    seat.includes('_PHM_') ||
    seat.includes('_PH_') ||
    seat.includes('_PWD_') ||
    seat.includes('PHH') ||
    seat.includes('PHO') ||
    seat.includes('PHV') ||
    cst.includes('PHH') ||
    cst.includes('PHO') ||
    cst.includes('PHV') ||
    cst === 'PH' ||
    cst === 'PWD'
  );
}

// Helper to format Caste nicely
function formatCasteLabel(raw = '') {
  const c = String(raw).toUpperCase().trim().replace(/_/g, '-');
  if (c.startsWith('PH') || c.includes('PHH') || c.includes('PWD')) return 'PHH';
  if (c.startsWith('OC')) return 'OC';
  if (c.startsWith('EWS')) return 'EWS';
  if (c.startsWith('BC-A')) return 'BC-A';
  if (c.startsWith('BC-B')) return 'BC-B';
  if (c.startsWith('BC-C')) return 'BC-C';
  if (c.startsWith('BC-D')) return 'BC-D';
  if (c.startsWith('BC-E')) return 'BC-E';
  if (c.startsWith('ST')) return 'ST';
  if (c === 'SC-1' || c === 'SC-I' || c === 'SC1' || c === 'SC_I') return 'SC-1';
  if (c === 'SC-2' || c === 'SC-II' || c === 'SC2' || c === 'SC_II') return 'SC-2';
  if (c === 'SC-3' || c === 'SC-III' || c === 'SC3' || c === 'SC_III') return 'SC-3';
  if (c.startsWith('SC')) return 'SC';
  return c || 'OC';
}

function resolveCandidateCaste(c = {}) {
  // If candidate was allotted under a Physically Handicapped quota or marked PH, keep as PHH at last
  if (isPHReservation(c.seatCategory, c.caste || c.category)) {
    return 'PHH';
  }
  const rawCaste = (c.caste || c.category || '').trim();
  return formatCasteLabel(rawCaste || 'OC');
}

const CASTE_ORDER_MAP = {
  'OC': 1,
  'EWS': 2,
  'BC-A': 3,
  'BC-B': 4,
  'BC-C': 5,
  'BC-D': 6,
  'BC-E': 7,
  'SC': 8,
  'SC-1': 9,
  'SC-I': 9,
  'SC-2': 10,
  'SC-II': 10,
  'SC-3': 11,
  'SC-III': 11,
  'ST': 12,
  'CAP': 95,
  'NCC': 96,
  'SPORTS': 97,
  'PHH': 99,
  'PH': 99,
  'PH / PHH': 99,
  'PWD': 99,
};

function getCastePriority(caste = '') {
  const key = formatCasteLabel(caste);
  return CASTE_ORDER_MAP[key] || 999;
}

// ─── Interactive Seats by Category Bar Graph (With Live Floating Tooltip) ────
function InteractiveCategoryChart({ candidates = [] }) {
  const [viewMode, setViewMode] = useState('caste'); // 'caste' | 'quota'
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Grouped by Candidate Actual Caste (OC, EWS, BC-A, BC-B, BC-C, BC-D, BC-E, ST, SC, SC-1, SC-2, SC-3, PHH)
  const casteData = useMemo(() => {
    const map = {};
    const total = candidates.length || 1;
    candidates.forEach((c) => {
      const rootCat = resolveCandidateCaste(c);
      if (!map[rootCat]) {
        map[rootCat] = {
          name: rootCat,
          count: 0,
          openingRank: c.rank,
          closingRank: c.rank,
          male: 0,
          female: 0,
        };
      }
      map[rootCat].count++;
      map[rootCat].openingRank = Math.min(map[rootCat].openingRank, c.rank);
      map[rootCat].closingRank = Math.max(map[rootCat].closingRank, c.rank);
      if ((c.gender || '').toUpperCase().startsWith('M')) map[rootCat].male++;
      else map[rootCat].female++;
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        percent: Math.round((item.count / total) * 100),
      }))
      .sort((a, b) => getCastePriority(a.name) - getCastePriority(b.name));
  }, [candidates]);

  // Sub-quota Allotment Categories (OC_GEN_OU, BC_A_GIRLS_OU, etc.)
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
      .sort((a, b) => b.count - a.count);
  }, [candidates]);

  const activeDataset = viewMode === 'caste' ? casteData : quotaData;
  const maxCount = Math.max(...activeDataset.map((d) => d.count), 1);
  const activeTooltipItem = hoveredCategory || activeDataset[0];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-black/40 p-5 sm:p-6 backdrop-blur-xl">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300">
            <BarChart3 size={15} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              Seats Allotted by {viewMode === 'caste' ? 'Candidate Caste' : 'Allotted Quota'}
            </h4>
            <p className="text-[10px] text-white/40">Touch or hover any bar for rank range and demographic details</p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('caste')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              viewMode === 'caste'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Candidate Caste ({casteData.length})
          </button>
          <button
            type="button"
            onClick={() => setViewMode('quota')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              viewMode === 'quota'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Allotted Quotas ({quotaData.length})
          </button>
        </div>
      </div>

      {/* Floating Active Details HUD Card */}
      {activeTooltipItem && (
        <div className="mb-5 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-black/80 to-purple-950/20 p-3.5 backdrop-blur-2xl transition-all duration-300">
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
                <span className="text-cyan-300 font-bold">#{activeTooltipItem.openingRank.toLocaleString()}</span>
                <span className="text-purple-400">→</span>
                <span className="text-purple-300 font-bold">#{activeTooltipItem.closingRank.toLocaleString()}</span>
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

      {/* Horizontal Bar Chart Rows */}
      <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-2 scrollbar-thin">
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
              {/* Category label and count */}
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
                    #{row.openingRank.toLocaleString()} ➔ #{row.closingRank.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-white/40 text-[10px]">({row.percent}%)</span>
                  <span className="font-bold text-white">{row.count} {viewMode === 'caste' ? 'Candidates' : 'Seats'}</span>
                </div>
              </div>

              {/* Progress Bar */}
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
// ─── Interactive Category-Wise Closing Ranks Breakdown ──────────────────────
function CategoryClosingRanksBreakdown({ candidates = [] }) {
  const [viewMode, setViewMode] = useState('caste'); // 'caste' | 'boys' | 'girls' | 'quota'
  const [hoveredRow, setHoveredRow] = useState(null);

  // Grouped by Caste with dedicated Boys (♂) and Girls (♀) rank intervals
  const casteRanks = useMemo(() => {
    const map = {};
    candidates.forEach((c) => {
      const cat = resolveCandidateCaste(c);
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

    return Object.values(map).sort((a, b) => getCastePriority(a.category) - getCastePriority(b.category));
  }, [candidates]);

  // Quota Allotment Categories
  const quotaRanks = useMemo(() => {
    const map = {};
    candidates.forEach((c) => {
      const cat = c.seatCategory || 'OC_GEN_OU';
      if (!map[cat]) {
        map[cat] = { category: cat, openingRank: c.rank, closingRank: c.rank, count: 0 };
      }
      map[cat].openingRank = Math.min(map[cat].openingRank, c.rank);
      map[cat].closingRank = Math.max(map[cat].closingRank, c.rank);
      map[cat].count++;
    });
    return Object.values(map).sort((a, b) => a.openingRank - b.openingRank);
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
              {viewMode === 'quota' ? 'Quota Closing Trajectory' : 'Caste & Gender Closing Ranks'}
            </h4>
            <p className="text-[10px] text-white/40">Opening rank ➔ Closing cutoff threshold per caste & gender</p>
          </div>
        </div>

        {/* View Switcher Pills */}
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
            All Castes
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
          <button
            type="button"
            onClick={() => setViewMode('quota')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              viewMode === 'quota'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Quota ({quotaRanks.length})
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {viewMode === 'quota' ? (
          quotaRanks.map((r) => {
            const fillWidth = Math.min(100, Math.max(8, Math.round((r.closingRank / maxRank) * 100)));
            const colors = getCategoryColor(r.category);
            const isHovered = hoveredRow?.category === r.category;

            return (
              <div
                key={r.category}
                onMouseEnter={() => setHoveredRow(r)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  borderColor: isHovered ? colors.primary : undefined,
                  boxShadow: isHovered ? `0 0 16px ${colors.glow}` : undefined,
                }}
                className={`group rounded-2xl border p-3 transition-all duration-200 cursor-pointer ${
                  isHovered
                    ? 'bg-white/[0.06] scale-[1.01]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <span
                    className={`inline-flex rounded-lg border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider font-mono ${getSeatCategoryStyle(
                      r.category
                    )}`}
                  >
                    {r.category}
                  </span>
                  <span className="font-mono text-xs text-white/80">
                    <span className="text-white/40 text-[10px] uppercase mr-1.5 font-bold">Cutoff:</span>
                    <span className="text-white/60 font-semibold">{r.openingRank.toLocaleString()}</span>
                    <span className="mx-1.5 text-white/40 font-bold">→</span>
                    <span style={{ color: colors.primary }} className="font-bold text-sm">#{r.closingRank.toLocaleString()}</span>
                  </span>
                </div>

                <div className="h-2 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/[0.08]">
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
          })
        ) : (
          casteRanks.map((c) => {
            const hasBoys = c.boys.count > 0;
            const hasGirls = c.girls.count > 0;

            if (viewMode === 'boys' && !hasBoys) return null;
            if (viewMode === 'girls' && !hasGirls) return null;

            const isHovered = hoveredRow?.category === c.category;

            return (
              <div
                key={c.category}
                onMouseEnter={() => setHoveredRow(c)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`rounded-2xl border p-3 transition-all duration-200 ${
                  isHovered
                    ? 'border-white/20 bg-white/[0.05] shadow-lg shadow-purple-500/5'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.03]'
                }`}
              >
                {/* Caste Header */}
                <div className="flex items-center justify-between gap-2 mb-2.5 pb-1.5 border-b border-white/[0.06]">
                  <span
                    className={`inline-flex rounded-lg border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider font-mono ${getSeatCategoryStyle(
                      c.category
                    )}`}
                  >
                    {c.category}
                  </span>
                  <span className="text-[11px] text-white/50 font-medium">
                    {c.all.count} Total {c.all.count === 1 ? 'Seat' : 'Seats'}
                  </span>
                </div>

                {/* Gender Specific Closing Cutoffs */}
                <div className="space-y-2">
                  {/* Boys Breakdown */}
                  {hasBoys && (viewMode === 'caste' || viewMode === 'boys') && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />
                          ♂ Boys ({c.boys.count}):
                        </span>
                        <span className="text-white/80">
                          <span className="text-white/60 font-semibold">{c.boys.openingRank?.toLocaleString()}</span>
                          <span className="mx-1 text-white/40 font-bold">→</span>
                          <span className="font-bold text-sky-400 text-[13px]">#{c.boys.closingRank?.toLocaleString()}</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-700"
                          style={{
                            width: `${Math.min(100, Math.max(8, Math.round((c.boys.closingRank / maxRank) * 100)))}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Girls Breakdown */}
                  {hasGirls && (viewMode === 'caste' || viewMode === 'girls') && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-400">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-pink-400" />
                          ♀ Girls ({c.girls.count}):
                        </span>
                        <span className="text-white/80">
                          <span className="text-white/60 font-semibold">{c.girls.openingRank?.toLocaleString()}</span>
                          <span className="mx-1 text-white/40 font-bold">→</span>
                          <span className="font-bold text-pink-400 text-[13px]">#{c.girls.closingRank?.toLocaleString()}</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-pink-600 to-pink-400 transition-all duration-700"
                          style={{
                            width: `${Math.min(100, Math.max(8, Math.round((c.girls.closingRank / maxRank) * 100)))}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Interactive Quartile & Region Quota Insights ───────────────────────────
function InteractiveQuartileRegionChart({ candidates = [], openingRank = 0, closingRank = 0 }) {
  const [activeQuartile, setActiveQuartile] = useState(null); // 'q1' | 'median' | 'q3'
  const ranks = useMemo(() => candidates.map((c) => c.rank).sort((a, b) => a - b), [candidates]);
  const total = ranks.length || 1;

  const q1 = ranks[Math.floor(total * 0.25)] || openingRank;
  const median = ranks[Math.floor(total * 0.5)] || Math.round((openingRank + closingRank) / 2);
  const q3 = ranks[Math.floor(total * 0.75)] || closingRank;

  const ouCount = candidates.filter((c) => (c.region || '').toUpperCase() === 'OU').length;
  const nlCount = candidates.filter((c) => ['NL', 'UR', 'CU'].includes((c.region || '').toUpperCase())).length;
  const ouPercent = Math.round((ouCount / total) * 100);
  const nlPercent = Math.round((nlCount / total) * 100);

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-black/40 p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
              <Layers size={15} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                Quartile &amp; Region Insights
              </h4>
              <p className="text-[10px] text-white/40">Statistical rank percentiles &amp; domicile quota</p>
            </div>
          </div>
          <span className="text-[11px] text-white/40 font-mono">OU Region 85%</span>
        </div>

        {/* Quartile Interactive Cards */}
        <div className="grid grid-cols-3 gap-2.5 text-center mb-5">
          <div
            onClick={() => setActiveQuartile(activeQuartile === 'q1' ? null : 'q1')}
            onMouseEnter={() => setActiveQuartile('q1')}
            onMouseLeave={() => setActiveQuartile(null)}
            className={`rounded-2xl border p-3 transition-all duration-200 cursor-pointer ${
              activeQuartile === 'q1'
                ? 'border-cyan-400/50 bg-cyan-950/30 scale-[1.03]'
                : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'
            }`}
          >
            <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">Top 25% (Q1)</span>
            <span className="font-mono text-sm sm:text-base font-extrabold text-cyan-300">#{q1.toLocaleString()}</span>
          </div>

          <div
            onClick={() => setActiveQuartile(activeQuartile === 'median' ? null : 'median')}
            onMouseEnter={() => setActiveQuartile('median')}
            onMouseLeave={() => setActiveQuartile(null)}
            className={`rounded-2xl border p-3 transition-all duration-200 cursor-pointer ${
              activeQuartile === 'median'
                ? 'border-purple-400/50 bg-purple-950/40 scale-[1.03]'
                : 'border-purple-500/20 bg-purple-950/20 hover:border-purple-500/40'
            }`}
          >
            <span className="text-[10px] text-purple-300 uppercase font-bold block mb-1">Median (50th)</span>
            <span className="font-mono text-sm sm:text-base font-extrabold text-purple-200">
              #{median.toLocaleString()}
            </span>
          </div>

          <div
            onClick={() => setActiveQuartile(activeQuartile === 'q3' ? null : 'q3')}
            onMouseEnter={() => setActiveQuartile('q3')}
            onMouseLeave={() => setActiveQuartile(null)}
            className={`rounded-2xl border p-3 transition-all duration-200 cursor-pointer ${
              activeQuartile === 'q3'
                ? 'border-amber-400/50 bg-amber-950/30 scale-[1.03]'
                : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'
            }`}
          >
            <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">Bottom 25% (Q3)</span>
            <span className="font-mono text-sm sm:text-base font-extrabold text-amber-300">#{q3.toLocaleString()}</span>
          </div>
        </div>

        {/* Region Bars */}
        <div className="space-y-3 pt-2">
          {/* OU Region Local */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-white/80">Osmania Univ (OU) Local (85% Quota)</span>
              <span className="font-mono text-emerald-400 font-bold">
                {ouCount} ({ouPercent}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${ouPercent}%` }}
              />
            </div>
          </div>

          {/* Non-Local Unreserved */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-white/80">Non-Local / Unreserved (15% Open Quota)</span>
              <span className="font-mono text-cyan-400 font-bold">
                {nlCount} ({nlPercent}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full transition-all duration-700"
                style={{ width: `${nlPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.04] text-center">
        <p className="text-[11px] text-white/40 font-mono">
          Competition Spread Range: <b className="text-white font-bold">{(closingRank - openingRank).toLocaleString()}</b> Ranks
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function PolycetAllotmentExplorer({ onDataLoaded }) {
  const [colleges] = useState(POLYCET_INSTITUTIONS);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [collegeData, setCollegeData] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const tableRef = useRef(null);

  // Available branches for current selected college
  const currentInst = colleges.find((c) => c.code === selectedCollege) || null;
  const summaryEntry = allotmentsSummary.find((s) => s.code === selectedCollege);

  const availableBranches = useMemo(() => {
    if (!selectedCollege) return [];
    if (summaryEntry?.branches?.length) {
      return summaryEntry.branches.map((b) => ({
        code: b.branchCode,
        name: b.branchName || b.branchCode,
        totalAllotted: b.totalAllotted,
      }));
    }
    return (currentInst?.courses || []).map((c) => ({
      code: c.branchCode,
      name: c.branchName,
      totalAllotted: c.intake,
    }));
  }, [summaryEntry, currentInst, selectedCollege]);

  // Load college data
  const loadAllotments = useCallback(async (collegeCode, branchCode) => {
    if (!collegeCode) return;
    setFetching(true);
    setError('');
    setSearch('');
    setPage(1);
    setHasQueried(true);

    try {
      // Try API first
      const res = await polycetApi.getCollegeAllotments(collegeCode);
      if (res.data?.success && res.data.data) {
        setCollegeData(res.data.data);
        onDataLoaded?.(true);
      } else {
        // Fallback to client bundled JSON
        const fallback = await import(`../../data/polycet_allotments/${collegeCode}.json`);
        const d = fallback.default || fallback;
        setCollegeData(d);
        if (d?.branches?.length > 0) onDataLoaded?.(true);
      }
    } catch (e) {
      try {
        const fallback = await import(`../../data/polycet_allotments/${collegeCode}.json`);
        const d = fallback.default || fallback;
        setCollegeData(d);
        if (d?.branches?.length > 0) onDataLoaded?.(true);
      } catch (err2) {
        console.error('Failed to load allotments for', collegeCode, err2);
        setError(`Failed to load allotment records for ${collegeCode}.`);
        setCollegeData(null);
      }
    } finally {
      setFetching(false);
      setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    }
  }, [onDataLoaded]);

  // Handle Query Trigger
  const handleQuery = () => {
    if (!selectedYear || !selectedCollege || !selectedBranch) return;
    loadAllotments(selectedCollege, selectedBranch);
  };

  // Branch candidates list
  const activeBranchObj = useMemo(() => {
    if (!collegeData?.branches) return null;
    if (selectedBranch === 'ALL') {
      const combinedCandidates = collegeData.branches.flatMap((b) =>
        (b.candidates || []).map((c) => ({ ...c, branchCode: b.branchCode, branchName: b.branchName }))
      );
      return {
        branchCode: 'ALL',
        branchName: 'All Branches Combined',
        totalAllotted: combinedCandidates.length,
        candidates: combinedCandidates,
      };
    }
    return (
      collegeData.branches.find((b) => b.branchCode.toUpperCase() === selectedBranch.toUpperCase()) ||
      collegeData.branches[0]
    );
  }, [collegeData, selectedBranch]);

  const candidatesList = activeBranchObj?.candidates || [];

  // Filtered candidate list
  const filteredCandidates = useMemo(() => {
    return candidatesList.filter((c) => {
      if (genderFilter !== 'ALL') {
        const g = c.gender?.toUpperCase() || '';
        if (genderFilter === 'Male' && !g.startsWith('M')) return false;
        if (genderFilter === 'Female' && !g.startsWith('F')) return false;
      }
      if (categoryFilter !== 'ALL' && !c.seatCategory.toUpperCase().includes(categoryFilter.toUpperCase())) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.hallTicket.toLowerCase().includes(q) ||
          String(c.rank).includes(q) ||
          c.seatCategory.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [candidatesList, genderFilter, categoryFilter, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));
  const paginated = filteredCandidates.slice((page - 1) * pageSize, page * pageSize);

  // Compute Metrics & Charts
  const stats = useMemo(() => {
    if (!candidatesList.length) {
      return { total: 0, minRank: 0, maxRank: 0, male: 0, female: 0, maleP: 0, femaleP: 0 };
    }
    const ranks = candidatesList.map((c) => c.rank).filter(Boolean);
    const minRank = ranks.length > 0 ? Math.min(...ranks) : 0;
    const maxRank = ranks.length > 0 ? Math.max(...ranks) : 0;

    let male = 0;
    let female = 0;

    candidatesList.forEach((c) => {
      const g = (c.gender || '').toUpperCase();
      if (g.startsWith('M')) male++;
      else if (g.startsWith('F')) female++;
    });

    const total = candidatesList.length;
    const maleP = total > 0 ? Math.round((male / total) * 100) : 0;
    const femaleP = total > 0 ? Math.round((female / total) * 100) : 0;

    return { total, minRank, maxRank, male, female, maleP, femaleP };
  }, [candidatesList]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['S.No', 'Hall Ticket', 'Rank', 'Candidate Name', 'Branch', 'Gender', 'Caste', 'Region', 'Allotted Category'];
    const rows = filteredCandidates.map((c, i) => [
      i + 1,
      c.hallTicket,
      c.rank,
      `"${c.name}"`,
      c.branchCode || selectedBranch,
      c.gender,
      c.caste,
      c.region,
      c.seatCategory,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TG_POLYCET_Allotments_${selectedCollege}_${selectedBranch}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const step = !selectedYear
    ? 1
    : !selectedCollege
    ? 2
    : !selectedBranch
    ? 3
    : hasQueried
    ? 4
    : 3;

  return (
    <div className="space-y-8">
      {/* ── Stepper Rail ────────────────────────────────────────────── */}
      <div className="flex items-center gap-0 overflow-x-auto pb-1 scrollbar-none">
        {['Phase & Year', 'Polytechnic College', 'Diploma Branch', 'Results'].map((label, i) => {
          const n = i + 1;
          const active = step >= n;
          const current = step === n;
          return (
            <div key={label} className="flex items-center shrink-0">
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  current
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                    : active
                    ? 'bg-white/5 text-white/80 border border-white/10'
                    : 'text-white/25'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                    current ? 'bg-white text-purple-700' : active ? 'bg-white/20 text-white' : 'bg-white/5 text-white/30'
                  }`}
                >
                  {step > n ? '✓' : n}
                </span>
                {label}
              </div>
              {i < 3 && (
                <div
                  className={`h-px w-4 sm:w-8 shrink-0 transition-all ${
                    step > n ? 'bg-purple-500/60' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Selection Control Panel ─────────────────────────────────── */}
      <div className="relative z-30 rounded-3xl border border-white/[0.08] bg-black/50 p-5 sm:p-7 backdrop-blur-xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {/* Year Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2 flex items-center gap-1.5">
              <Calendar size={14} className="text-purple-400" />
              Admission Year &amp; Phase
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setHasQueried(false);
                setCollegeData(null);
              }}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-white focus:border-purple-500 focus:bg-purple-950/20 focus:outline-none cursor-pointer"
            >
              <option value="" disabled>-- Select Admission Year &amp; Phase --</option>
              <option value="2026" className="bg-gray-900 text-white">
                2026 college allotments
              </option>
            </select>
          </div>

          {/* College Dropdown */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2 flex items-center gap-1.5">
              <Building size={14} className="text-cyan-400" />
              Polytechnic College ({colleges.length})
            </label>
            <SearchableSelect
              value={selectedCollege}
              onChange={(val) => {
                setSelectedCollege(val);
                setSelectedBranch('');
                setHasQueried(false);
                setCollegeData(null);
              }}
              disabled={!selectedYear}
              placeholder="-- Search / Select Polytechnic College --"
              searchPlaceholder="Search by polytechnic code, name, district..."
              options={colleges.map((c) => {
                const cleanName = (c.name || "").replace(new RegExp(`^${c.code}\\s*[-–—:]\\s*`, 'i'), '').trim();
                return {
                  value: c.code,
                  label: `${c.code} — ${cleanName || c.name}`,
                  sublabel: `${c.district} · ₹${c.annualFee?.toLocaleString()}/yr`,
                };
              })}
            />
          </div>

          {/* Branch Dropdown */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2 flex items-center gap-1.5">
              <GraduationCap size={14} className="text-amber-400" />
              Diploma Branch Stream ({availableBranches.length})
            </label>
            <SearchableSelect
              value={selectedBranch}
              onChange={(val) => {
                setSelectedBranch(val);
                setHasQueried(false);
                setCollegeData(null);
              }}
              disabled={!selectedCollege}
              placeholder={
                !selectedCollege
                  ? '-- Select College First --'
                  : '-- Search / Select Diploma Branch --'
              }
              searchPlaceholder="Search branch code or name..."
              options={[
                { value: "ALL", label: "ALL — All Branches Combined" },
                ...availableBranches.map((b) => ({
                  value: b.code,
                  label: `${b.code} — ${b.name}`,
                }))
              ]}
            />
          </div>
        </div>

        {/* View Allotments Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          <p className="text-xs text-white/50">
            {currentInst && selectedBranch ? (
              <>
                Selected: <b className="text-white">{currentInst.code}</b> ({currentInst.name}) •{' '}
                <span className="text-cyan-300">{selectedBranch}</span>
              </>
            ) : (
              <span>Complete the selections above to unlock seat allotment data.</span>
            )}
          </p>

          <button
            type="button"
            onClick={handleQuery}
            disabled={fetching || !selectedYear || !selectedCollege || !selectedBranch}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-purple-400/40 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-950/50 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            {fetching ? (
              <>
                <Sparkles size={16} className="animate-spin" />
                <span>Loading Allotment Data...</span>
              </>
            ) : (
              <>
                <Database size={16} />
                <span>Show Allotment Data</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Results Container (When Queried) ────────────────────────── */}
      {hasQueried && !fetching && collegeData && currentInst && (
        <div ref={tableRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* College Info Summary Card */}
          <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-black/60 p-5 sm:p-6 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="rounded-md border border-purple-400/40 bg-purple-500/20 px-2 py-0.5 text-xs font-mono font-bold text-purple-200">
                    {currentInst.code}
                  </span>
                  <span className="text-xs text-white/50">• {currentInst.type}</span>
                  <span className="text-xs text-cyan-300">• {currentInst.coEd}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{currentInst.name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-white/60">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={13} className="text-rose-400" />
                    {currentInst.place}, {currentInst.district} ({currentInst.region} Region)
                  </span>
                  <span>
                    • Annual Fee: <b className="text-emerald-400 font-mono">₹{currentInst.annualFee?.toLocaleString()}</b>
                  </span>
                  <span>
                    • Hostel:{' '}
                    <b className={currentInst.hostelAvailable ? 'text-cyan-300' : 'text-white/40'}>
                      {currentInst.hostelAvailable ? 'Available' : 'No'}
                    </b>
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">Total Allotted</span>
                <p className="font-mono text-2xl sm:text-3xl font-extrabold text-purple-300">{stats.total}</p>
              </div>
            </div>
          </div>

      {/* ── KPI Stat Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Allotted Candidates"
          value={stats.total}
          sub={`${currentInst.code} - ${selectedBranch}`}
          accent
        />
        <StatCard
          icon={TrendingUp}
          label="Top / Opening Rank"
          value={stats.minRank ? `#${stats.minRank.toLocaleString()}` : '—'}
          sub="Highest rank entering stream"
        />
        <StatCard
          icon={TrendingDown}
          label="Closing Cutoff Rank"
          value={stats.maxRank ? `#${stats.maxRank.toLocaleString()}` : '—'}
          sub="Last rank admitted"
        />
        <StatCard
          icon={Award}
          label="Rank Spread"
          value={stats.maxRank && stats.minRank ? (stats.maxRank - stats.minRank).toLocaleString() : '—'}
          sub="Competition delta"
        />
      </div>

      {/* ── Candidate Seat Allotment Table (Placed directly under KPI Data) ─── */}
      <div
        ref={tableRef}
        className="overflow-hidden rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-xl shadow-2xl"
      >
        {/* Table Filter & Search Controls */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              Candidate Seat Allotments ({filteredCandidates.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search candidate, rank, HT..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-56 sm:w-64 rounded-xl border border-white/10 bg-white/5 pl-8 pr-7 py-1.5 text-xs text-white placeholder-white/30 focus:border-purple-500 focus:outline-none"
              />
              <Search size={13} className="absolute left-2.5 top-2.5 text-white/30" />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2.5 text-white/40 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Gender Filters */}
            <div className="flex items-center gap-1">
              {['ALL', 'Male', 'Female'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setGenderFilter(g);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    genderFilter === g
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredCandidates.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-white transition cursor-pointer disabled:opacity-40"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04] text-white/50 uppercase font-bold tracking-wider text-[11px]">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Hall Ticket</th>
                <th className="py-3.5 px-4">Candidate Name</th>
                <th className="py-3.5 px-4">Branch</th>
                <th className="py-3.5 px-4">Gender</th>
                <th className="py-3.5 px-4">Caste</th>
                <th className="py-3.5 px-4">Region</th>
                <th className="py-3.5 px-4">Allotted Quota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-white/80 font-medium">
              {fetching ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-white/40">
                    <div className="inline-flex items-center gap-2">
                      <Sparkles size={16} className="animate-spin text-purple-400" />
                      <span>Loading verified candidate records...</span>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-white/40">
                    No candidate records found matching the query.
                  </td>
                </tr>
              ) : (
                paginated.map((c, i) => (
                  <tr key={`${c.hallTicket}-${i}`} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4 text-white/40 font-mono">
                      {(page - 1) * pageSize + i + 1}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-purple-300">
                      #{c.rank?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-white/70">{c.hallTicket}</td>
                    <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                    <td className="py-3 px-4">
                      <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold font-mono text-cyan-300">
                        {c.branchCode || selectedBranch}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {String(c.gender).toUpperCase().startsWith('F') ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-pink-500/30 bg-pink-500/10 px-2 py-0.5 text-xs font-bold font-mono text-pink-400">
                          ♀ F
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-xs font-bold font-mono text-sky-400">
                          ♂ M
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-white/70">{c.caste}</td>
                    <td className="py-3 px-4 font-mono text-white/50">{c.region}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block rounded-lg border px-2.5 py-1 text-[11px] font-mono font-bold tracking-tight ${getSeatCategoryStyle(
                          c.seatCategory
                        )}`}
                      >
                        {c.seatCategory}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/[0.01]">
            <p className="text-xs text-white/40">
              Showing{' '}
              <b className="text-white">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredCandidates.length)}
              </b>{' '}
              of <b className="text-white">{filteredCandidates.length}</b> candidates
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white disabled:opacity-30 hover:bg-white/10 transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-mono text-white/60 px-2">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white disabled:opacity-30 hover:bg-white/10 transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Visual Analytics Suite Header ───────────────────────────── */}
      <div className="pt-6 border-t border-white/[0.08]">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-xs font-semibold text-purple-300 mb-2">
          <Sparkles size={13} />
          <span>Admission Analytics</span>
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-white">
          Allotment Insights &amp; Visual Statistics
        </h3>
        <p className="text-xs sm:text-sm text-white/50 mt-1">
          Visual statistical summary of {currentInst.name} ({selectedBranch}) seat allocation.
        </p>
      </div>

      {/* ── Interactive Visualizations Suite ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InteractiveGenderChart
          candidates={candidatesList}
          male={stats.male}
          female={stats.female}
          maleP={stats.maleP}
          femaleP={stats.femaleP}
        />
        <InteractiveQuartileRegionChart
          candidates={candidatesList}
          openingRank={stats.minRank}
          closingRank={stats.maxRank}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InteractiveCategoryChart candidates={candidatesList} />
        <CategoryClosingRanksBreakdown candidates={candidatesList} />
      </div>
    </div>
  )}

  {/* ── Empty State (no query yet) ────────────────────────────────────── */}
  {!hasQueried && !fetching && (
    <div className="rounded-3xl border border-white/[0.06] bg-black/30 py-20 text-center backdrop-blur-xl">
      <Database size={40} className="mx-auto mb-4 text-purple-500/40" />
      <p className="text-base font-semibold text-white/40">Select Year, College &amp; Branch above</p>
      <p className="text-sm text-white/20 mt-1">
        then click <span className="text-purple-400 font-bold">Show Allotment Data</span> to view candidate records &amp; visual analytics
      </p>
    </div>
  )}

</div>
);
}
