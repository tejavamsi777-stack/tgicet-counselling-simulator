import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, Users, Award, TrendingDown, TrendingUp, Download, Building,
  GraduationCap, Sparkles, BarChart3, PieChart, Star, Trophy, Database,
  Activity, Shield, Target, Flame, Filter, ShieldCheck, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { pgecetApi } from '../../lib/pgecetApi';
import { PGECET_INSTITUTIONS } from '../../data/pgecetInstitutions';
import SearchableSelect from '../shared/SearchableSelect';
import UniqueDataLoader from '../shared/UniqueDataLoader';
import ThreeDotsLoader from '../ui/three-dots-loader';
import { smoothScrollTo } from '../../lib/utils';
import { strictMultiFieldMatch } from '../../utils/searchMatch';

// ─── Special Category Helpers ───────────────────────────────────────────────
export function getSpecialCategoryType(candidate) {
  if (!candidate) return null;
  const seat = String(candidate.allotted_category || candidate.seatCategory || '').toUpperCase();
  const sp = String(candidate.category || candidate.caste || '').toUpperCase();
  const combined = `${seat} ${sp}`;

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
    combined.startsWith('PH_') ||
    combined.includes('_PH')
  ) {
    return 'PH';
  }

  if (
    combined.includes('NCC') ||
    combined.includes('_NCC_') ||
    combined.startsWith('NCC_') ||
    combined.includes('_NCC')
  ) {
    return 'NCC';
  }

  if (
    combined.includes('CAP') ||
    combined.includes('_CAP_') ||
    combined.startsWith('CAP_') ||
    combined.includes('_CAP') ||
    combined.includes('DEFENCE') ||
    combined.includes('ARMED')
  ) {
    return 'CAP';
  }

  if (
    combined.includes('_SG_') ||
    combined.startsWith('SG_') ||
    combined.includes('_SG(') ||
    combined.includes('_SG') ||
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

export const CATEGORY_FILTERS = ['ALL', 'OC', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST', 'EWS', 'SPECIAL'];

// ─── Smooth Counting Number Animation (starts from 0 when scrolled into view) ─
function AnimatedCounter({ value, duration = 800, prefix = '', suffix = '', isVisible = true, decimals = 0 }) {
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

    const target = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) || 0 : Number(value) || 0;

    if (!isVisible) {
      setDisplayValue(0);
      prevValueRef.current = 0;
      return;
    }

    const startVal = prevValueRef.current || 0;
    const diff = target - startVal;
    if (diff === 0) {
      setDisplayValue(target);
      return;
    }

    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startVal + diff * ease;

      setDisplayValue(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.round(current));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(updateCounter);
      } else {
        prevValueRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(updateCounter);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, isVisible, isBlank, decimals]);

  if (isBlank) return <span>—</span>;

  return (
    <span>
      {prefix}
      {decimals > 0 ? displayValue.toFixed(decimals) : displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Seat Category Badge Styling ───────────────────────────────────────────
function getSeatCategoryStyle(cat = '') {
  const c = String(cat).toUpperCase().replace(/_/g, '-').trim();
  if (c.includes('FEMALE') || c.includes('GIRL')) return 'bg-pink-500/20 border-pink-400/40 text-pink-300 shadow-sm shadow-pink-500/20';
  if (c.includes('EWS')) return 'bg-teal-500/20 border-teal-400/40 text-teal-300 shadow-sm shadow-teal-500/20';
  if (c.includes('OPEN') || c.includes('OC')) return 'bg-sky-500/20 border-sky-400/40 text-sky-300 shadow-sm shadow-sky-500/20';
  if (c.includes('BCA') || c.includes('BC-A')) return 'bg-orange-500/20 border-orange-400/40 text-orange-300 shadow-sm shadow-orange-500/20';
  if (c.includes('BCB') || c.includes('BC-B')) return 'bg-amber-500/20 border-amber-400/40 text-amber-300 shadow-sm shadow-amber-500/20';
  if (c.includes('BCC') || c.includes('BC-C')) return 'bg-lime-500/20 border-lime-400/40 text-lime-300 shadow-sm shadow-lime-500/20';
  if (c.includes('BCD') || c.includes('BC-D')) return 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-sm shadow-emerald-500/20';
  if (c.includes('BCE') || c.includes('BC-E')) return 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300 shadow-sm shadow-indigo-500/20';
  if (c.includes('ST')) return 'bg-rose-500/20 border-rose-400/40 text-rose-300 shadow-sm shadow-rose-500/20';
  if (c.includes('SC')) return 'bg-purple-500/20 border-purple-400/40 text-purple-300 shadow-sm shadow-purple-500/20';
  return 'bg-violet-500/20 border-violet-400/40 text-violet-300 shadow-sm shadow-violet-500/20';
}

const COLOR_STYLES = {
  amber: {
    card: 'border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-black/60 to-black/80 shadow-amber-950/30',
    text: 'text-amber-300', icon: 'text-amber-400',
  },
  cyan: {
    card: 'border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-black/60 to-black/80 shadow-cyan-950/30',
    text: 'text-cyan-300', icon: 'text-cyan-400',
  },
  purple: {
    card: 'border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-black/60 to-black/80 shadow-purple-950/30',
    text: 'text-purple-300', icon: 'text-purple-400',
  },
};

function StatCard({ icon: Icon, label, value, sub, color = 'purple' }) {
  const s = COLOR_STYLES[color] || COLOR_STYLES.purple;
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  let content = value;
  if (typeof value === 'number') {
    content = <AnimatedCounter value={value} isVisible={isVisible} duration={750} />;
  } else if (typeof value === 'string' && value.startsWith('#')) {
    const num = parseFloat(value.slice(1));
    content = !isNaN(num) ? <AnimatedCounter value={num} prefix="#" isVisible={isVisible} duration={850} /> : value;
  } else if (typeof value === 'string' && value.includes(' / ')) {
    const parts = value.split(' / ');
    const num1 = parseFloat(parts[0]);
    const num2 = parseFloat(parts[1]);
    if (!isNaN(num1) && !isNaN(num2)) {
      content = (
        <span>
          <AnimatedCounter value={num1} isVisible={isVisible} duration={750} /> / <AnimatedCounter value={num2} isVisible={isVisible} duration={750} />
        </span>
      );
    }
  }

  return (
    <div ref={cardRef} className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-lg ${s.card}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">{label}</p>
        {Icon && <Icon size={16} className={s.icon} />}
      </div>
      <p className={`font-mono text-2xl sm:text-3xl font-bold tracking-tight ${s.text}`}>{content}</p>
      {sub && <p className="text-[11px] text-white/40 mt-1">{sub}</p>}
    </div>
  );
}

function GenderDonut({ male = 0, female = 0, title }) {
  const total = male + female;
  const r = 44, c = 2 * Math.PI * r;
  const mS = total > 0 ? (male / total) * c : 0;
  const fS = total > 0 ? (female / total) * c : 0;
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-black/40 p-5 sm:p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            <PieChart size={15} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">{title || 'Gender Distribution'}</h4>
            <p className="text-[10px] text-white/40">Male vs Female split</p>
          </div>
        </div>
        <span className="text-[11px] text-white/50 font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/10">{total} total</span>
      </div>
      <div className="flex items-center justify-center gap-8 my-2">
        <svg width="120" height="120" className="-rotate-90">
          <circle cx="60" cy="60" r={r} fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
          <circle cx="60" cy="60" r={r} fill="transparent" stroke="#38bdf8" strokeWidth="12"
            strokeDasharray={`${mS} ${c}`} strokeLinecap="round" />
          <circle cx="60" cy="60" r={r} fill="transparent" stroke="#f472b6" strokeWidth="12"
            strokeDasharray={`${fS} ${c}`} strokeDashoffset={`-${mS}`} strokeLinecap="round" />
        </svg>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-sky-400" />
            <div>
              <span className="text-xs font-bold text-white">Male: {male}</span>
              <span className="text-[10px] text-white/40 block">({total > 0 ? Math.round((male / total) * 100) : 0}%)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-pink-400" />
            <div>
              <span className="text-xs font-bold text-white">Female: {female}</span>
              <span className="text-[10px] text-white/40 block">({total > 0 ? Math.round((female / total) * 100) : 0}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryBar({ candidates = [], barClass = 'bg-gradient-to-r from-purple-500 to-cyan-400' }) {
  const catCounts = useMemo(() => {
    const counts = {};
    candidates.forEach((c) => {
      if (isSpecialCategory(c)) return;
      const q = (c.allotted_category || c.category || '').toUpperCase();
      let key = 'OC';
      if (q.includes('EWS')) key = 'EWS';
      else if (q.includes('BC-A') || q.includes('BCA')) key = 'BC-A';
      else if (q.includes('BC-B') || q.includes('BCB')) key = 'BC-B';
      else if (q.includes('BC-C') || q.includes('BCC')) key = 'BC-C';
      else if (q.includes('BC-D') || q.includes('BCD')) key = 'BC-D';
      else if (q.includes('BC-E') || q.includes('BCE')) key = 'BC-E';
      else if (q.includes('SC2') || (q.includes('SC') && q.includes('2'))) key = 'SC-2';
      else if (q.includes('SC')) key = 'SC';
      else if (q.includes('ST')) key = 'ST';
      else if (q.includes('OPEN') || q.includes('OC')) key = 'OC';
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [candidates]);
  const maxVal = Math.max(...Object.values(catCounts), 1);
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-black/40 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300">
          <BarChart3 size={15} />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">Quota Breakdown</h4>
          <p className="text-[10px] text-white/40">Category-wise seat spread (Special Quotas Isolated)</p>
        </div>
      </div>
      <div className="space-y-2">
        {['OC', 'EWS', 'BC-A', 'BC-B', 'BC-D', 'BC-E', 'SC', 'SC-2', 'ST'].map((cat) => {
          const val = catCounts[cat] || 0;
          const pct = Math.round((val / maxVal) * 100);
          return (
            <div key={cat} className="flex items-center gap-2 text-xs">
              <span className="w-12 font-mono font-bold text-white/60 text-right shrink-0">{cat}</span>
              <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
                <div className={`${barClass} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
              <span className="w-8 font-mono font-bold text-white/70 text-left shrink-0">{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   GATE / GPAT Section
════════════════════════════════════════════════ */
function GateSection({ candidates, searchFilter, loading }) {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const gateRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = gateRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const gatePool = useMemo(() => {
    return candidates.filter(c => c.admitted_by === 'GATE/GPAT' || c.gate_score);
  }, [candidates]);

  // Category Analytics Data for GATE
  const categoryAnalyticsData = useMemo(() => {
    if (!gatePool.length) return null;
    let pool = gatePool;

    if (categoryFilter !== 'ALL') {
      if (categoryFilter === 'SPECIAL') {
        pool = gatePool.filter(c => isSpecialCategory(c));
      } else if (categoryFilter === 'OC') {
        pool = gatePool.filter(c => {
          if (isSpecialCategory(c)) return false;
          const rawSeat = (c.allotted_category || '').toUpperCase();
          const rawCaste = (c.category || '').toUpperCase();
          if (rawSeat.includes('EWS') || rawCaste.includes('EWS')) return false;
          return rawSeat.includes('OPEN') || rawSeat.includes('OC') || rawCaste === 'OC';
        });
      } else if (categoryFilter === 'EWS') {
        pool = gatePool.filter(c => {
          if (isSpecialCategory(c)) return false;
          const rawSeat = (c.allotted_category || '').toUpperCase();
          const rawCaste = (c.category || '').toUpperCase();
          return rawSeat.includes('EWS') || rawCaste.includes('EWS');
        });
      } else {
        const target = categoryFilter.replace('-', '_');
        const targetHyphen = categoryFilter.replace('_', '-');
        pool = gatePool.filter(c => {
          if (isSpecialCategory(c)) return false;
          const rawSeat = (c.allotted_category || '').toUpperCase();
          const rawCaste = (c.category || '').toUpperCase();
          return (
            rawSeat.includes(categoryFilter) ||
            rawSeat.includes(target) ||
            rawSeat.includes(targetHyphen) ||
            rawCaste.includes(categoryFilter) ||
            rawCaste.includes(targetHyphen)
          );
        });
      }
    } else {
      pool = gatePool.filter(c => !isSpecialCategory(c));
    }

    const specialCandidates = gatePool.filter(c => isSpecialCategory(c));

    if (!pool.length) {
      return {
        totalCandidates: 0,
        specialIgnoredCount: specialCandidates.length,
        highScore: null,
        lowScore: null,
        boyCount: 0,
        girlCount: 0,
        boyPercent: 0,
        girlPercent: 0,
        boyHigh: null,
        boyLow: null,
        girlHigh: null,
        girlLow: null,
        candidates: [],
      };
    }

    const scores = pool.map(c => Number(c.gate_score)).filter(s => s > 0);
    const highScore = scores.length ? Math.max(...scores) : null;
    const lowScore = scores.length ? Math.min(...scores) : null;

    const boys = pool.filter(c => (c.gender || '').toUpperCase().startsWith('M'));
    const girls = pool.filter(c => (c.gender || '').toUpperCase().startsWith('F'));

    const boyScores = boys.map(c => Number(c.gate_score)).filter(s => s > 0);
    const girlScores = girls.map(c => Number(c.gate_score)).filter(s => s > 0);

    return {
      totalCandidates: pool.length,
      specialIgnoredCount: specialCandidates.length,
      highScore,
      lowScore,
      boyCount: boys.length,
      girlCount: girls.length,
      boyPercent: pool.length ? Math.round((boys.length / pool.length) * 100) : 0,
      girlPercent: pool.length ? Math.round((girls.length / pool.length) * 100) : 0,
      boyHigh: boyScores.length ? Math.max(...boyScores) : null,
      boyLow: boyScores.length ? Math.min(...boyScores) : null,
      girlHigh: girlScores.length ? Math.max(...girlScores) : null,
      girlLow: girlScores.length ? Math.min(...girlScores) : null,
      candidates: pool,
    };
  }, [gatePool, categoryFilter]);

  const filtered = useMemo(() => {
    let list = gatePool;

    // Category filter
    if (categoryFilter !== 'ALL') {
      if (categoryFilter === 'SPECIAL') {
        list = list.filter(c => isSpecialCategory(c));
      } else if (categoryFilter === 'OC') {
        list = list.filter(c => {
          if (isSpecialCategory(c)) return false;
          const rawSeat = (c.allotted_category || '').toUpperCase();
          const rawCaste = (c.category || '').toUpperCase();
          if (rawSeat.includes('EWS') || rawCaste.includes('EWS')) return false;
          return rawSeat.includes('OPEN') || rawSeat.includes('OC') || rawCaste === 'OC';
        });
      } else if (categoryFilter === 'EWS') {
        list = list.filter(c => {
          if (isSpecialCategory(c)) return false;
          const rawSeat = (c.allotted_category || '').toUpperCase();
          const rawCaste = (c.category || '').toUpperCase();
          return rawSeat.includes('EWS') || rawCaste.includes('EWS');
        });
      } else {
        const target = categoryFilter.replace('-', '_');
        const targetHyphen = categoryFilter.replace('_', '-');
        list = list.filter(c => {
          if (isSpecialCategory(c)) return false;
          const rawSeat = (c.allotted_category || '').toUpperCase();
          const rawCaste = (c.category || '').toUpperCase();
          return (
            rawSeat.includes(categoryFilter) ||
            rawSeat.includes(target) ||
            rawSeat.includes(targetHyphen) ||
            rawCaste.includes(categoryFilter) ||
            rawCaste.includes(targetHyphen)
          );
        });
      }
    }

    // Gender filter
    if (genderFilter !== 'ALL') {
      list = list.filter(c => (c.gender || '').toUpperCase().startsWith(genderFilter[0]));
    }

    // Search filter
    if (searchFilter.trim()) {
      list = list.filter(c =>
        strictMultiFieldMatch([c.name, String(c.gate_score || ''), c.category, c.branch_name, c.htno], searchFilter)
      );
    }

    return list;
  }, [gatePool, categoryFilter, genderFilter, searchFilter]);

  const scores = gatePool.map(c => Number(c.gate_score)).filter(Boolean);
  const highScore = scores.length > 0 ? Math.max(...scores) : null;
  const lowScore  = scores.length > 0 ? Math.min(...scores) : null;
  const males     = gatePool.filter(c => (c.gender || '').toUpperCase().startsWith('M')).length;
  const females   = gatePool.filter(c => (c.gender || '').toUpperCase().startsWith('F')).length;

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <div ref={gateRef} className="rounded-3xl border border-amber-500/25 bg-[#0f0a00]/80 p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 shrink-0">
          <Star size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-amber-200">GATE / GPAT Qualified Candidates</h3>
          <p className="text-[11px] text-white/40">Admitted based on GATE / GPAT Score · Strict Category &amp; Quota Isolation</p>
        </div>
        <span className="shrink-0 text-[11px] font-mono bg-amber-500/15 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full">
          <AnimatedCounter value={filtered.length} isVisible={isVisible} duration={750} /> candidates
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Users}        label="GATE Allotted"  value={gatePool.length}        sub="Via GATE/GPAT"        color="amber" />
        <StatCard icon={Trophy}       label="Highest Score"  value={highScore ?? '-'}        sub="Best GATE score"      color="amber" />
        <StatCard icon={TrendingDown} label="Lowest Score"   value={lowScore ?? '-'}         sub="Cutoff GATE score"    color="amber" />
        <StatCard icon={PieChart}     label="M / F"          value={`${males} / ${females}`} sub="Gender split"         color="amber" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GenderDonut male={males} female={females} title="Gender (GATE/GPAT)" />
        <CategoryBar candidates={gatePool} barClass="bg-gradient-to-r from-amber-500 to-yellow-400" />
      </div>

      {/* Category Highlights Card for GATE */}
      {categoryAnalyticsData && (
        <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-950/20 via-black/50 to-black/80 p-5 sm:p-6 backdrop-blur-2xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h4 className="text-base sm:text-lg font-semibold text-amber-200 tracking-tight">
                  {categoryFilter === 'ALL'
                    ? 'GATE / GPAT All Categories Overview'
                    : `${categoryFilter} GATE Category Highlights`}
                </h4>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-amber-300">
                  <AnimatedCounter value={categoryAnalyticsData.totalCandidates} isVisible={isVisible} duration={750} /> Allotted
                </span>
              </div>
              <p className="text-xs text-white/40 mt-1">
                Score ranges and gender distribution · Special quotas (PH/NCC/CAP/SG) isolated
              </p>
            </div>

            {categoryAnalyticsData.specialIgnoredCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 self-start sm:self-auto">
                <Shield size={12} className="text-amber-400" />
                <span>{categoryAnalyticsData.specialIgnoredCount} Special Quota seat(s) separated</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Volume */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Candidate Volume</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-white">
                  <AnimatedCounter value={categoryAnalyticsData.totalCandidates} isVisible={isVisible} duration={750} />
                </span>
                <span className="text-xs text-white/40 ml-1.5">seats</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-xs font-mono">
                <span className="text-sky-400">
                  ♂ <AnimatedCounter value={categoryAnalyticsData.boyCount} isVisible={isVisible} duration={750} /> ({categoryAnalyticsData.boyPercent}%)
                </span>
                <span className="text-white/20">|</span>
                <span className="text-pink-400">
                  ♀ <AnimatedCounter value={categoryAnalyticsData.girlCount} isVisible={isVisible} duration={750} /> ({categoryAnalyticsData.girlPercent}%)
                </span>
              </div>
            </div>

            {/* Score Range */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-950/15 p-4 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-amber-300/80 uppercase tracking-wider">GATE Score Range</span>
              <div className="my-2 flex items-baseline gap-2">
                <div>
                  <span className="text-[10px] text-white/40 uppercase block">High</span>
                  <span className="text-lg font-mono font-bold text-amber-300">
                    <AnimatedCounter value={categoryAnalyticsData.highScore} isVisible={isVisible} duration={850} />
                  </span>
                </div>
                <span className="text-amber-400/60 text-xs">➔</span>
                <div>
                  <span className="text-[10px] text-white/40 uppercase block">Low</span>
                  <span className="text-lg font-mono font-bold text-amber-400">
                    <AnimatedCounter value={categoryAnalyticsData.lowScore} isVisible={isVisible} duration={850} />
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-white/40 border-t border-white/[0.05] pt-2">Full merit interval</p>
            </div>

            {/* Boys Score */}
            <div className="rounded-2xl border border-sky-500/20 bg-sky-950/15 p-4 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-sky-300/80 uppercase tracking-wider">♂ Boys GATE Score</span>
              <div className="my-2 flex items-baseline gap-2">
                <div>
                  <span className="text-[10px] text-white/40 uppercase block">High</span>
                  <span className="text-lg font-mono font-bold text-sky-400">
                    <AnimatedCounter value={categoryAnalyticsData.boyHigh} isVisible={isVisible} duration={850} />
                  </span>
                </div>
                <span className="text-sky-400/60 text-xs">➔</span>
                <div>
                  <span className="text-[10px] text-white/40 uppercase block">Low</span>
                  <span className="text-lg font-mono font-bold text-sky-300">
                    <AnimatedCounter value={categoryAnalyticsData.boyLow} isVisible={isVisible} duration={850} />
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-sky-300/60 border-t border-white/[0.05] pt-2 font-mono">
                {categoryAnalyticsData.boyCount} male candidate(s)
              </p>
            </div>

            {/* Girls Score */}
            <div className="rounded-2xl border border-pink-500/20 bg-pink-950/15 p-4 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-pink-300/80 uppercase tracking-wider">♀ Girls GATE Score</span>
              <div className="my-2 flex items-baseline gap-2">
                <div>
                  <span className="text-[10px] text-white/40 uppercase block">High</span>
                  <span className="text-lg font-mono font-bold text-pink-400">
                    <AnimatedCounter value={categoryAnalyticsData.girlHigh} isVisible={isVisible} duration={850} />
                  </span>
                </div>
                <span className="text-pink-400/60 text-xs">➔</span>
                <div>
                  <span className="text-[10px] text-white/40 uppercase block">Low</span>
                  <span className="text-lg font-mono font-bold text-pink-300">
                    <AnimatedCounter value={categoryAnalyticsData.girlLow} isVisible={isVisible} duration={850} />
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-pink-300/60 border-t border-white/[0.05] pt-2 font-mono">
                {categoryAnalyticsData.girlCount} female candidate(s)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category / Caste Pills Filter Bar for GATE Table */}
      <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2.5 bg-black/40 rounded-2xl border border-amber-500/20 no-scrollbar">
        <span className="text-[11px] font-bold text-amber-300/60 uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0">
          <Filter size={12} className="text-amber-400" /> Quota / Caste:
        </span>
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setCategoryFilter(cat);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
              categoryFilter === cat
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 ring-1 ring-amber-400/50'
                : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}

        {/* Gender Filter */}
        <div className="ml-auto flex items-center gap-1 shrink-0 pl-2 border-l border-white/10">
          {[
            { key: 'ALL', label: 'ALL', activeClass: 'bg-amber-500 text-black font-bold', inactiveClass: 'bg-white/5 border border-white/10 text-white/60 hover:text-white' },
            { key: 'Male', label: 'Male', activeClass: 'bg-blue-600 text-white shadow-md shadow-blue-600/40 font-bold', inactiveClass: 'bg-white/5 border border-white/10 text-blue-300/70 hover:text-blue-200' },
            { key: 'Female', label: 'Female', activeClass: 'bg-pink-600 text-white shadow-md shadow-pink-600/40 font-bold', inactiveClass: 'bg-white/5 border border-white/10 text-pink-300/70 hover:text-pink-200' },
          ].map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => {
                setGenderFilter(g.key);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                genderFilter === g.key ? g.activeClass : g.inactiveClass
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-amber-500/20">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-amber-500/20 bg-amber-900/20 text-[11px] font-bold uppercase tracking-wider text-amber-300/80">
                <th className="py-3 px-4 text-center w-12">#</th>
                <th className="py-3 px-4">GATE Score</th>
                <th className="py-3 px-4">Hall Ticket No.</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Gender</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Allotted Quota</th>
                <th className="py-3 px-4">Specialization</th>
                <th className="py-3 px-4 text-center">Phase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-white/80">
              {loading ? (
                <tr><td colSpan={10} className="py-10 text-center text-sm text-white/40">Loading verified GATE allotments...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="py-10 text-center text-sm text-white/40">No GATE / GPAT allotments for this filter selection.</td></tr>
              ) : paginated.map((cand, idx) => (
                <tr key={`gate_${cand.htno || idx}`} className="hover:bg-amber-500/[0.04] transition">
                  <td className="py-3 px-4 text-center font-mono text-white/40">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-extrabold text-amber-300 text-sm">
                      <AnimatedCounter value={cand.gate_score} isVisible={isVisible} duration={750} />
                    </span>
                    <span className="block text-[10px] text-amber-400/60">GATE Score</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-white/50 text-[11px]">{cand.htno || '-'}</td>
                  <td className="py-3 px-4 font-semibold text-white">{cand.name}</td>
                  <td className="py-3 px-4 font-semibold text-white/70">{cand.category}</td>
                  <td className="py-3 px-4 text-center font-bold">
                    {cand.gender === 'F' ? (
                      <span className="inline-flex items-center gap-0.5 rounded-md border border-pink-500/30 bg-pink-500/10 px-2 py-0.5 text-xs font-mono text-pink-400">
                        ♀ F
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-xs font-mono text-sky-400">
                        ♂ M
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-white/50">{cand.region || 'Local'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getSeatCategoryStyle(cand.allotted_category)}`}>
                      {cand.allotted_category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-purple-300 max-w-[180px] truncate" title={cand.branch_name}>{cand.branch_name}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">{cand.phase}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-amber-500/20 bg-amber-950/20 text-xs">
            <span className="text-white/40">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-white"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="font-mono font-bold text-amber-300">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-white"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   TG PGECET Section
════════════════════════════════════════════════ */
function PgecetSection({ candidates, searchFilter, loading }) {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pgecetPool = useMemo(() => {
    return candidates.filter(c => !(c.admitted_by === 'GATE/GPAT' || c.gate_score));
  }, [candidates]);

  // Category Analytics Memo for Highlights Card
  const categoryAnalyticsData = useMemo(() => {
    if (!pgecetPool.length) return null;
    let pool = pgecetPool;

    if (categoryFilter !== 'ALL') {
      if (categoryFilter === 'SPECIAL') {
        pool = pgecetPool.filter(c => isSpecialCategory(c));
      } else if (categoryFilter === 'OC') {
        pool = pgecetPool.filter(c => {
          if (isSpecialCategory(c)) return false;
          const rawSeat = (c.allotted_category || '').toUpperCase();
          const rawCaste = (c.category || '').toUpperCase();
          if (rawSeat.includes('EWS') || rawCaste.includes('EWS')) return false;
          return rawSeat.includes('OPEN') || rawSeat.includes('OC') || rawCaste === 'OC';
        });
      } else if (categoryFilter === 'EWS') {
        pool = pgecetPool.filter(c => {
          if (isSpecialCategory(c)) return false;
          const rawSeat = (c.allotted_category || '').toUpperCase();
          const rawCaste = (c.category || '').toUpperCase();
          return rawSeat.includes('EWS') || rawCaste.includes('EWS');
        });
      } else {
        const target = categoryFilter.replace('-', '_');
        const targetHyphen = categoryFilter.replace('_', '-');
        pool = pgecetPool.filter(c => {
          if (isSpecialCategory(c)) return false;
          const rawSeat = (c.allotted_category || '').toUpperCase();
          const rawCaste = (c.category || '').toUpperCase();
          return (
            rawSeat.includes(categoryFilter) ||
            rawSeat.includes(target) ||
            rawSeat.includes(targetHyphen) ||
            rawCaste.includes(categoryFilter) ||
            rawCaste.includes(targetHyphen)
          );
        });
      }
    } else {
      pool = pgecetPool.filter(c => !isSpecialCategory(c));
    }

    const specialCandidates = pgecetPool.filter(c => isSpecialCategory(c));

    if (!pool.length) {
      return {
        totalCandidates: 0,
        specialIgnoredCount: specialCandidates.length,
        openingRank: null,
        closingRank: null,
        boyCount: 0,
        girlCount: 0,
        boyPercent: 0,
        girlPercent: 0,
        boyOpening: null,
        boyClosing: null,
        girlOpening: null,
        girlClosing: null,
        candidates: [],
        specialList: specialCandidates,
      };
    }

    const ranks = pool.map(c => Number(c.rank)).filter(r => r > 0);
    const openingRank = ranks.length ? Math.min(...ranks) : null;
    const closingRank = ranks.length ? Math.max(...ranks) : null;

    const boys = pool.filter(c => (c.gender || '').toUpperCase().startsWith('M'));
    const girls = pool.filter(c => (c.gender || '').toUpperCase().startsWith('F'));

    const boyRanks = boys.map(c => Number(c.rank)).filter(r => r > 0);
    const girlRanks = girls.map(c => Number(c.rank)).filter(r => r > 0);

    return {
      totalCandidates: pool.length,
      specialIgnoredCount: specialCandidates.length,
      openingRank,
      closingRank,
      boyCount: boys.length,
      girlCount: girls.length,
      boyPercent: pool.length ? Math.round((boys.length / pool.length) * 100) : 0,
      girlPercent: pool.length ? Math.round((girls.length / pool.length) * 100) : 0,
      boyOpening: boyRanks.length ? Math.min(...boyRanks) : null,
      boyClosing: boyRanks.length ? Math.max(...boyRanks) : null,
      girlOpening: girlRanks.length ? Math.min(...girlRanks) : null,
      girlClosing: girlRanks.length ? Math.max(...girlRanks) : null,
      candidates: pool,
      specialList: specialCandidates,
    };
  }, [pgecetPool, categoryFilter]);

  // Table filtering
  const filtered = useMemo(() => {
    let list = pgecetPool;

    // Category filter
    if (categoryFilter !== 'ALL') {
      if (categoryFilter === 'SPECIAL') {
        list = list.filter(c => isSpecialCategory(c));
      } else if (categoryFilter === 'OC') {
        list = list.filter(c => {
          if (isSpecialCategory(c)) return false;
          const rawSeat = (c.allotted_category || '').toUpperCase();
          const rawCaste = (c.category || '').toUpperCase();
          if (rawSeat.includes('EWS') || rawCaste.includes('EWS')) return false;
          return rawSeat.includes('OPEN') || rawSeat.includes('OC') || rawCaste === 'OC';
        });
      } else if (categoryFilter === 'EWS') {
        list = list.filter(c => {
          if (isSpecialCategory(c)) return false;
          const rawSeat = (c.allotted_category || '').toUpperCase();
          const rawCaste = (c.category || '').toUpperCase();
          return rawSeat.includes('EWS') || rawCaste.includes('EWS');
        });
      } else {
        const target = categoryFilter.replace('-', '_');
        const targetHyphen = categoryFilter.replace('_', '-');
        list = list.filter(c => {
          if (isSpecialCategory(c)) return false;
          const rawSeat = (c.allotted_category || '').toUpperCase();
          const rawCaste = (c.category || '').toUpperCase();
          return (
            rawSeat.includes(categoryFilter) ||
            rawSeat.includes(target) ||
            rawSeat.includes(targetHyphen) ||
            rawCaste.includes(categoryFilter) ||
            rawCaste.includes(targetHyphen)
          );
        });
      }
    }

    // Gender filter
    if (genderFilter !== 'ALL') {
      list = list.filter(c => (c.gender || '').toUpperCase().startsWith(genderFilter[0]));
    }

    // Search filter
    if (searchFilter.trim()) {
      list = list.filter(c =>
        strictMultiFieldMatch(
          [c.name, String(c.rank || ''), String(c.percentile || ''), c.category, c.branch_name, c.htno, c.allotted_category],
          searchFilter
        )
      );
    }

    return list;
  }, [pgecetPool, categoryFilter, genderFilter, searchFilter]);

  const ranks    = pgecetPool.map(c => Number(c.rank)).filter(Boolean);
  const bestRank = ranks.length > 0 ? Math.min(...ranks) : null;
  const lastRank = ranks.length > 0 ? Math.max(...ranks) : null;
  const males    = pgecetPool.filter(c => (c.gender || '').toUpperCase().startsWith('M')).length;
  const females  = pgecetPool.filter(c => (c.gender || '').toUpperCase().startsWith('F')).length;

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Special Category Grouped Items (when categoryFilter === 'SPECIAL')
  const specialGrouped = useMemo(() => {
    if (categoryFilter !== 'SPECIAL') return [];
    const map = {};
    pgecetPool.filter(c => isSpecialCategory(c)).forEach(c => {
      const type = getSpecialCategoryType(c) || 'OTHER';
      if (!map[type]) {
        map[type] = {
          type,
          config: SPECIAL_CATEGORY_CONFIG[type] || {
            label: type,
            description: `${type} quota candidates`,
            badgeClass: 'bg-violet-500/20 border-violet-400/40 text-violet-300',
            icon: ShieldCheck,
          },
          count: 0,
          boys: 0,
          girls: 0,
          openingRank: Number(c.rank) || 999999,
          closingRank: Number(c.rank) || 0,
          candidates: [],
        };
      }
      map[type].count++;
      if ((c.gender || '').toUpperCase().startsWith('M')) map[type].boys++;
      else map[type].girls++;
      const r = Number(c.rank);
      if (r > 0) {
        map[type].openingRank = Math.min(map[type].openingRank, r);
        map[type].closingRank = Math.max(map[type].closingRank, r);
      }
      map[type].candidates.push(c);
    });
    return Object.values(map);
  }, [pgecetPool, categoryFilter]);

  return (
    <div ref={sectionRef} className="rounded-3xl border border-cyan-500/25 bg-[#030d14]/80 p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shrink-0">
          <GraduationCap size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-cyan-200">TG PGECET Candidates</h3>
          <p className="text-[11px] text-white/40">Admitted based on TG PGECET Percentile &amp; Rank · Strict Pure OC vs EWS Isolation</p>
        </div>
        <span className="shrink-0 text-[11px] font-mono bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 px-3 py-1 rounded-full">
          <AnimatedCounter value={filtered.length} isVisible={isVisible} duration={750} /> candidates
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Users}        label="PGECET Allotted" value={pgecetPool.length}                sub="Via PGECET rank"    color="cyan" />
        <StatCard icon={Award}        label="Opening Rank"    value={bestRank ? `#${bestRank}` : '-'}  sub="Best rank allotted" color="cyan" />
        <StatCard icon={TrendingDown} label="Closing Rank"    value={lastRank ? `#${lastRank}` : '-'}  sub="Last cutoff rank"   color="cyan" />
        <StatCard icon={PieChart}     label="M / F"           value={`${males} / ${females}`}          sub="Gender split"       color="cyan" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GenderDonut male={males} female={females} title="Gender (TG PGECET)" />
        <CategoryBar candidates={pgecetPool} barClass="bg-gradient-to-r from-cyan-500 to-purple-500" />
      </div>

      {/* Category-Specific Metrics Summary Card */}
      {categoryAnalyticsData && (
        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 via-black/50 to-black/80 p-5 sm:p-6 backdrop-blur-2xl shadow-xl transition-all space-y-4">
          {/* Card Top Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                  {categoryFilter === 'ALL'
                    ? 'All Categories Overview'
                    : categoryFilter === 'SPECIAL'
                    ? 'Special Reservation Quotas (PH / NCC / CAP / Sports)'
                    : `${categoryFilter} Category Highlights`}
                </h3>
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-cyan-300">
                  <AnimatedCounter value={categoryAnalyticsData.totalCandidates} isVisible={isVisible} duration={750} /> Allotted
                </span>
              </div>
              <p className="text-xs text-white/40 mt-1">
                {categoryFilter === 'SPECIAL'
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
                  <AnimatedCounter value={categoryAnalyticsData.totalCandidates} isVisible={isVisible} duration={750} />
                </span>
                <span className="text-xs text-white/40 ml-1.5">seats</span>
              </div>
              <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.05] text-xs font-mono">
                <span className="text-sky-400 font-medium">
                  ♂ <AnimatedCounter value={categoryAnalyticsData.boyCount} isVisible={isVisible} duration={750} /> (
                  <AnimatedCounter value={categoryAnalyticsData.boyPercent} isVisible={isVisible} duration={750} />%)
                </span>
                <span className="text-white/10">|</span>
                <span className="text-pink-400 font-medium">
                  ♀ <AnimatedCounter value={categoryAnalyticsData.girlCount} isVisible={isVisible} duration={750} /> (
                  <AnimatedCounter value={categoryAnalyticsData.girlPercent} isVisible={isVisible} duration={750} />%)
                </span>
              </div>
            </div>

            {/* 2. Overall Category Cutoff */}
            <div className="group rounded-2xl border border-cyan-500/20 bg-cyan-950/15 p-4 flex flex-col justify-between hover:border-cyan-500/35 transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-cyan-300/80 uppercase tracking-wider">
                  {categoryFilter === 'SPECIAL' ? 'Special Quota Cutoff' : 'Overall Cutoff Range'}
                </span>
                <Award size={14} className="text-cyan-400/60" />
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] text-white/40 uppercase block">Opening</span>
                  <span className="text-lg font-mono font-bold text-sky-400">
                    <AnimatedCounter value={categoryAnalyticsData.openingRank} prefix="#" isVisible={isVisible} duration={850} />
                  </span>
                </div>
                <span className="text-cyan-400/60 text-xs">➔</span>
                <div className="min-w-0">
                  <span className="text-[10px] text-white/40 uppercase block">Closing</span>
                  <span className="text-lg font-mono font-bold text-amber-400">
                    <AnimatedCounter value={categoryAnalyticsData.closingRank} prefix="#" isVisible={isVisible} duration={850} />
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-white/40 border-t border-white/[0.05] pt-2 font-sans">
                {categoryFilter === 'SPECIAL' ? 'Special reservation rank interval' : 'Full group merit interval'}
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
                    <AnimatedCounter value={categoryAnalyticsData.boyOpening} prefix="#" isVisible={isVisible} duration={850} />
                  </span>
                </div>
                <span className="text-sky-400/60 text-xs">➔</span>
                <div className="min-w-0">
                  <span className="text-[10px] text-white/40 uppercase block">Closing</span>
                  <span className="text-lg font-mono font-bold text-sky-300">
                    <AnimatedCounter value={categoryAnalyticsData.boyClosing} prefix="#" isVisible={isVisible} duration={850} />
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-sky-300/60 border-t border-white/[0.05] pt-2 font-mono">
                <AnimatedCounter value={categoryAnalyticsData.boyCount} isVisible={isVisible} duration={750} /> male candidate(s)
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
                    <AnimatedCounter value={categoryAnalyticsData.girlOpening} prefix="#" isVisible={isVisible} duration={850} />
                  </span>
                </div>
                <span className="text-pink-400/60 text-xs">➔</span>
                <div className="min-w-0">
                  <span className="text-[10px] text-white/40 uppercase block">Closing</span>
                  <span className="text-lg font-mono font-bold text-pink-300">
                    <AnimatedCounter value={categoryAnalyticsData.girlClosing} prefix="#" isVisible={isVisible} duration={850} />
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-pink-300/60 border-t border-white/[0.05] pt-2 font-mono">
                <AnimatedCounter value={categoryAnalyticsData.girlCount} isVisible={isVisible} duration={750} /> female candidate(s)
              </p>
            </div>
          </div>

          {/* Dedicated Special Category Cards (when SPECIAL is selected) */}
          {categoryFilter === 'SPECIAL' && specialGrouped.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-white/[0.06]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Special Reservation Quota Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {specialGrouped.map((item) => {
                  const Icon = item.config.icon || ShieldCheck;
                  return (
                    <div key={item.type} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-mono font-bold ${item.config.badgeClass}`}>
                            <Icon size={12} />
                            <span>{item.config.label}</span>
                          </span>
                          <span className="text-xs font-semibold text-white">
                            <AnimatedCounter value={item.count} isVisible={isVisible} duration={750} /> Admitted
                          </span>
                        </div>
                        <div className="text-xs font-mono">
                          <span className="text-sky-300">♂ {item.boys}</span>
                          <span className="text-white/20 mx-1">|</span>
                          <span className="text-pink-300">♀ {item.girls}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-white/70">
                        <span className="text-[10px] text-white/40 uppercase">Ranks:</span>
                        <span className="text-sky-400 font-bold">#{item.openingRank}</span>
                        <span className="text-white/30">→</span>
                        <span className="text-amber-400 font-bold">#{item.closingRank}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.05]">
                        {item.candidates.map((cand, ci) => (
                          <span key={cand.htno || ci} className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.03] border border-white/10 px-2 py-0.5 text-[11px] font-mono text-gray-300">
                            <span className="text-amber-400 font-semibold">#{cand.rank}</span>
                            <span className="text-white/90">{cand.name}</span>
                            <span className="text-[10px] text-purple-300/80 uppercase">({cand.allotted_category})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category / Caste Pills Filter Bar for PGECET Table */}
      <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2.5 bg-black/40 rounded-2xl border border-cyan-500/20 no-scrollbar">
        <span className="text-[11px] font-bold text-cyan-300/60 uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0">
          <Filter size={12} className="text-cyan-400" /> Quota / Caste:
        </span>
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setCategoryFilter(cat);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
              categoryFilter === cat
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30 ring-1 ring-cyan-400/50'
                : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}

        {/* Gender Filter */}
        <div className="ml-auto flex items-center gap-1 shrink-0 pl-2 border-l border-white/10">
          {[
            { key: 'ALL', label: 'ALL', activeClass: 'bg-cyan-500 text-black font-bold', inactiveClass: 'bg-white/5 border border-white/10 text-white/60 hover:text-white' },
            { key: 'Male', label: 'Male', activeClass: 'bg-blue-600 text-white shadow-md shadow-blue-600/40 font-bold', inactiveClass: 'bg-white/5 border border-white/10 text-blue-300/70 hover:text-blue-200' },
            { key: 'Female', label: 'Female', activeClass: 'bg-pink-600 text-white shadow-md shadow-pink-600/40 font-bold', inactiveClass: 'bg-white/5 border border-white/10 text-pink-300/70 hover:text-pink-200' },
          ].map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => {
                setGenderFilter(g.key);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                genderFilter === g.key ? g.activeClass : g.inactiveClass
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-cyan-500/20">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-cyan-500/20 bg-cyan-900/20 text-[11px] font-bold uppercase tracking-wider text-cyan-300/80">
                <th className="py-3 px-4 text-center w-12">#</th>
                <th className="py-3 px-4">TG PGECET Percentile</th>
                <th className="py-3 px-4">TG PGECET Rank</th>
                <th className="py-3 px-4">Hall Ticket No.</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Gender</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Allotted Quota</th>
                <th className="py-3 px-4">Specialization</th>
                <th className="py-3 px-4 text-center">Phase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-white/80">
              {loading ? (
                <tr><td colSpan={11} className="py-10 text-center text-sm text-white/40">Loading verified PGECET allotments...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={11} className="py-10 text-center text-sm text-white/40">No TG PGECET allotments for this filter selection.</td></tr>
              ) : paginated.map((cand, idx) => (
                <tr key={`pg_${cand.htno || idx}`} className="hover:bg-cyan-500/[0.04] transition">
                  <td className="py-3 px-4 text-center font-mono text-white/40">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-cyan-300 text-sm">
                      {cand.percentile != null ? (
                        <AnimatedCounter value={cand.percentile} decimals={2} isVisible={isVisible} duration={750} />
                      ) : (
                        '-'
                      )}
                    </span>
                    {cand.percentile != null && <span className="block text-[10px] text-white/40">Percentile</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-purple-300 text-sm">
                      {cand.rank ? (
                        <AnimatedCounter value={cand.rank} prefix="#" isVisible={isVisible} duration={850} />
                      ) : (
                        '-'
                      )}
                    </span>
                    {cand.rank && <span className="block text-[10px] text-white/40">State Rank</span>}
                  </td>
                  <td className="py-3 px-4 font-mono text-white/50 text-[11px]">{cand.htno || '-'}</td>
                  <td className="py-3 px-4 font-semibold text-white">{cand.name}</td>
                  <td className="py-3 px-4 font-semibold text-white/70">{cand.category}</td>
                  <td className="py-3 px-4 text-center font-bold">
                    {cand.gender === 'F' ? (
                      <span className="inline-flex items-center gap-0.5 rounded-md border border-pink-500/30 bg-pink-500/10 px-2 py-0.5 text-xs font-mono text-pink-400">
                        ♀ F
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-xs font-mono text-sky-400">
                        ♂ M
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-white/50">{cand.region || 'Local'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getSeatCategoryStyle(cand.allotted_category)}`}>
                      {cand.allotted_category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-purple-300 max-w-[180px] truncate" title={cand.branch_name}>{cand.branch_name}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">{cand.phase}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-cyan-500/20 bg-cyan-950/20 text-xs">
            <span className="text-white/40">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-white"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="font-mono font-bold text-cyan-300">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-white"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   Main Explorer
════════════════════════════════════════════════ */
export default function PgecetAllotmentExplorer({ onDataLoaded }) {
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const tableRef = useRef(null);

  const collegeOptions = useMemo(() =>
    PGECET_INSTITUTIONS.map(inst => ({ value: inst.code, label: `${inst.code} — ${inst.name}` })), []);

  const currentInst = useMemo(() =>
    selectedCollege ? PGECET_INSTITUTIONS.find(i => i.code === selectedCollege) || null : null,
    [selectedCollege]);

  const branchOptions = useMemo(() =>
    currentInst ? currentInst.courses.map(c => ({ value: c.branchName, label: c.branchName })) : [],
    [currentInst]);

  useEffect(() => {
    if (!selectedCollege) return;
    setLoading(true);
    pgecetApi.getCollegeAllotments(selectedCollege, selectedBranch)
      .then(res => {
        const list = res.data.candidates || [];
        setCandidates(list);
        if (list.length > 0) {
          onDataLoaded?.(true);
          const offset = typeof window !== 'undefined' && window.innerWidth < 640 ? 76 : 88;
          smoothScrollTo(tableRef, offset);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCollege, selectedBranch, onDataLoaded]);

  const handleExportCsv = () => {
    if (candidates.length === 0) return;
    const headers = ['S.No','Admitted Via','GATE Score','TG PGECET Percentile','TG PGECET Rank','Hall Ticket No','Name','Category','Gender','Region','Allotted Category','Branch','Phase'];
    const rows = candidates.map((c, i) => [
      c.sno || i + 1,
      c.admitted_by || (c.gate_score ? 'GATE/GPAT' : 'TG PGECET'),
      c.gate_score || '',
      c.percentile || '',
      c.rank || '',
      c.htno || '',
      `"${c.name}"`, c.category, c.gender,
      c.region || 'Local',
      c.allotted_category,
      `"${c.branch_name}"`,
      c.phase,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `TG_PGECET_${selectedCollege}_Allotments.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* ── Official Data Source Citation ───────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-950/20 px-4 py-2.5 text-[11px] text-indigo-300/80">
        <Database size={13} className="text-indigo-400 shrink-0" />
        <span className="font-semibold text-indigo-300">Official Source:</span>
        <span className="text-white/60">
          Data sourced directly from <strong className="text-white/80">TSCHE (TG PGECET M.Tech / M.Pharm) official candidate allotment records</strong> published at{' '}
          <a href="https://tgpgecet.nic.in" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 transition-colors">
            tgpgecet.nic.in
          </a>. Allotments cover GATE/GPAT and TG PGECET round-wise merit allotments.
        </span>
      </div>

      {/* Selectors */}
      <div className="relative z-50 rounded-3xl border border-white/10 bg-[#120826] p-5 sm:p-7 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Official 2026 Admissions</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Select Postgraduate Institution &amp; Specialization</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/50 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <Sparkles size={13} className="text-cyan-400" />
            <span>99 Colleges · 101 Specializations</span>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="relative z-50">
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
              {loading ? (
                <ThreeDotsLoader label="Select PG College" dotClassName="bg-purple-400" />
              ) : (
                "Select PG College"
              )}
            </label>
            <SearchableSelect options={collegeOptions} value={selectedCollege}
              loading={loading}
              loadingLabel="Loading PG colleges & allotments..."
              onChange={val => { setSelectedCollege(val); setSelectedBranch(''); }}
              placeholder="Search by code or college name..." />
          </div>
          <div className="relative z-40">
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2">Filter Specialization / Branch (Optional)</label>
            <SearchableSelect options={[{ value: '', label: 'All Offered Specializations' }, ...branchOptions]}
              value={selectedBranch} onChange={setSelectedBranch} placeholder="All Specializations..." />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <UniqueDataLoader
          examName="TG PGECET"
          title="Loading Postgraduate Allotments..."
          subtitle="Fetching verified M.Tech/M.E. candidate seat allocations, GATE scores, and category cutoffs..."
        />
      ) : !selectedCollege ? (
        <div className="rounded-3xl border border-white/10 bg-[#0e071c]/70 p-12 text-center shadow-xl backdrop-blur-xl">
          <Building size={40} className="mx-auto text-purple-400/60 mb-3" />
          <h3 className="text-lg font-bold text-white">No Postgraduate College Selected</h3>
          <p className="text-xs text-white/50 max-w-md mx-auto mt-1.5 leading-relaxed">
            Search and select an institution above to view the official 2026 seat allotments with separate GATE and TG PGECET candidate breakdowns.
          </p>
        </div>
      ) : (
        <>
          {/* College Banner */}
          {currentInst && (
            <div ref={tableRef} className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-[#160a2c]/90 via-[#100720]/90 to-[#0c0518]/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-purple-500/20 border border-purple-400/30 px-3 py-0.5 font-mono text-xs font-bold text-purple-300">{currentInst.code}</span>
                    <span className="rounded bg-white/5 px-2 py-0.5 text-xs text-white/60">{currentInst.type}</span>
                    <span className="rounded bg-cyan-500/10 border border-cyan-400/30 px-2 py-0.5 text-xs text-cyan-300">{currentInst.region} Region</span>
                  </div>
                  <h3 className="mt-2 text-lg sm:text-xl font-bold text-white leading-snug">{currentInst.name}</h3>
                </div>
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-center">
                    <span className="text-[10px] uppercase font-bold text-white/40 block">Courses</span>
                    <span className="font-mono text-base font-bold text-purple-300">
                      <AnimatedCounter value={currentInst.courses.length} duration={750} />
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-center">
                    <span className="text-[10px] uppercase font-bold text-white/40 block">Total Allotted</span>
                    <span className="font-mono text-base font-bold text-cyan-300">
                      <AnimatedCounter value={candidates.length} duration={750} />
                    </span>
                  </div>
                  <button onClick={handleExportCsv} disabled={candidates.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/10 disabled:opacity-40 transition cursor-pointer">
                    <Download size={13} /><span>Export CSV</span>
                  </button>
                </div>
              </div>
              {/* Branch Chips */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block mb-2">Click to filter by specialization:</span>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  <button type="button" onClick={() => setSelectedBranch('')}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${!selectedBranch ? 'border-purple-400 bg-purple-500/30 text-white' : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}>
                    All ({candidates.length})
                  </button>
                  {currentInst.courses.map(c => {
                    const isSel = selectedBranch === c.branchName;
                    return (
                      <button key={c.branchName} type="button" onClick={() => setSelectedBranch(isSel ? '' : c.branchName)}
                        className={`rounded-lg border px-2.5 py-1 text-xs transition cursor-pointer ${isSel ? 'border-cyan-400 bg-cyan-500/30 text-cyan-200 font-bold' : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}>
                        {c.branchName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Global Search */}
          <div className="relative z-10">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input type="text" placeholder="Search candidate name, rank, score, category..."
              value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-purple-400 focus:outline-none" />
          </div>

          {/* ── GATE Section (only when GATE scores exist) ── */}
          {(() => {
            const hasGate = candidates.some(c => c.admitted_by === 'GATE/GPAT' || c.gate_score);
            if (!hasGate) return null;
            return (
              <>
                <GateSection candidates={candidates} searchFilter={searchFilter} loading={loading} />
                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-cyan-500/30" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400/60 px-2">TG PGECET Allotments</span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-cyan-500/30" />
                </div>
              </>
            );
          })()}

          {/* ── TG PGECET Section ── */}
          <PgecetSection candidates={candidates} searchFilter={searchFilter} loading={loading} />
        </>
      )}
    </div>
  );
}
