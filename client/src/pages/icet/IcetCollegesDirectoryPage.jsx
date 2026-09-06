import { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Filter, ArrowUpRight, ArrowLeft, Building2, Award, Briefcase, GraduationCap, DollarSign, CheckCircle2, Star, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ICET_INSTITUTIONS } from '../../data/icetInstitutions';
import { TELANGANA_ENGINEERING_COLLEGES } from '../../data/telanganaCollegesData';
import Seo from '../../components/shared/Seo';

const QUICK_FILTERS = [
  { id: 'ALL', label: 'All Colleges' },
  { id: 'TOP_20', label: 'Top Ranked' },
  { id: 'UNIVERSITY', label: 'University / Govt' },
  { id: 'AUTONOMOUS', label: 'Autonomous' },
  { id: 'NAAC_A', label: 'NAAC A & Above' },
  { id: 'WOMENS', label: "Women's Only" },
  { id: 'HYDERABAD', label: 'Hyderabad' },
  { id: 'MEDCHAL', label: 'Medchal' },
  { id: 'WARANGAL', label: 'Warangal' },
];

// Curated ground-reality premier ratings for TG-ICET MBA & MCA
export const PREMIER_EXACT_RATINGS = {
  OUCB: 9.65,    // OU College of Commerce & Business Management
  OUCBSF: 9.52,  // OU College of Commerce & Business Management (Self-Finance)
  JNTM: 9.48,    // JNTUH School of Management Studies (SMS)
  JNTH: 9.45,    // JNTUH University College of Engineering (MCA)
  CBIT: 9.35,    // Chaitanya Bharathi Institute of Technology (MBA & MCA)
  OUCESF: 9.28,  // Osmania University College of Engineering (MCA Self-Finance)
  NIZBSF: 9.15,  // Nizam College Autonomous (MBA & MCA Self-Finance)
  VJEC: 9.08,    // VNR Vignana Jyothi Institute of Engg & Tech
  BDRK: 9.02,    // Badruka College Post Graduate Centre (MBA)
  OUPSSF: 8.95,  // OU PG College of Science Saifabad (MCA Self-Finance)
  KUCVSF: 8.90,  // Kakatiya University Commerce & Business Mgmt Campus (SF)
  OUSCSF: 8.86,  // OU PG College Secunderabad (MCA Self-Finance)
  KUCS: 8.84,    // Kakatiya University MCA Dept of Computer Science
  KUCSSF: 8.80,  // Kakatiya University MCA Dept of Computer Science (SF)
  AVCG: 8.76,    // A.V. College of Arts, Science & Commerce (MBA & MCA)
  RBVR: 8.72,    // R.B.V.R.R. Institute of Technology (MCA & MBA)
  KUCV: 8.68,    // Kakatiya University College of Commerce & Business Mgmt
  MVSR: 8.64,    // MVSR Engineering College (MBA Autonomous)
  PEND: 8.60,    // Pendekanti Institute of Management
  BVBV: 8.56,    // Bhavans Vivekananda College of Science & Humanities
  SNIS: 8.52,    // Sreenidhi Institute of Science and Technology (MBA)
  VJIT: 8.48,    // Vidya Jyothi Institute of Technology (MBA Autonomous)
  BVRI: 8.44,    // B.V. Raju Institute of Technology (MBA)
  VMEG: 8.40,    // Vardhaman College of Engineering (MBA Autonomous)
  KITS: 8.36,    // Kakatiya Institute of Technology & Science (MBA Warangal)
  IARE: 8.32,    // Institute of Aeronautical Engineering (MBA)
  CMRK: 8.28,    // CMR College of Engineering & Technology (MBA)
  NREC: 8.25,    // Nalla Malla Reddy Engineering College (MBA Autonomous)
  ANUG: 8.22,    // Anurag University (Formerly CVSR College of Engg)
  GCCA: 8.20,    // Government City College Autonomous
  IPGW: 8.18,    // Indira Priyadarshini Govt Degree College for Women
  NITHSF: 8.15,  // National Institute of Tourism & Hospitality Management
  CKMD: 8.12,    // CKM Government Arts and Science College
  AURM: 8.08,    // Aurora's PG College (MBA)
  AURI: 8.05,    // Aurora's PG College (MCA Autonomous)
};

// Helper to calculate exact rating for each ICET college (matching ground reality & profile page)
export function getIcetCollegeRating(col) {
  if (!col) return 7.5;
  const code = (col.code || '').toUpperCase().trim();

  // 1. Curated Ground-Reality Premier Benchmarks
  if (PREMIER_EXACT_RATINGS[code]) {
    return PREMIER_EXACT_RATINGS[code];
  }

  // 2. Merit-Calibrated Rating for all other affiliated colleges based on cutoffs & NAAC
  const mbaOc = col.cutoffHistory?.['2025']?.mba?.oc || col.cutoffHistory?.['2024']?.mba?.oc || 45000;
  const mcaOc = col.cutoffHistory?.['2025']?.mca?.oc || col.cutoffHistory?.['2024']?.mca?.oc || 45000;
  const bestOc = Math.min(mbaOc, mcaOc);

  // Dynamic rank component: top cutoffs get up to 8.02, mid cutoffs ~7.50, low cutoffs ~7.10
  let score = 8.04 - (bestOc / 50000) * 0.95;

  const naac = (col.naac || '').toUpperCase();
  if (naac === 'A++') score += 0.15;
  else if (naac === 'A+') score += 0.08;
  else if (naac.startsWith('A')) score += 0.03;

  // Strict ceiling at 8.02 so unlisted/general colleges never eclipse top tier autonomous colleges
  const finalScore = Math.min(8.02, Math.max(7.10, score));
  return parseFloat(finalScore.toFixed(2));
}

export function getScoreColor(score) {
  if (!score) return 'text-gray-400';
  if (score >= 9.0) return 'text-emerald-400';
  if (score >= 8.5) return 'text-teal-400';
  if (score >= 8.0) return 'text-cyan-400';
  if (score >= 7.5) return 'text-amber-400';
  return 'text-orange-400';
}

export function getGradeColor(grade) {
  if (!grade) return 'text-gray-400';
  const g = String(grade).toUpperCase();
  if (g.startsWith('A++')) return 'text-emerald-400';
  if (g.startsWith('A+')) return 'text-green-400';
  if (g.startsWith('A')) return 'text-lime-400';
  if (g.startsWith('B+')) return 'text-amber-400';
  return 'text-orange-400';
}

export default function IcetCollegesDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedProgram, setSelectedProgram] = useState('MBA'); // MBA, MCA
  const [displayCount, setDisplayCount] = useState(48);

  // When search query or filters change, reset display count so users see matching items from the top
  useEffect(() => {
    setDisplayCount(48);
  }, [searchTerm, selectedFilter, selectedProgram]);

  const filteredColleges = useMemo(() => {
    let list = [...(ICET_INSTITUTIONS || [])];

    // 1. Program Tab Filter (MBA / MCA)
    if (selectedProgram === 'MBA') {
      list = list.filter((c) => (c.coursesOffered || []).includes('MBA') || (c.intake?.mba || 0) > 0);
    } else if (selectedProgram === 'MCA') {
      list = list.filter((c) => (c.coursesOffered || []).includes('MCA') || (c.intake?.mca || 0) > 0);
    }

    // 2. Quick Attribute Filter
    if (selectedFilter === 'TOP_20') {
      list = list.filter((c) => {
        const r = getIcetCollegeRating(c);
        return r >= 8.5 || Boolean(PREMIER_EXACT_RATINGS[(c.code || '').toUpperCase().trim()]);
      });
    } else if (selectedFilter === 'MBA') {
      list = list.filter((c) => (c.coursesOffered || []).includes('MBA') || (c.intake?.mba || 0) > 0);
    } else if (selectedFilter === 'MCA') {
      list = list.filter((c) => (c.coursesOffered || []).includes('MCA') || (c.intake?.mca || 0) > 0);
    } else if (selectedFilter === 'UNIVERSITY') {
      list = list.filter((c) => {
        const t = (c.type || '').toLowerCase();
        const n = (c.name || '').toLowerCase();
        return t.includes('university') || t.includes('govt') || t.includes('constituent') || n.includes('osmania') || n.includes('jntu') || n.includes('kakatiya');
      });
    } else if (selectedFilter === 'AUTONOMOUS') {
      list = list.filter((c) => {
        const t = (c.type || '').toLowerCase();
        const n = (c.name || '').toLowerCase();
        return t.includes('autonomous') || n.includes('autonomous');
      });
    } else if (selectedFilter === 'NAAC_A') {
      list = list.filter((c) => (c.naac || '').toUpperCase().startsWith('A'));
    } else if (selectedFilter === 'WOMENS') {
      list = list.filter((c) => {
        const fullStr = `${c.code || ''} ${c.name || ''} ${c.shortName || ''} ${c.coEd || ''} ${c.type || ''}`.toLowerCase();
        return fullStr.includes('women') || fullStr.includes('girls') || c.coEd === 'GIRLS';
      });
    } else if (selectedFilter === 'HYDERABAD') {
      list = list.filter((c) => {
        const d = (c.district || '').toLowerCase();
        const p = (c.place || '').toLowerCase();
        return d.includes('hyderabad') || d.includes('rangareddy') || p.includes('hyderabad');
      });
    } else if (selectedFilter === 'MEDCHAL') {
      list = list.filter((c) => (c.district || '').toLowerCase().includes('medchal') || (c.place || '').toLowerCase().includes('ghatkesar'));
    } else if (selectedFilter === 'WARANGAL') {
      list = list.filter((c) => {
        const d = (c.district || '').toLowerCase();
        return d.includes('warangal') || d.includes('hanamkonda');
      });
    }

    // 3. Search query across all fields (name, code, district, place, university, courses)
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      const tokens = q.split(/\s+/).filter(Boolean);

      list = list.filter((c) => {
        const cCode = (c.code || '').toLowerCase();
        const cName = (c.name || '').toLowerCase();
        const cShort = (c.shortName || '').toLowerCase();
        const cDist = (c.district || '').toLowerCase();
        const cPlace = (c.place || '').toLowerCase();
        const cUniv = (c.university || '').toLowerCase();
        const cCourses = (c.coursesOffered || []).join(' ').toLowerCase();

        // Exact or prefix code match gives instant 100% match
        if (cCode === q || cCode.startsWith(q) || cCode.includes(q)) return true;

        const combinedText = `${cCode} ${cName} ${cShort} ${cDist} ${cPlace} ${cUniv} ${cCourses}`;
        // Every token in search query must appear in combinedText
        return tokens.every((token) => combinedText.includes(token));
      });
    }

    // 4. Sort in Descending Order of Rating (Highest rating first)
    list.sort((a, b) => {
      const ratingA = getIcetCollegeRating(a);
      const ratingB = getIcetCollegeRating(b);
      if (ratingB !== ratingA) {
        return ratingB - ratingA; // Descending
      }
      // If ratings are equal, prioritize lower 2025 OC cutoff rank
      const cutA = a.cutoffHistory?.['2025']?.mba?.oc || a.cutoffHistory?.['2025']?.mca?.oc || 99999;
      const cutB = b.cutoffHistory?.['2025']?.mba?.oc || b.cutoffHistory?.['2025']?.mca?.oc || 99999;
      return cutA - cutB;
    });

    return list;
  }, [searchTerm, selectedFilter, selectedProgram]);

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12 text-left">
      <Seo
        title="TG ICET 2027 Colleges Directory — MBA & MCA Institutions in Telangana"
        description="Explore accredited MBA and MCA colleges in Telangana under Osmania University, JNTUH, Kakatiya University with verified cutoffs, fees, intake and TS ePASS eligibility."
        path="/tg-icet/colleges"
      />

      {/* Top Breadcrumb Nav */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link to="/tg-icet" className="inline-flex items-center gap-1 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          <span>TG ICET Home</span>
        </Link>
        <span>/</span>
        <span className="text-white">Colleges Directory</span>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] via-[#0d0f17] to-black/80 p-6 sm:p-8 backdrop-blur-2xl shadow-xl mb-8">
        <div className="relative z-10 max-w-4xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300 mb-3">
            <Building2 size={13} />
            <span>Telangana MBA &amp; MCA Institutions</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
            TG ICET Colleges Directory (MBA &amp; MCA)
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-300 leading-relaxed">
            Browse through accredited MBA and MCA colleges affiliated with Osmania University (OU), JNTUH, Kakatiya University (KU), and others. Review official intake, fees, category cutoffs, and TS ePASS eligibility.
          </p>

          {/* Program Toggle: MBA / MCA & How We Rate Link */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-white/50 font-semibold mr-1">Program Filter:</span>
              {[
                { id: 'MBA', label: 'MBA Colleges' },
                { id: 'MCA', label: 'MCA Colleges' },
              ].map((prog) => (
                <button
                  key={prog.id}
                  type="button"
                  onClick={() => setSelectedProgram(prog.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    selectedProgram === prog.id
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/60 border border-purple-400/40'
                      : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {prog.label}
                </button>
              ))}
            </div>

            <Link
              to="/tg-icet/ranking-methodology"
              className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-purple-500/30 bg-purple-500/10 px-3.5 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all shadow-sm group"
            >
              <HelpCircle size={14} className="text-purple-400 group-hover:scale-110 transition-transform" />
              <span>How we rate colleges</span>
              <ArrowUpRight size={13} className="opacity-70 group-hover:opacity-100" />
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Quick Filter Bar */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by college name, code (e.g. OUCB, CBIT, JNBS), district, or university..."
            className="w-full rounded-2xl border border-white/15 bg-white/[0.03] pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 backdrop-blur-xl"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Attribute Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0 mr-1">
            <Filter size={14} />
            <span>Filter:</span>
          </div>
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFilter(f.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.05] border border-white/[0.06]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4 px-1">
        <span>
          Showing <span className="font-bold text-white">{Math.min(filteredColleges.length, displayCount)}</span> of{' '}
          <span className="font-bold text-white">{filteredColleges.length}</span> colleges
        </span>
        {searchTerm && (
          <span>
            Matching &ldquo;<span className="text-purple-300">{searchTerm}</span>&rdquo;
          </span>
        )}
      </div>

      {/* Colleges Grid */}
      {filteredColleges.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
          <p className="text-gray-400 text-sm">No colleges matched your search criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedFilter('ALL');
              setSelectedProgram('ALL');
            }}
            className="mt-3 text-xs font-bold text-purple-400 hover:underline cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredColleges.slice(0, displayCount).map((col, index) => {
            const rating = getIcetCollegeRating(col);
            const progKey = selectedProgram.toLowerCase();
            const fee = col.feeByCourse?.[progKey] || col.annualFee || col.fee || 0;
            const placeOrDist = col.district || col.place || col.location || 'Telangana';
            const programIntake = col.intake?.[progKey] || 0;

            return (
              <a
                key={`${col.code}-${selectedProgram}`}
                href={`/tg-icet/colleges/${col.code.toLowerCase()}/${progKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 hover:border-purple-500/50 hover:bg-white/[0.07] transition-all flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[11px] font-extrabold font-mono">
                      #{index + 1}
                    </span>
                    <span className="rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 text-[10px] font-extrabold font-mono">
                      {selectedProgram}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className={`text-base font-extrabold ${getScoreColor(rating)}`}>
                      {rating.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-white/30">/10</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white leading-tight group-hover:text-purple-200 transition-colors line-clamp-2">
                    {col.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-mono">{col.code}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {col.naac && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10 bg-white/5 ${getGradeColor(col.naac)}`}>
                      {col.naac.startsWith('A') || col.naac.startsWith('B') ? col.naac : `NAAC ${col.naac}`}
                    </span>
                  )}
                  {col.type && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-gray-300">
                      {col.type}
                    </span>
                  )}
                  {programIntake > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 font-mono">
                      {programIntake} Seats
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <MapPin size={11} />
                    {placeOrDist}
                  </span>
                  <span className="text-[11px] font-bold text-amber-300 font-mono">
                    {fee > 0 ? `₹${fee.toLocaleString()}` : 'Govt Fees'}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-purple-400 font-semibold group-hover:text-purple-300">
                  View {selectedProgram} Profile <ArrowUpRight size={12} />
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Show More Pagination */}
      {displayCount < filteredColleges.length && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setDisplayCount((prev) => prev + 48)}
            className="rounded-full border border-white/20 bg-white/10 hover:bg-white hover:text-black px-6 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
          >
            Load More Colleges ({filteredColleges.length - displayCount} remaining)
          </button>
        </div>
      )}
    </main>
  );
}
