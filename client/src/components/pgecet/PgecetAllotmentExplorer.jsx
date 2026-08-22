import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, Users, Award, TrendingDown, Download, Building,
  GraduationCap, Sparkles, BarChart3, PieChart, Star, Trophy,
} from 'lucide-react';
import { pgecetApi } from '../../lib/pgecetApi';
import { PGECET_INSTITUTIONS } from '../../data/pgecetInstitutions';
import SearchableSelect from '../shared/SearchableSelect';
import UniqueDataLoader from '../shared/UniqueDataLoader';
import { smoothScrollTo } from '../../lib/utils';

function getSeatCategoryStyle(cat = '') {
  const c = String(cat).toUpperCase().replace(/_/g, '-').trim();
  if (c.includes('FEMALE')) return 'bg-pink-500/20 border-pink-400/40 text-pink-300';
  if (c.includes('OPEN') || c.includes('OC')) return 'bg-sky-500/20 border-sky-400/40 text-sky-300';
  if (c.includes('EWS')) return 'bg-teal-500/20 border-teal-400/40 text-teal-300';
  if (c.includes('BCA') || c.includes('BC-A')) return 'bg-orange-500/20 border-orange-400/40 text-orange-300';
  if (c.includes('BCB') || c.includes('BC-B')) return 'bg-amber-500/20 border-amber-400/40 text-amber-300';
  if (c.includes('BCC') || c.includes('BC-C')) return 'bg-lime-500/20 border-lime-400/40 text-lime-300';
  if (c.includes('BCD') || c.includes('BC-D')) return 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300';
  if (c.includes('BCE') || c.includes('BC-E')) return 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300';
  if (c.includes('ST')) return 'bg-rose-500/20 border-rose-400/40 text-rose-300';
  if (c.includes('SC')) return 'bg-purple-500/20 border-purple-400/40 text-purple-300';
  return 'bg-violet-500/20 border-violet-400/40 text-violet-300';
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
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-lg ${s.card}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">{label}</p>
        {Icon && <Icon size={16} className={s.icon} />}
      </div>
      <p className={`font-mono text-2xl sm:text-3xl font-bold tracking-tight ${s.text}`}>{value}</p>
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
      const q = (c.allotted_category || c.category || '').toUpperCase();
      let key = 'OC';
      if (q.includes('EWS')) key = 'EWS';
      else if (q.includes('BC-A') || q.includes('BCA')) key = 'BC-A';
      else if (q.includes('BC-B') || q.includes('BCB')) key = 'BC-B';
      else if (q.includes('BC-D') || q.includes('BCD')) key = 'BC-D';
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
          <p className="text-[10px] text-white/40">Category-wise seat spread</p>
        </div>
      </div>
      <div className="space-y-2">
        {['OC', 'EWS', 'BC-A', 'BC-B', 'BC-D', 'SC', 'SC-2', 'ST'].map((cat) => {
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
  const filtered = useMemo(() => {
    const g = candidates.filter(c => c.admitted_by === 'GATE/GPAT' || c.gate_score);
    if (!searchFilter.trim()) return g;
    const t = searchFilter.toLowerCase();
    return g.filter(c =>
      c.name.toLowerCase().includes(t) ||
      String(c.gate_score || '').includes(t) ||
      c.category.toLowerCase().includes(t) ||
      c.branch_name.toLowerCase().includes(t)
    );
  }, [candidates, searchFilter]);

  const scores = filtered.map(c => Number(c.gate_score)).filter(Boolean);
  const highScore = scores.length > 0 ? Math.max(...scores) : null;
  const lowScore  = scores.length > 0 ? Math.min(...scores) : null;
  const males     = filtered.filter(c => c.gender === 'M').length;
  const females   = filtered.filter(c => c.gender === 'F').length;

  return (
    <div className="rounded-3xl border border-amber-500/25 bg-[#0f0a00]/80 p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 shrink-0">
          <Star size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-amber-200">GATE / GPAT Qualified Candidates</h3>
          <p className="text-[11px] text-white/40">Admitted based on GATE / GPAT Score</p>
        </div>
        <span className="shrink-0 text-[11px] font-mono bg-amber-500/15 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full">
          {filtered.length} candidates
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Users}        label="GATE Allotted"  value={filtered.length}        sub="Via GATE/GPAT"        color="amber" />
        <StatCard icon={Trophy}       label="Highest Score"  value={highScore ?? '-'}        sub="Best GATE score"      color="amber" />
        <StatCard icon={TrendingDown} label="Lowest Score"   value={lowScore ?? '-'}         sub="Cutoff GATE score"    color="amber" />
        <StatCard icon={PieChart}     label="M / F"          value={`${males} / ${females}`} sub="Gender split"         color="amber" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GenderDonut male={males} female={females} title="Gender (GATE/GPAT)" />
        <CategoryBar candidates={filtered} barClass="bg-gradient-to-r from-amber-500 to-yellow-400" />
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
                <tr><td colSpan={10} className="py-10 text-center text-sm text-white/40">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="py-10 text-center text-sm text-white/40">No GATE / GPAT allotments for this selection.</td></tr>
              ) : filtered.map((cand, idx) => (
                <tr key={`gate_${idx}`} className="hover:bg-amber-500/[0.04] transition">
                  <td className="py-3 px-4 text-center font-mono text-white/40">{cand.sno || idx + 1}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-extrabold text-amber-300 text-sm">{cand.gate_score}</span>
                    <span className="block text-[10px] text-amber-400/60">GATE Score</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-white/50 text-[11px]">{cand.htno || '-'}</td>
                  <td className="py-3 px-4 font-semibold text-white">{cand.name}</td>
                  <td className="py-3 px-4 font-semibold text-white/70">{cand.category}</td>
                  <td className="py-3 px-4 text-center font-bold">
                    <span className={cand.gender === 'F' ? 'text-pink-400' : 'text-sky-400'}>{cand.gender}</span>
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
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   TG PGECET Section
════════════════════════════════════════════════ */
function PgecetSection({ candidates, searchFilter, loading }) {
  const filtered = useMemo(() => {
    const pg = candidates.filter(c => !(c.admitted_by === 'GATE/GPAT' || c.gate_score));
    if (!searchFilter.trim()) return pg;
    const t = searchFilter.toLowerCase();
    return pg.filter(c =>
      c.name.toLowerCase().includes(t) ||
      String(c.rank || '').includes(t) ||
      String(c.percentile || '').includes(t) ||
      c.category.toLowerCase().includes(t) ||
      c.branch_name.toLowerCase().includes(t)
    );
  }, [candidates, searchFilter]);

  const ranks   = filtered.map(c => c.rank).filter(Boolean);
  const bestRank = ranks.length > 0 ? Math.min(...ranks) : null;
  const lastRank = ranks.length > 0 ? Math.max(...ranks) : null;
  const males    = filtered.filter(c => c.gender === 'M').length;
  const females  = filtered.filter(c => c.gender === 'F').length;

  return (
    <div className="rounded-3xl border border-cyan-500/25 bg-[#030d14]/80 p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shrink-0">
          <GraduationCap size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-cyan-200">TG PGECET Candidates</h3>
          <p className="text-[11px] text-white/40">Admitted based on TG PGECET Percentile &amp; Rank</p>
        </div>
        <span className="shrink-0 text-[11px] font-mono bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 px-3 py-1 rounded-full">
          {filtered.length} candidates
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Users}        label="PGECET Allotted" value={filtered.length}                  sub="Via PGECET rank"    color="cyan" />
        <StatCard icon={Award}        label="Opening Rank"    value={bestRank ? `#${bestRank}` : '-'}  sub="Best rank allotted" color="cyan" />
        <StatCard icon={TrendingDown} label="Closing Rank"    value={lastRank ? `#${lastRank}` : '-'}  sub="Last cutoff rank"   color="cyan" />
        <StatCard icon={PieChart}     label="M / F"           value={`${males} / ${females}`}          sub="Gender split"       color="cyan" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GenderDonut male={males} female={females} title="Gender (TG PGECET)" />
        <CategoryBar candidates={filtered} barClass="bg-gradient-to-r from-cyan-500 to-purple-500" />
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
                <tr><td colSpan={11} className="py-10 text-center text-sm text-white/40">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={11} className="py-10 text-center text-sm text-white/40">No TG PGECET allotments for this selection.</td></tr>
              ) : filtered.map((cand, idx) => (
                <tr key={`pg_${idx}`} className="hover:bg-cyan-500/[0.04] transition">
                  <td className="py-3 px-4 text-center font-mono text-white/40">{cand.sno || idx + 1}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-cyan-300 text-sm">{cand.percentile ?? '-'}</span>
                    {cand.percentile != null && <span className="block text-[10px] text-white/40">Percentile</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-purple-300 text-sm">{cand.rank ? `#${cand.rank}` : '-'}</span>
                    {cand.rank && <span className="block text-[10px] text-white/40">State Rank</span>}
                  </td>
                  <td className="py-3 px-4 font-mono text-white/50 text-[11px]">{cand.htno || '-'}</td>
                  <td className="py-3 px-4 font-semibold text-white">{cand.name}</td>
                  <td className="py-3 px-4 font-semibold text-white/70">{cand.category}</td>
                  <td className="py-3 px-4 text-center font-bold">
                    <span className={cand.gender === 'F' ? 'text-pink-400' : 'text-sky-400'}>{cand.gender}</span>
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
          smoothScrollTo(tableRef, 80);
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
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">Select PG College</label>
            <SearchableSelect options={collegeOptions} value={selectedCollege}
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
                    <span className="font-mono text-base font-bold text-purple-300">{currentInst.courses.length}</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-center">
                    <span className="text-[10px] uppercase font-bold text-white/40 block">Total Allotted</span>
                    <span className="font-mono text-base font-bold text-cyan-300">{candidates.length}</span>
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
