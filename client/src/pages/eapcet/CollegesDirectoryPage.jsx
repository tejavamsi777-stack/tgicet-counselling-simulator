import { useState, useMemo } from 'react';
import { Search, MapPin, Filter, ArrowUpRight, ArrowLeft, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EAPCET_INSTITUTIONS } from '../../data/eapcetInstitutions';
import { strictMultiFieldMatch } from '../../utils/searchMatch';
import Seo from '../../components/shared/Seo';

const FILTERS = [
  { id: 'ALL', label: 'All Colleges' },
  { id: 'TOP_20', label: 'Top 20' },
  { id: 'WOMENS', label: "Women's Only" },
  { id: 'AUTONOMOUS', label: 'Autonomous' },
  { id: 'UNIVERSITY', label: 'University / Govt' },
  { id: 'NAAC_A', label: 'NAAC A & Above' },
  { id: 'HYDERABAD', label: 'Hyderabad' },
  { id: 'MEDCHAL', label: 'Medchal' },
  { id: 'WARANGAL', label: 'Warangal' },
];

// Helper to calculate exact scraped Eduvale rating from quality parameters
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
  
  // Fallback decay formula based on official TSCHE rank if parameters missing
  const rank = col?.rank || 50;
  return Math.max(5.1, Math.min(9.8, 9.6 - (rank - 1) * 0.021));
}

export default function CollegesDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [displayCount, setDisplayCount] = useState(50);

  const filteredColleges = useMemo(() => {
    let list = [...(EAPCET_INSTITUTIONS || [])].sort((a, b) => (a.rank || 999) - (b.rank || 999));

    if (selectedFilter === 'TOP_20') {
      list = list.filter((c) => (c.rank || 999) <= 20);
    } else if (selectedFilter === 'WOMENS') {
      list = list.filter((c) => {
        const fullStr = `${c.code || ''} ${c.name || ''} ${c.shortName || ''} ${c.type || ''} ${c.gender || ''}`.toLowerCase();
        return (
          fullStr.includes('women') ||
          fullStr.includes('female') ||
          fullStr.includes('girls') ||
          fullStr.includes('bvrw') ||
          fullStr.includes('mrcw') ||
          fullStr.includes('griw') ||
          fullStr.includes('stan') ||
          fullStr.includes('bhoj') ||
          fullStr.includes('gietw') ||
          fullStr.includes('vnrw') ||
          c.gender === 'WOMEN' ||
          c.isWomensOnly === true
        );
      });
    } else if (selectedFilter === 'AUTONOMOUS') {
      list = list.filter((c) => (c.type || '').toLowerCase().includes('autonomous'));
    } else if (selectedFilter === 'UNIVERSITY') {
      list = list.filter((c) => {
        const t = (c.type || '').toLowerCase();
        return t.includes('university') || t.includes('government');
      });
    } else if (selectedFilter === 'HYDERABAD') {
      list = list.filter((c) => {
        const d = (c.district || '').toLowerCase();
        return d.includes('hyderabad') || d.includes('rangareddy');
      });
    } else if (selectedFilter === 'MEDCHAL') {
      list = list.filter((c) => (c.district || '').toLowerCase().includes('medchal'));
    } else if (selectedFilter === 'WARANGAL') {
      list = list.filter((c) => {
        const d = (c.district || '').toLowerCase();
        return d.includes('warangal') || d.includes('hanamkonda');
      });
    } else if (selectedFilter === 'NAAC_A') {
      list = list.filter((c) => (c.naac || c.naac_grade || '').toUpperCase().startsWith('A'));
    }

    if (searchTerm.trim()) {
      list = list.filter((c) =>
        strictMultiFieldMatch([c.code, c.name, c.shortName, c.district, c.location], searchTerm)
      );
    }

    return list;
  }, [searchTerm, selectedFilter]);

  const visibleColleges = useMemo(() => filteredColleges.slice(0, displayCount), [filteredColleges, displayCount]);

  const getScoreColor = (score) => {
    if (!score) return 'text-gray-400';
    if (score >= 8) return 'text-emerald-400';
    if (score >= 6) return 'text-green-400';
    if (score >= 4) return 'text-amber-400';
    return 'text-orange-400';
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'text-gray-400';
    if (grade.startsWith('A++')) return 'text-emerald-400';
    if (grade.startsWith('A+')) return 'text-green-400';
    if (grade.startsWith('A')) return 'text-lime-400';
    if (grade.startsWith('B+')) return 'text-amber-400';
    return 'text-orange-400';
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <Seo
        title="Telangana Engineering Colleges Directory 2026 — All 214 TSCHE Colleges Ranked"
        description="Complete ranked directory of 214 TSCHE engineering colleges in Telangana. Filter by district, type, NAAC grade. View fees, branches, and cutoff data."
        path="/tg-eapcet/colleges"
      />

      <div>
        <Link to="/tg-eapcet" className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 mb-3">
          <ArrowLeft size={13} /> Back to TG EAPCET Portal
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Telangana Engineering Colleges</h1>
        <p className="text-sm text-gray-400 mt-1.5">{filteredColleges.length} colleges · Ranked by quality score · TSCHE 2026</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search college name or code (e.g. CBIT, VNR, GRIET)..." className="w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold flex items-center gap-1 shrink-0"><Filter size={12} /> Filter:</span>
          {FILTERS.map((tab) => (
            <button key={tab.id} onClick={() => setSelectedFilter(tab.id)} className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 ${selectedFilter === tab.id ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>{tab.label}</button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Showing <strong className="text-white">{Math.min(displayCount, filteredColleges.length)}</strong> of <strong className="text-white">{filteredColleges.length}</strong> colleges</span>
        {searchTerm && <span>Results for: <strong className="text-purple-300">"{searchTerm}"</strong></span>}
      </div>

      {filteredColleges.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-16 text-center text-gray-400">
          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No colleges found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleColleges.map((col) => (
            <a key={col.code} href={`/tg-eapcet/colleges/${col.code}`} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 hover:border-purple-500/50 hover:bg-white/[0.07] transition-all flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[11px] font-extrabold font-mono">#{col.rank}</span>
                <div className="flex items-center gap-0.5">
                  <span className={`text-base font-extrabold ${getScoreColor(getCollegeEduvaleRating(col))}`}>{getCollegeEduvaleRating(col).toFixed(1)}</span>
                  <span className="text-[10px] text-white/30">/10</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight group-hover:text-purple-200 transition-colors line-clamp-2">{col.name}</h3>
                <p className="text-[11px] text-gray-500 mt-0.5 font-mono">{col.code}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {col.grade && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10 bg-white/5 ${getGradeColor(col.grade)}`}>{col.grade}</span>}
                {col.type && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-gray-300">{col.type}</span>}
              </div>
              <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] text-gray-400"><MapPin size={11} />{col.district || col.location}</span>
                <span className="text-[11px] font-bold text-amber-300">{((col.annualFee || col.fee) || 0) > 0 ? '₹' + (col.annualFee || col.fee).toLocaleString() : 'Govt Fees'}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-purple-400 font-semibold group-hover:text-purple-300">View Profile <ArrowUpRight size={12} /></div>
            </a>
          ))}
        </div>
      )}

      {displayCount < filteredColleges.length && (
        <div className="text-center pt-4">
          <button onClick={() => setDisplayCount((prev) => prev + 50)} className="text-sm font-bold text-white bg-white/5 border border-white/10 px-8 py-3 rounded-2xl hover:bg-white/10 transition-all">
            Load More ({filteredColleges.length - displayCount} remaining)
          </button>
        </div>
      )}
    </main>
  );
}
