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
  ArrowRight,
  Shield,
  Activity,
  Target,
  Flame
} from 'lucide-react';
import UniqueDataLoader from '../shared/UniqueDataLoader';
import { icetApi } from '../../lib/icetApi';
import SearchableSelect from '../shared/SearchableSelect';
import ThreeDotsLoader from '../ui/three-dots-loader';
import { smoothScrollTo } from '../../lib/utils';
import localSummary from '../../data/icet_allotments/allotments_summary.json';
import { strictMultiFieldMatch } from '../../utils/searchMatch';

// Helper to identify Special Category reservation candidates (PH, NCC, CAP, Sports/Games)
export function getSpecialCategoryType(candidate) {
  if (!candidate) return null;
  const seat = String(candidate.seatCategory || '').toUpperCase();
  const sp = String(candidate.specialCategory || '').toUpperCase();
  const combined = `${seat} ${sp}`;

  // 1. Physically Handicapped (PHA, PHC, PHH, PHM, PHO, PHV, PWD, HANDICAP)
  if (
    combined.includes('PHA') ||
    combined.includes('PHC') ||
    combined.includes('PHH') ||
    combined.includes('PHM') ||
    combined.includes('PHO') ||
    combined.includes('PHV') ||
    combined.includes('PWD') ||
    combined.includes('HANDICAP') ||
    combined.includes('_PH_') ||
    combined.startsWith('PH_')
  ) {
    return 'PH';
  }

  // 2. NCC (National Cadet Corps)
  if (combined.includes('NCC')) {
    return 'NCC';
  }

  // 3. CAP (Children of Armed Personnel / Defence)
  if (combined.includes('CAP') || combined.includes('DEFENCE') || combined.includes('DEF_')) {
    return 'CAP';
  }

  // 4. Sports & Games (SG / SPORTS)
  if (
    combined.includes('_SG_') ||
    combined.startsWith('SG_') ||
    combined.includes('_SG(') ||
    combined.includes('SPORTS') ||
    combined.includes('GAMES')
  ) {
    return 'SPORTS';
  }

  return null;
}

export function isSpecialCategory(candidate) {
  return Boolean(getSpecialCategoryType(candidate));
}

// Backward compatibility alias
export function isPhysicallyHandicapped(candidate) {
  return isSpecialCategory(candidate);
}

// Seat category color pills
function getSeatCategoryStyle(cat = '') {
  const c = String(cat).toUpperCase().replace(/_/g, '-').trim();
  // Special Quotas
  if (c.includes('NCC')) return 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300 shadow-sm shadow-cyan-500/20';
  if (c.includes('CAP') || c.includes('DEFENCE')) return 'bg-amber-500/20 border-amber-400/40 text-amber-300 shadow-sm shadow-amber-500/20';
  if (c.includes('-SG-') || c.startsWith('SG-') || c.includes('-SG(') || c.includes('SPORT')) return 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-sm shadow-emerald-500/20';
  if (c.includes('PHA') || c.includes('PHC') || c.includes('PHH') || c.includes('PHM') || c.includes('PHO') || c.includes('PHV') || c.includes('PWD') || c.includes('-PH-')) return 'bg-purple-500/20 border-purple-400/40 text-purple-300 shadow-sm shadow-purple-500/20';
  
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
  if (c.includes('NCC')) return { primary: '#06b6d4', secondary: '#0891b2', glow: 'rgba(6, 182, 212, 0.6)' };
  if (c.includes('CAP') || c.includes('DEFENCE')) return { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245, 158, 11, 0.6)' };
  if (c.includes('-SG-') || c.startsWith('SG-') || c.includes('-SG(') || c.includes('SPORT')) return { primary: '#10b981', secondary: '#059669', glow: 'rgba(16, 185, 129, 0.6)' };
  if (c.includes('PH') || c.includes('PWD')) return { primary: '#a855f7', secondary: '#7e22ce', glow: 'rgba(168, 85, 247, 0.6)' };

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

// ─── Smooth Counting Number Animation (starts from 0 when scrolled into view) ─
function AnimatedCounter({ value, duration = 800, prefix = '', suffix = '', isVisible = true }) {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef(null);
  const prevValueRef = useRef(0);

  const isBlank = value === null || value === undefined || value === '—' || value === '-';

  useEffect(() => {
    if (isBlank) {
      setDisplayValue(0);
      prevValueRef.current = 0;
      return;
    }

    if (!isVisible) {
      setDisplayValue(0);
      prevValueRef.current = 0;
      return;
    }

    const numValue = typeof value === 'number' ? value : parseInt(String(value).replace(/[^0-9]/g, ''), 10) || 0;
    const startVal = prevValueRef.current || 0;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic: decelerating to zero velocity
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (numValue - startVal) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        prevValueRef.current = numValue;
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, isVisible, duration, isBlank]);

  if (isBlank) {
    return <span>—</span>;
  }

  if (!isVisible) {
    return <span>{prefix}0{suffix}</span>;
  }

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
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

// ─── Modern Aesthetic Interactive Gender Donut Chart ───────────────────────
function InteractiveGenderChart({
  candidates = [],
  male = 0,
  female = 0,
  maleP = 0,
  femaleP = 0,
  title = "Gender Distribution",
  subtitle = "Hover or tap slices to inspect details",
  badge = null
}) {
  const [activeSlice, setActiveSlice] = useState(null);
  const total = male + female;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const maleStroke = total > 0 ? (male / total) * circumference : 0;
  const femaleStroke = total > 0 ? (female / total) * circumference : 0;

  const genderRanks = useMemo(() => {
    const hasNonSpecial = candidates.some((c) => !isSpecialCategory(c));
    const validCandidates = hasNonSpecial ? candidates.filter((c) => !isSpecialCategory(c)) : candidates;
    const mRanks = validCandidates
      .filter((c) => (c.gender || '').toUpperCase().startsWith('M'))
      .map((c) => c.rank)
      .filter(Boolean);
    const fRanks = validCandidates
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
    <div className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-black/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/15 h-full flex flex-col justify-between">
      {/* Ambient background glow */}
      <div
        className="absolute -right-16 -top-16 h-52 w-52 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-20"
        style={{
          background:
            activeSlice === 'male'
              ? '#06b6d4'
              : activeSlice === 'female'
              ? '#ec4899'
              : '#8b5cf6',
        }}
      />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-white">{title}</span>
            {badge && (
              <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-purple-300">
                {badge}
              </span>
            )}
          </div>
          <span className="text-xs font-mono font-medium text-white/50 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
            {total} Total
          </span>
        </div>
        <p className="text-xs text-white/40">{subtitle}</p>
      </div>

      {/* Donut & Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-5">
        {/* SVG Donut */}
        <div className="relative flex items-center justify-center cursor-pointer select-none shrink-0">
          <svg width="150" height="150" className="-rotate-90 drop-shadow-lg">
            <defs>
              <linearGradient id="icetMaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="icetFemaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
            </defs>

            {/* Base ring */}
            <circle cx="75" cy="75" r={radius} fill="transparent" stroke="rgba(255,255,255,0.04)" strokeWidth="12" />

            {/* Male Slice */}
            <circle
              cx="75"
              cy="75"
              r={radius}
              fill="transparent"
              stroke="url(#icetMaleGrad)"
              strokeWidth={activeSlice === 'male' ? 16 : 12}
              strokeDasharray={`${maleStroke} ${circumference}`}
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{
                filter: activeSlice === 'male' ? 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.7))' : 'none',
                opacity: activeSlice === 'female' ? 0.35 : 1,
              }}
              onMouseEnter={() => setActiveSlice('male')}
              onMouseLeave={() => setActiveSlice(null)}
              onTouchStart={() => setActiveSlice(activeSlice === 'male' ? null : 'male')}
            />

            {/* Female Slice */}
            <circle
              cx="75"
              cy="75"
              r={radius}
              fill="transparent"
              stroke="url(#icetFemaleGrad)"
              strokeWidth={activeSlice === 'female' ? 16 : 12}
              strokeDasharray={`${femaleStroke} ${circumference}`}
              strokeDashoffset={-maleStroke}
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{
                filter: activeSlice === 'female' ? 'drop-shadow(0 0 10px rgba(244, 114, 182, 0.7))' : 'none',
                opacity: activeSlice === 'male' ? 0.35 : 1,
              }}
              onMouseEnter={() => setActiveSlice('female')}
              onMouseLeave={() => setActiveSlice(null)}
              onTouchStart={() => setActiveSlice(activeSlice === 'female' ? null : 'female')}
            />
          </svg>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {activeSlice === 'male' ? (
              <div className="animate-in fade-in zoom-in-95 duration-150">
                <span className="text-xl font-mono font-extrabold text-sky-400">{maleP}%</span>
                <span className="text-[10px] font-bold text-sky-300 uppercase block tracking-wider">Boys</span>
              </div>
            ) : activeSlice === 'female' ? (
              <div className="animate-in fade-in zoom-in-95 duration-150">
                <span className="text-xl font-mono font-extrabold text-pink-400">{femaleP}%</span>
                <span className="text-[10px] font-bold text-pink-300 uppercase block tracking-wider">Girls</span>
              </div>
            ) : (
              <div>
                <span className="text-2xl font-mono font-extrabold text-white">{total}</span>
                <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">Seats</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Info Cards */}
        <div className="flex-1 w-full space-y-2.5">
          {/* Boys Pill */}
          <div
            onClick={() => setActiveSlice(activeSlice === 'male' ? null : 'male')}
            onMouseEnter={() => setActiveSlice('male')}
            onMouseLeave={() => setActiveSlice(null)}
            className={`rounded-2xl border p-3 transition-all duration-200 cursor-pointer ${
              activeSlice === 'male'
                ? 'border-sky-500/40 bg-sky-500/10 shadow-lg shadow-sky-950/40 scale-[1.01]'
                : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
                <span className="text-xs font-semibold text-white">Male Candidates</span>
              </div>
              <span className="font-mono text-xs font-bold text-sky-300">{maleP}%</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-white/50">
              <span>{male} seats</span>
              {genderRanks.maleMin > 0 && (
                <span className="font-mono text-[10px] text-sky-300/80">
                  #{genderRanks.maleMin.toLocaleString()} → #{genderRanks.maleMax.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Girls Pill */}
          <div
            onClick={() => setActiveSlice(activeSlice === 'female' ? null : 'female')}
            onMouseEnter={() => setActiveSlice('female')}
            onMouseLeave={() => setActiveSlice(null)}
            className={`rounded-2xl border p-3 transition-all duration-200 cursor-pointer ${
              activeSlice === 'female'
                ? 'border-pink-500/40 bg-pink-500/10 shadow-lg shadow-pink-950/40 scale-[1.01]'
                : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-pink-400 shadow-sm shadow-pink-400/50" />
                <span className="text-xs font-semibold text-white">Female Candidates</span>
              </div>
              <span className="font-mono text-xs font-bold text-pink-300">{femaleP}%</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-white/50">
              <span>{female} seats</span>
              {genderRanks.femaleMin > 0 && (
                <span className="font-mono text-[10px] text-pink-300/80">
                  #{genderRanks.femaleMin.toLocaleString()} → #{genderRanks.femaleMax.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Split Ratio Bar */}
      <div className="pt-3 border-t border-white/[0.06]">
        <div className="flex justify-between text-[11px] text-white/50 mb-1.5 font-mono">
          <span className="flex items-center gap-1.5 text-sky-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Boys ({male})
          </span>
          <span className="flex items-center gap-1.5 text-pink-300 font-medium">
            Girls ({female}) <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
          </span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden bg-white/5 p-0.5 border border-white/10 gap-0.5">
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
  const [viewMode, setViewMode] = useState('caste'); // 'caste' | 'special' | 'quota'
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const chartRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const casteData = useMemo(() => {
    const map = {};
    const generalCandidates = candidates.filter((c) => !isSpecialCategory(c));
    const total = generalCandidates.length || 1;
    generalCandidates.forEach((c) => {
      const seat = (c.seatCategory || '').toUpperCase();
      const isEws = seat.includes('EWS') || (c.caste || '').toUpperCase() === 'EWS';
      const cat = isEws ? 'EWS' : (c.caste || 'OC').toUpperCase().trim();
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

  // Special Category Breakdown Bar Dataset
  const specialData = useMemo(() => {
    const map = {};
    const specialCandidates = candidates.filter((c) => isSpecialCategory(c));
    const total = specialCandidates.length || 1;
    specialCandidates.forEach((c) => {
      const type = getSpecialCategoryType(c) || 'OTHER';
      const label = SPECIAL_CATEGORY_CONFIG[type]?.label || type;
      if (!map[type]) {
        map[type] = {
          name: label,
          type,
          count: 0,
          openingRank: c.rank,
          closingRank: c.rank,
          male: 0,
          female: 0,
        };
      }
      map[type].count++;
      map[type].openingRank = Math.min(map[type].openingRank, c.rank);
      map[type].closingRank = Math.max(map[type].closingRank, c.rank);
      if ((c.gender || '').toUpperCase().startsWith('M')) map[type].male++;
      else map[type].female++;
    });

    const order = ['PH', 'NCC', 'CAP', 'SPORTS'];
    return Object.values(map)
      .map((item) => ({
        ...item,
        percent: Math.round((item.count / total) * 100),
      }))
      .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
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

  const activeDataset = viewMode === 'caste' ? casteData : viewMode === 'special' ? specialData : quotaData;
  const maxCount = Math.max(...activeDataset.map((d) => d.count), 1);
  const activeTooltipItem = hoveredCategory || activeDataset[0] || null;

  if (!candidates.length) return null;

  return (
    <div ref={chartRef} className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-black/40 p-6 backdrop-blur-xl h-full flex flex-col justify-between">
      {/* Header & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight text-white">
            Category Breakdown
          </h4>
          <p className="text-xs text-white/40">Seat density &amp; rank intervals across groups</p>
        </div>

        {/* Minimal pill switcher */}
        <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('caste')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'caste'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            General ({casteData.length})
          </button>
          <button
            type="button"
            onClick={() => setViewMode('special')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'special'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            <Shield size={12} />
            <span>Special ({specialData.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('quota')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'quota'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            All Quotas ({quotaData.length})
          </button>
        </div>
      </div>

      {/* Dynamic Summary Strip */}
      {activeTooltipItem && (
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex rounded-lg border px-2.5 py-0.5 text-xs font-mono font-bold uppercase ${getSeatCategoryStyle(
                activeTooltipItem.name
              )}`}
            >
              {activeTooltipItem.name}
            </span>
            <span className="text-xs font-medium text-white">
              <AnimatedCounter value={activeTooltipItem.count} isVisible={isVisible} duration={600} /> seats (
              <AnimatedCounter value={activeTooltipItem.percent} isVisible={isVisible} duration={600} />%)
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-white/60">
              <span className="text-[10px] uppercase text-white/40">Ranks:</span>
              <span className="text-sky-300 font-bold">
                <AnimatedCounter value={activeTooltipItem.openingRank} prefix="#" isVisible={isVisible} duration={700} />
              </span>
              <span className="text-white/30">→</span>
              <span className="text-amber-300 font-bold">
                <AnimatedCounter value={activeTooltipItem.closingRank} prefix="#" isVisible={isVisible} duration={700} />
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/50 pl-2 border-l border-white/10">
              <span className="text-sky-300">
                ♂ <AnimatedCounter value={activeTooltipItem.male} isVisible={isVisible} duration={600} />
              </span>
              <span>•</span>
              <span className="text-pink-300">
                ♀ <AnimatedCounter value={activeTooltipItem.female} isVisible={isVisible} duration={600} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bars Container */}
      <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
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
              className={`group rounded-2xl border p-2.5 transition-all duration-200 cursor-pointer ${
                isHovered
                  ? 'border-purple-500/40 bg-purple-500/10 shadow-md shadow-purple-950/30'
                  : 'border-white/[0.04] bg-white/[0.015] hover:border-white/10 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold font-mono uppercase ${getSeatCategoryStyle(
                      row.name
                    )}`}
                  >
                    {row.name}
                  </span>
                  <span className="text-[11px] font-mono text-white/50">
                    <AnimatedCounter value={row.openingRank} prefix="#" isVisible={isVisible} duration={750} /> ➔{' '}
                    <AnimatedCounter value={row.closingRank} prefix="#" isVisible={isVisible} duration={750} />
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-white/40 text-[10px]">
                    (<AnimatedCounter value={row.percent} isVisible={isVisible} duration={650} />%)
                  </span>
                  <span className="font-semibold text-white">
                    <AnimatedCounter value={row.count} isVisible={isVisible} duration={700} />
                  </span>
                </div>
              </div>

              <div className="h-2 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: isVisible ? `${fillWidth}%` : '0%',
                    background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                    boxShadow: isVisible ? `0 0 10px ${colors.glow}` : 'none',
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
  const [viewMode, setViewMode] = useState('caste'); // 'caste' | 'boys' | 'girls' | 'special'
  const [hoveredRow, setHoveredRow] = useState(null);
  const tableRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0, rootMargin: '0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 1. General categories (PH / NCC / CAP / Sports completely separated)
  const casteRanks = useMemo(() => {
    const map = {};
    const validCandidates = candidates.filter((c) => !isSpecialCategory(c));

    validCandidates.forEach((c) => {
      const seat = (c.seatCategory || '').toUpperCase();
      const isEws = seat.includes('EWS') || (c.caste || '').toUpperCase() === 'EWS';
      const cat = isEws ? 'EWS' : (c.caste || 'OC').toUpperCase().trim();
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

  // 2. Special Categories Breakdown (Separated PH, NCC, CAP, Sports/Games)
  const specialRanks = useMemo(() => {
    const map = {};
    const specialCandidates = candidates.filter((c) => isSpecialCategory(c));

    specialCandidates.forEach((c) => {
      const type = getSpecialCategoryType(c);
      if (!type) return;

      if (!map[type]) {
        map[type] = {
          type,
          config: SPECIAL_CATEGORY_CONFIG[type] || {
            label: type,
            color: '#a855f7',
            badgeClass: 'bg-purple-500/20 border-purple-500/30 text-purple-300',
          },
          openingRank: c.rank,
          closingRank: c.rank,
          count: 0,
          boys: 0,
          girls: 0,
          candidates: [],
        };
      }

      map[type].openingRank = Math.min(map[type].openingRank, c.rank);
      map[type].closingRank = Math.max(map[type].closingRank, c.rank);
      map[type].count++;
      map[type].candidates.push(c);

      const isBoy = (c.gender || '').toUpperCase().startsWith('M');
      if (isBoy) map[type].boys++;
      else map[type].girls++;
    });

    const order = ['PH', 'NCC', 'CAP', 'SPORTS'];
    return Object.values(map).sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
  }, [candidates]);

  const maxRank = useMemo(() => {
    let m = 1;
    candidates.forEach((c) => {
      if (!isSpecialCategory(c) && c.rank > m) m = c.rank;
    });
    return m;
  }, [candidates]);

  if (!candidates.length) return null;

  return (
    <div ref={tableRef} className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-black/40 p-6 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h4 className="text-sm font-semibold tracking-tight text-white">
            Cutoff Trajectory Matrix
          </h4>
          <p className="text-xs text-white/40">Opening to closing merit cutoffs across reservation categories</p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setViewMode('caste')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'caste'
                ? 'bg-amber-400 text-black shadow-sm font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            All General ({casteRanks.reduce((acc, r) => acc + r.all.count, 0)})
          </button>
          <button
            type="button"
            onClick={() => setViewMode('boys')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'boys'
                ? 'bg-sky-400 text-black shadow-sm font-semibold'
                : 'text-sky-300/70 hover:text-sky-200'
            }`}
          >
            ♂ Boys
          </button>
          <button
            type="button"
            onClick={() => setViewMode('girls')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'girls'
                ? 'bg-pink-400 text-black shadow-sm font-semibold'
                : 'text-pink-300/70 hover:text-pink-200'
            }`}
          >
            ♀ Girls
          </button>
          <button
            type="button"
            onClick={() => setViewMode('special')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'special'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            <Shield size={12} />
            <span>Special ({specialRanks.reduce((acc, r) => acc + r.count, 0)})</span>
          </button>
        </div>
      </div>

      {/* ── Content View ── */}
      {viewMode === 'special' ? (
        specialRanks.length === 0 ? (
          <div className="py-10 text-center text-xs text-white/40 bg-white/[0.02] rounded-2xl border border-white/5">
            No special reservation seats (PH, NCC, CAP, SG) were allotted in this college for this program.
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {specialRanks.map((item) => {
              const Icon = item.config.icon || Shield;
              const isHovered = hoveredRow?.type === item.type;
              return (
                <div
                  key={item.type}
                  onMouseEnter={() => setHoveredRow(item)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`group rounded-2xl border p-4 transition-all duration-200 ${
                    isHovered
                      ? 'border-purple-500/40 bg-purple-950/20 shadow-lg shadow-purple-950/30'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-mono font-bold uppercase ${item.config.badgeClass}`}
                      >
                        <Icon size={13} />
                        <span>{item.config.label}</span>
                      </span>
                      <span className="text-xs font-semibold text-white">
                        <AnimatedCounter value={item.count} isVisible={isVisible} duration={750} /> Admitted
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-sky-300 font-medium">
                        ♂ <AnimatedCounter value={item.boys} isVisible={isVisible} duration={750} />
                      </span>
                      <span className="text-white/20">|</span>
                      <span className="text-pink-300 font-medium">
                        ♀ <AnimatedCounter value={item.girls} isVisible={isVisible} duration={750} />
                      </span>
                      <span className="text-white/20">|</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase text-white/40">Ranks:</span>
                        <span className="text-sky-400 font-bold">
                          <AnimatedCounter value={item.openingRank} prefix="#" isVisible={isVisible} duration={850} />
                        </span>
                        <span className="text-white/30">→</span>
                        <span className="text-amber-400 font-bold">
                          <AnimatedCounter value={item.closingRank} prefix="#" isVisible={isVisible} duration={850} />
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-white/50 mb-2.5">{item.config.description}</p>

                  {/* Candidate list pill preview */}
                  <div className="flex flex-wrap gap-1.5 pt-2.5 border-t border-white/[0.06]">
                    {item.candidates.map((cand, ci) => (
                      <span
                        key={cand.hallTicket || ci}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.03] border border-white/10 px-2.5 py-1 text-[11px] font-mono text-gray-300"
                      >
                        <span className="text-amber-400 font-semibold">#{cand.rank}</span>
                        <span className="text-white/90">{cand.name}</span>
                        <span className="text-[10px] text-purple-300/80 uppercase">({cand.seatCategory})</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
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
                className={`group rounded-2xl border p-3.5 transition-all duration-200 cursor-pointer ${
                  isHovered
                    ? 'border-white/20 bg-white/[0.05] shadow-md scale-[1.005]'
                    : 'border-white/[0.05] bg-white/[0.015] hover:border-white/10 hover:bg-white/[0.025]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-lg border px-2.5 py-0.5 text-xs font-mono font-bold uppercase ${getSeatCategoryStyle(
                        r.category
                      )}`}
                    >
                      {r.category}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      <AnimatedCounter value={current.count} isVisible={isVisible} duration={750} />{' '}
                      {viewMode === 'boys' ? 'Boys' : viewMode === 'girls' ? 'Girls' : 'Candidates'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase text-white/40">Opening:</span>
                      <span className="text-sky-400 font-bold">
                        <AnimatedCounter value={current.openingRank} prefix="#" isVisible={isVisible} duration={850} />
                      </span>
                    </div>
                    <span className="text-white/30">➔</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase text-white/40">Closing:</span>
                      <span className="text-amber-400 font-bold">
                        <AnimatedCounter value={current.closingRank} prefix="#" isVisible={isVisible} duration={850} />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: isVisible ? `${fillWidth}%` : '0%',
                      background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                      boxShadow: isVisible ? `0 0 10px ${colors.glow}` : 'none',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
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
    <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-black/40 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2 mb-5">
        <div>
          <h4 className="text-sm font-semibold tracking-tight text-white">
            Rank Bracket Spread
          </h4>
          <p className="text-xs text-white/40">Density of admitted candidates across score segments</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {brackets.map((b) => {
          const heightPercent = Math.min(100, Math.max(10, Math.round((b.count / maxCount) * 100)));
          return (
            <div
              key={b.label}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 flex flex-col justify-between hover:border-white/15 hover:bg-white/[0.04] transition-all duration-200"
            >
              <div>
                <span className="text-[11px] font-medium text-white/50 block">{b.label}</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-mono font-bold text-white">
                    {b.count}
                  </span>
                  <span className="text-[11px] text-white/40 font-mono">({b.percent}%)</span>
                </div>
              </div>

              <div className="mt-4 h-14 flex items-end bg-white/[0.03] rounded-xl p-1 border border-white/5">
                <div
                  className="w-full rounded-lg transition-all duration-700 ease-out"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: b.color,
                    boxShadow: `0 0 12px ${b.color}35`,
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

export const SPECIAL_CATEGORY_CONFIG = {
  PH: {
    label: 'PH / PWD',
    fullTitle: 'Physically Handicapped (PHA / PHC / PHH / PHM / PHO / PHV / PWD)',
    color: '#a855f7',
    badgeClass: 'bg-purple-500/20 border-purple-400/40 text-purple-300',
    icon: Activity,
    description: 'Candidates admitted under Differently Abled / PWD reservation quota',
  },
  NCC: {
    label: 'NCC',
    fullTitle: 'National Cadet Corps (NCC-A / NCC-B / NCC-C)',
    color: '#06b6d4',
    badgeClass: 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300',
    icon: Shield,
    description: 'Candidates admitted under National Cadet Corps special quota',
  },
  CAP: {
    label: 'CAP / Defence',
    fullTitle: 'Children of Armed Personnel (Ex-Servicemen & Defence Quota)',
    color: '#f59e0b',
    badgeClass: 'bg-amber-500/20 border-amber-400/40 text-amber-300',
    icon: Target,
    description: 'Admitted under Children of Armed Personnel / Armed Forces quota',
  },
  SPORTS: {
    label: 'Sports / SG',
    fullTitle: 'Sports & Games Quota (SG / State / National Players)',
    color: '#10b981',
    badgeClass: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300',
    icon: Flame,
    description: 'Candidates admitted under National / State level Sports & Games quota',
  },
};

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
  'EWS',
  'SPECIAL'
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
  const candidateTableRef = useRef(null);
  const analyticsRef = useRef(null);
  const matrixRef = useRef(null);
  
  const [allotmentData, setAllotmentData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [analyticsCategory, setAnalyticsCategory] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 100;

  const analyticsCardRef = useRef(null);
  const [analyticsCardVisible, setAnalyticsCardVisible] = useState(false);

  useEffect(() => {
    const el = analyticsCardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnalyticsCardVisible(true);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [allotmentData]);

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
            setTimeout(() => {
              const offset = window.innerWidth < 640 ? 76 : 88;
              smoothScrollTo(candidateTableRef, offset);
            }, 80);
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

    // 1. Strict Prefix & Word-Boundary Search Query
    if (searchQuery.trim()) {
      list = list.filter((c) => {
        const fields = [c.name, c.hallTicket, String(c.rank), c.seatCategory, c.caste, c.region].filter(Boolean);
        return strictMultiFieldMatch(fields, searchQuery);
      });
    }

    // 2. Category Filter (normalized comparison)
    if (categoryFilter && categoryFilter !== 'ALL') {
      if (categoryFilter === 'SPECIAL') {
        list = list.filter((c) => isSpecialCategory(c));
      } else {
        const targetCat = categoryFilter.toUpperCase().replace(/[-_\s]/g, '');
        list = list.filter((c) => {
          // Normal category candidates (pure caste)
          const casteNorm = String(c.caste || '').toUpperCase().replace(/[-_\s]/g, '');
          const seatNorm = String(c.seatCategory || '').toUpperCase().replace(/[-_\s]/g, '');
          if (targetCat === 'OC') {
            return casteNorm === 'OC' && !seatNorm.includes('EWS') && casteNorm !== 'EWS';
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

    const nonSpecialAll = all.filter((c) => !isSpecialCategory(c));
    const femaleCount = all.filter((c) => (c.gender || '').toLowerCase().startsWith('f')).length;
    const maleCount = all.length - femaleCount;
    const malePercent = all.length ? Math.round((maleCount / all.length) * 100) : 0;
    const femalePercent = all.length ? 100 - malePercent : 0;

    const findLastRank = (cat) => {
      // Exclude special category candidates (PH, NCC, CAP, SG) from general category cutoffs
      let matching;
      if (cat === 'OC') {
        matching = nonSpecialAll.filter((c) => {
          const casteNorm = (c.caste || '').toUpperCase().trim();
          const seatNorm = (c.seatCategory || '').toUpperCase().trim();
          return (casteNorm === 'OC' || seatNorm.startsWith('OC')) && !seatNorm.includes('EWS') && casteNorm !== 'EWS';
        });
      } else if (cat === 'EWS') {
        matching = nonSpecialAll.filter((c) => {
          const casteNorm = (c.caste || '').toUpperCase().trim();
          const seatNorm = (c.seatCategory || '').toUpperCase().trim();
          return casteNorm === 'EWS' || seatNorm.includes('EWS');
        });
      } else {
        matching = nonSpecialAll.filter(
          (c) => (c.caste || '').toUpperCase() === cat || (c.seatCategory || '').toUpperCase().includes(cat)
        );
      }
      if (matching.length === 0) return '-';
      return matching[matching.length - 1].rank?.toLocaleString() || '-';
    };

    return {
      total: all.length,
      openingRank: nonSpecialAll[0]?.rank?.toLocaleString() || all[0]?.rank?.toLocaleString() || '-',
      closingRank: nonSpecialAll[nonSpecialAll.length - 1]?.rank?.toLocaleString() || all[all.length - 1]?.rank?.toLocaleString() || '-',
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

  // Dynamic Category-Wise Analytics (Special Quotas Separated from Normal Demographics)
  const categoryAnalyticsData = useMemo(() => {
    const all = allotmentData?.candidates || [];
    if (!all.length) return null;

    const isSpecialSelected = analyticsCategory === 'SPECIAL';

    // Filter candidates for selected analytics category
    let matched = all;
    if (analyticsCategory && analyticsCategory !== 'ALL') {
      if (isSpecialSelected) {
        matched = all.filter((c) => isSpecialCategory(c));
      } else {
        const targetCat = analyticsCategory.toUpperCase().replace(/[-_\s]/g, '');
        matched = all.filter((c) => {
          const casteNorm = String(c.caste || '').toUpperCase().replace(/[-_\s]/g, '');
          const seatNorm = String(c.seatCategory || '').toUpperCase().replace(/[-_\s]/g, '');
          if (targetCat === 'OC') {
            return casteNorm === 'OC' && !seatNorm.includes('EWS') && casteNorm !== 'EWS';
          }
          if (targetCat === 'EWS') {
            return casteNorm === 'EWS' || seatNorm.includes('EWS');
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
          return casteNorm === targetCat || seatNorm === targetCat || seatNorm.startsWith(targetCat + '_');
        });
      }
    }

    // Filter out all Special Category candidates (PH, NCC, CAP, Sports) for normal rank analytics,
    // but keep them when user explicitly chooses SPECIAL
    const effectiveCandidates = isSpecialSelected
      ? matched
      : matched.filter((c) => !isSpecialCategory(c));

    // Boys & Girls candidate splits
    const boys = matched.filter((c) => (c.gender || '').toUpperCase().startsWith('M'));
    const girls = matched.filter((c) => (c.gender || '').toUpperCase().startsWith('F'));
    const cutoffBoys = effectiveCandidates.filter((c) => (c.gender || '').toUpperCase().startsWith('M'));
    const cutoffGirls = effectiveCandidates.filter((c) => (c.gender || '').toUpperCase().startsWith('F'));

    const totalCount = matched.length;
    const boyCount = boys.length;
    const girlCount = girls.length;
    const boyPercent = totalCount ? Math.round((boyCount / totalCount) * 100) : 0;
    const girlPercent = totalCount ? 100 - boyPercent : 0;

    // Overall Category Opening & Closing ranks
    const categoryRanks = effectiveCandidates.map((c) => c.rank).filter(Boolean);
    const openingRank = categoryRanks.length ? Math.min(...categoryRanks) : null;
    const closingRank = categoryRanks.length ? Math.max(...categoryRanks) : null;

    // Gender-wise Opening & Closing ranks
    const boyRanks = cutoffBoys.map((c) => c.rank).filter(Boolean);
    const boyOpening = boyRanks.length ? Math.min(...boyRanks) : null;
    const boyClosing = boyRanks.length ? Math.max(...boyRanks) : null;

    const girlRanks = cutoffGirls.map((c) => c.rank).filter(Boolean);
    const girlOpening = girlRanks.length ? Math.min(...girlRanks) : null;
    const girlClosing = girlRanks.length ? Math.max(...girlRanks) : null;

    return {
      selectedCategory: analyticsCategory,
      totalCandidates: totalCount,
      candidates: matched,
      nonSpecialCandidates: effectiveCandidates,
      boyCount,
      girlCount,
      boyPercent,
      girlPercent,
      openingRank,
      closingRank,
      boyOpening,
      boyClosing,
      girlOpening,
      girlClosing,
      specialIgnoredCount: isSpecialSelected ? 0 : matched.length - effectiveCandidates.length,
    };
  }, [allotmentData, analyticsCategory]);

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
      {/* ── Official Data Source Citation ───────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-950/20 px-4 py-2.5 text-[11px] text-cyan-300/80">
        <Database size={13} className="text-cyan-400 shrink-0" />
        <span className="font-semibold text-cyan-300">Official Source:</span>
        <span className="text-white/60">
          Data sourced directly from <strong className="text-white/80">TSCHE (TG ICET MBA &amp; MCA) official candidate allotment gazettes</strong> published at{' '}
          <a href="https://tgicet.nic.in" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300 transition-colors">
            tgicet.nic.in
          </a>. Allotment data covers First Phase, Final Phase, and Special Phase rounds.
        </span>
      </div>

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
            onClick={() => {
              setActiveTab('table');
              smoothScrollTo(tableRef, 80);
            }}
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
            onClick={() => {
              setActiveTab('analytics');
              smoothScrollTo(analyticsRef, 80);
            }}
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
            onClick={() => {
              setActiveTab('matrix');
              smoothScrollTo(matrixRef, 80);
            }}
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

      {/* ─── Candidate Allotment Table Section ─── */}
      <div ref={candidateTableRef} className="space-y-4">
          {/* Search, Filters & Export Row */}
          <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Left Group on PC: Search Input + Gender Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
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

              {/* Gender Filter (with Blue for Male and Pink for Female) */}
              <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 p-1 shrink-0 w-fit">
                {[
                  {
                    id: 'ALL',
                    label: 'All Genders',
                    activeClass: 'bg-purple-600 text-white shadow',
                    inactiveClass: 'text-gray-400 hover:text-white',
                  },
                  {
                    id: 'Male',
                    label: 'Male',
                    activeClass: 'bg-blue-600 text-white shadow-md shadow-blue-600/40',
                    inactiveClass: 'text-blue-300/70 hover:text-blue-200',
                  },
                  {
                    id: 'Female',
                    label: 'Female',
                    activeClass: 'bg-pink-600 text-white shadow-md shadow-pink-600/40',
                    inactiveClass: 'text-pink-300/70 hover:text-pink-200',
                  },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setGenderFilter(g.id);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      genderFilter === g.id ? g.activeClass : g.inactiveClass
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CSV Export Button (Right-aligned on PC) */}
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
      </div>

      {/* ── Visual Analytics & Category Statistics Suite (Rendered Under Allotment Data) ── */}
      {selectedCollege && (
        <section ref={analyticsRef} className="pt-8 border-t border-white/[0.08] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300 mb-2">
                <PieChart size={13} className="text-purple-400" />
                <span>Admission Analytics &amp; Demographics</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Category Demographics &amp; Rank Spread
              </h3>
              <p className="text-xs sm:text-sm text-white/40 mt-1">
                Interactive distribution curves, gender splits, and opening/closing cutoff trajectories.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const offset = window.innerWidth < 640 ? 76 : 88;
                smoothScrollTo(candidateTableRef, offset);
              }}
              className="inline-flex items-center gap-2 self-start sm:self-auto rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-purple-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <Database size={13} />
              <span>Back to Candidate Table</span>
            </button>
          </div>

          {loading ? (
            <div className="p-2">
              <UniqueDataLoader
                examName="TG ICET"
                title="Analyzing Seat Allocation Metrics..."
                subtitle="Processing demographic spreads, closing cutoffs, and quota analytics..."
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Category Filter Pills for Analytics */}
              <div className="relative z-10 flex flex-wrap items-center gap-2 p-3.5 rounded-3xl border border-white/[0.08] bg-gradient-to-r from-white/[0.03] via-white/[0.015] to-transparent backdrop-blur-xl">
                <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mr-1.5 flex items-center gap-1.5">
                  <Filter size={12} className="text-purple-400" /> Filter:
                </span>
                {CATEGORY_FILTERS.map((cat) => {
                  const isSelected = analyticsCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setAnalyticsCategory(cat)}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]'
                          : 'bg-white/5 border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/10 hover:border-white/15'
                      }`}
                    >
                      {cat === 'ALL' ? 'All Categories' : cat}
                    </button>
                  );
                })}
              </div>

              {/* Category-Specific Metrics Summary Card */}
              {categoryAnalyticsData && (
                <div ref={analyticsCardRef} className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] via-black/50 to-black/80 p-6 backdrop-blur-2xl shadow-xl transition-all">
                  {/* Card Top Title Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4 mb-5">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                          {analyticsCategory === 'ALL'
                            ? 'All Categories Overview'
                            : analyticsCategory === 'SPECIAL'
                            ? 'Special Reservation Quotas (PH / NCC / CAP / Sports)'
                            : `${analyticsCategory} Category Highlights`}
                        </h3>
                        <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-purple-300">
                          <AnimatedCounter value={categoryAnalyticsData.totalCandidates} isVisible={analyticsCardVisible} duration={750} /> Allotted
                        </span>
                      </div>
                      <p className="text-xs text-white/40 mt-1">
                        {analyticsCategory === 'SPECIAL'
                          ? 'Opening & closing cutoffs across special reservation categories (PWD/PH, NCC, CAP Defence, Sports/SG)'
                          : 'Opening & closing cutoffs with gender breakdown · Special quotas (PH/NCC/CAP/SG) isolated'}
                      </p>
                    </div>

                    {categoryAnalyticsData.specialIgnoredCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300 self-start sm:self-auto">
                        <Shield size={12} className="text-purple-400" />
                        <span>{categoryAnalyticsData.specialIgnoredCount} Special Quota seat(s) separated</span>
                      </span>
                    )}
                  </div>

                  {/* 4 Clean Aesthetic Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Category Volume & Gender */}
                    <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col justify-between hover:border-white/15 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Candidate Volume</span>
                        <Users size={14} className="text-white/30" />
                      </div>
                      <div className="my-2.5">
                        <span className="text-3xl font-mono font-bold text-white tracking-tight">
                          <AnimatedCounter value={categoryAnalyticsData.totalCandidates} isVisible={analyticsCardVisible} duration={750} />
                        </span>
                        <span className="text-xs text-white/40 ml-1.5">seats</span>
                      </div>
                      <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.05] text-xs font-mono">
                        <span className="text-sky-400 font-medium">
                          ♂ <AnimatedCounter value={categoryAnalyticsData.boyCount} isVisible={analyticsCardVisible} duration={750} /> (
                          <AnimatedCounter value={categoryAnalyticsData.boyPercent} isVisible={analyticsCardVisible} duration={750} />%)
                        </span>
                        <span className="text-white/10">|</span>
                        <span className="text-pink-400 font-medium">
                          ♀ <AnimatedCounter value={categoryAnalyticsData.girlCount} isVisible={analyticsCardVisible} duration={750} /> (
                          <AnimatedCounter value={categoryAnalyticsData.girlPercent} isVisible={analyticsCardVisible} duration={750} />%)
                        </span>
                      </div>
                    </div>

                    {/* 2. Overall Category Cutoff */}
                    <div className="group rounded-2xl border border-purple-500/20 bg-purple-950/15 p-4 flex flex-col justify-between hover:border-purple-500/35 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-purple-300/80 uppercase tracking-wider">
                          {analyticsCategory === 'SPECIAL' ? 'Special Quota Cutoff' : 'Overall Cutoff Range'}
                        </span>
                        <Award size={14} className="text-purple-400/60" />
                      </div>
                      <div className="my-2 flex items-baseline gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] text-white/40 uppercase block">Opening</span>
                          <span className="text-lg font-mono font-bold text-sky-400">
                            <AnimatedCounter value={categoryAnalyticsData.openingRank} prefix="#" isVisible={analyticsCardVisible} duration={850} />
                          </span>
                        </div>
                        <span className="text-purple-400/60 text-xs">➔</span>
                        <div className="min-w-0">
                          <span className="text-[10px] text-white/40 uppercase block">Closing</span>
                          <span className="text-lg font-mono font-bold text-amber-400">
                            <AnimatedCounter value={categoryAnalyticsData.closingRank} prefix="#" isVisible={analyticsCardVisible} duration={850} />
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-white/40 border-t border-white/[0.05] pt-2 font-sans">
                        {analyticsCategory === 'SPECIAL' ? 'Special reservation rank interval' : 'Full group merit interval'}
                      </p>
                    </div>

                    {/* 3. Boys Cutoff */}
                    <div className="group rounded-2xl border border-sky-500/20 bg-sky-950/15 p-4 flex flex-col justify-between hover:border-sky-500/35 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-sky-300/80 uppercase tracking-wider">♂ Boys Cutoff</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                      </div>
                      <div className="my-2 flex items-baseline gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] text-white/40 uppercase block">Opening</span>
                          <span className="text-lg font-mono font-bold text-sky-400">
                            <AnimatedCounter value={categoryAnalyticsData.boyOpening} prefix="#" isVisible={analyticsCardVisible} duration={850} />
                          </span>
                        </div>
                        <span className="text-sky-400/60 text-xs">➔</span>
                        <div className="min-w-0">
                          <span className="text-[10px] text-white/40 uppercase block">Closing</span>
                          <span className="text-lg font-mono font-bold text-sky-300">
                            <AnimatedCounter value={categoryAnalyticsData.boyClosing} prefix="#" isVisible={analyticsCardVisible} duration={850} />
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-sky-300/60 border-t border-white/[0.05] pt-2 font-mono">
                        <AnimatedCounter value={categoryAnalyticsData.boyCount} isVisible={analyticsCardVisible} duration={750} /> male candidate(s)
                      </p>
                    </div>

                    {/* 4. Girls Cutoff */}
                    <div className="group rounded-2xl border border-pink-500/20 bg-pink-950/15 p-4 flex flex-col justify-between hover:border-pink-500/35 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-pink-300/80 uppercase tracking-wider">♀ Girls Cutoff</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                      </div>
                      <div className="my-2 flex items-baseline gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] text-white/40 uppercase block">Opening</span>
                          <span className="text-lg font-mono font-bold text-pink-400">
                            <AnimatedCounter value={categoryAnalyticsData.girlOpening} prefix="#" isVisible={analyticsCardVisible} duration={850} />
                          </span>
                        </div>
                        <span className="text-pink-400/60 text-xs">➔</span>
                        <div className="min-w-0">
                          <span className="text-[10px] text-white/40 uppercase block">Closing</span>
                          <span className="text-lg font-mono font-bold text-pink-300">
                            <AnimatedCounter value={categoryAnalyticsData.girlClosing} prefix="#" isVisible={analyticsCardVisible} duration={850} />
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-pink-300/60 border-t border-white/[0.05] pt-2 font-mono">
                        <AnimatedCounter value={categoryAnalyticsData.girlCount} isVisible={analyticsCardVisible} duration={750} /> female candidate(s)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Visual Charts Grid: Interactive Gender Donut (Driven by Category) & Category Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5">
                  <InteractiveGenderChart
                    candidates={categoryAnalyticsData?.candidates || allotmentData?.candidates || []}
                    male={categoryAnalyticsData ? categoryAnalyticsData.boyCount : stats.males}
                    female={categoryAnalyticsData ? categoryAnalyticsData.girlCount : stats.females}
                    maleP={categoryAnalyticsData ? categoryAnalyticsData.boyPercent : stats.malePercent}
                    femaleP={categoryAnalyticsData ? categoryAnalyticsData.girlPercent : stats.femalePercent}
                    title={analyticsCategory === 'ALL' ? 'Gender Distribution (All)' : `${analyticsCategory} Gender Ratio`}
                    subtitle={analyticsCategory === 'ALL' ? 'Boys vs Girls across all categories' : `Boys vs Girls specifically in ${analyticsCategory}`}
                    badge={analyticsCategory !== 'ALL' ? `${analyticsCategory}` : null}
                  />
                </div>
                <div className="lg:col-span-7">
                  <InteractiveCategoryChart candidates={allotmentData?.candidates || []} />
                </div>
              </div>

              <RankDistributionHistogram candidates={categoryAnalyticsData?.candidates || allotmentData?.candidates || []} />
            </div>
          )}
        </section>
      )}

      {/* ── Cutoff Matrix & Trajectory Section (Rendered Under Analytics) ── */}
      {selectedCollege && (
        <section ref={matrixRef} className="pt-8 border-t border-white/[0.08]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-xs font-semibold text-amber-300 mb-1.5">
                <Award size={13} />
                <span>Cutoff Analytics</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Category Cutoff Matrix &amp; Gender Trajectory
              </h3>
              <p className="text-xs sm:text-sm text-white/50">
                Opening rank ➔ Closing cutoff threshold per reservation category and gender (special category ranks like PH, NCC, CAP &amp; Sports separated).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const offset = window.innerWidth < 640 ? 76 : 88;
                smoothScrollTo(candidateTableRef, offset);
              }}
              className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-purple-300 hover:bg-white/10 transition cursor-pointer"
            >
              <Database size={13} />
              <span>Back to Candidate Table</span>
            </button>
          </div>

          <CategoryClosingRanksBreakdown candidates={allotmentData?.candidates || []} />
        </section>
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
