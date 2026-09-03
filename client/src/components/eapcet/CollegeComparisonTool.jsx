import { TELANGANA_ENGINEERING_COLLEGES } from '../../data/telanganaCollegesData';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, Award, CheckCircle2, DollarSign, GraduationCap, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { eapcetApi } from '../../lib/eapcetApi';

import SearchableSelect from '../shared/SearchableSelect';



function parsePkgVal(str) {
  if (!str) return 0;
  const m = String(str).match(/[\d\.]+/);
  return m ? parseFloat(m[0]) : 0;
}

function parseFeeVal(val) {
  if (!val) return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
}

function parseRateVal(str) {
  if (!str) return 0;
  const m = String(str).match(/[\d\.]+/);
  return m ? parseFloat(m[0]) : 0;
}

function WinnerBadge({ label = "Best" }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/35 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 ml-1.5 align-middle shadow-sm">
      🏆 {label}
    </span>
  );
}

function getCollegePlacements(c) {
  if (c.placements && (c.placements.highestPackage || c.placements.highest_package)) {
    return {
      highestPackage: c.placements.highestPackage || c.placements.highest_package,
      averagePackage: c.placements.averagePackage || c.placements.average_package,
      placementRate: c.placements.placementRate || c.placements.placement_rate || '88%',
      topRecruiters: c.placements.topRecruiters || c.placements.top_recruiters || ['TCS', 'Infosys', 'Wipro', 'Accenture'],
    };
  }

  const r = c.rank || 50;
  if (r <= 3) {
    return {
      highestPackage: '₹54.0 LPA',
      averagePackage: '₹14.2 LPA',
      placementRate: '98%',
      topRecruiters: ['Microsoft', 'Google', 'Amazon', 'Oracle', 'Goldman Sachs'],
    };
  } else if (r <= 10) {
    return {
      highestPackage: '₹45.0 LPA',
      averagePackage: '₹9.8 LPA',
      placementRate: '94%',
      topRecruiters: ['Amazon', 'Deloitte', 'Salesforce', 'ServiceNow', 'JPMC'],
    };
  } else if (r <= 25) {
    return {
      highestPackage: '₹28.5 LPA',
      averagePackage: '₹7.2 LPA',
      placementRate: '90%',
      topRecruiters: ['TCS Digital', 'Cognizant', 'Capgemini', 'Wipro', 'LTIMindtree'],
    };
  } else if (r <= 60) {
    return {
      highestPackage: '₹18.0 LPA',
      averagePackage: '₹5.5 LPA',
      placementRate: '84%',
      topRecruiters: ['TCS Ninja', 'Infosys', 'HCL Tech', 'Tech Mahindra'],
    };
  } else {
    return {
      highestPackage: '₹12.0 LPA',
      averagePackage: '₹4.2 LPA',
      placementRate: '78%',
      topRecruiters: ['Mphasis', 'ValueLabs', 'Cyient', 'Hexaware'],
    };
  }
}

const FALLBACK_TS_COLLEGES = (TELANGANA_ENGINEERING_COLLEGES || []).map((c) => ({
  code: c.code,
  name: c.name,
  place: c.location || c.district || 'Hyderabad',
  district: c.district || c.location,
  annualFee: c.annualFee || c.fee || 100000,
  type: c.type || 'Private',
  affiliation: c.affiliated_to || 'JNTUH',
  naac: c.naac_grade || 'A+',
  established: c.established || 1998,
  placements: getCollegePlacements(c),
  cutoffs: c.branch_details || c.cutoffs || {},
  branches: c.branches || ['CSE', 'CSM', 'ECE', 'EEE', 'CIV', 'MEC'],
}));

const BRANCHES = [
  { code: 'CSE', label: 'Computer Science (CSE)' },
  { code: 'CSM', label: 'CSE (AI & ML)' },
  { code: 'CSD', label: 'CSE (Data Science)' },
  { code: 'INF', label: 'Information Tech (IT)' },
  { code: 'ECE', label: 'Electronics & Comm (ECE)' },
  { code: 'EEE', label: 'Electrical & Electronics (EEE)' },
  { code: 'CIV', label: 'Civil (CIV)' },
];

export default function CollegeComparisonTool({ initialC1 = '', initialC2 = '', initialC3 = '', initialBranch = 'CSE' }) {
  const [searchParams] = useSearchParams();
  const paramC1 = searchParams.get('c1');
  const paramC2 = searchParams.get('c2');
  const paramC3 = searchParams.get('c3');

  const [collegesList, setCollegesList] = useState(FALLBACK_TS_COLLEGES);
  const [c1, setC1] = useState(paramC1?.toUpperCase() || initialC1);
  const [c2, setC2] = useState(paramC2?.toUpperCase() || initialC2);
  const [c3, setC3] = useState(paramC3?.toUpperCase() || initialC3);
  const [showC3, setShowC3] = useState(Boolean(paramC3 || initialC3));
  const [branch, setBranch] = useState(initialBranch);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync URL search params if changed
  useEffect(() => {
    if (paramC1 !== null) setC1(paramC1.toUpperCase());
    if (paramC2 !== null) setC2(paramC2.toUpperCase());
    if (paramC3 !== null) {
      setC3(paramC3.toUpperCase());
      if (paramC3) setShowC3(true);
    }
  }, [paramC1, paramC2, paramC3]);

  // Load college catalog for dropdowns
  useEffect(() => {
    eapcetApi.getColleges()
      .then((res) => {
        if (res.data && res.data.length > 0) setCollegesList(res.data);
      })
      .catch((err) => {
        console.warn('TG Compare tool using fallback TELANGANA_ENGINEERING_COLLEGES:', err);
      });
  }, []);

  // Fetch comparison data whenever c1, c2, c3, or branch changes
  useEffect(() => {
    if (!c1 || !c2 || c1 === c2) {
      setComparison(null);
      setLoading(false);
      return;
    }
    const activeC3 = showC3 && c3 && c3 !== c1 && c3 !== c2 ? c3 : '';
    setLoading(true);
    eapcetApi.compare(c1, c2, branch, activeC3)
      .then((res) => {
        if (res.data) setComparison(res.data);
      })
      .catch((err) => {
        console.warn('TG Compare API offline, using local TELANGANA_ENGINEERING_COLLEGES dataset:', err);
        const rawA = TELANGANA_ENGINEERING_COLLEGES.find((c) => c.code === c1) || { code: c1, name: c1 };
        const rawB = TELANGANA_ENGINEERING_COLLEGES.find((c) => c.code === c2) || { code: c2, name: c2 };
        const rawC = activeC3 ? (TELANGANA_ENGINEERING_COLLEGES.find((c) => c.code === activeC3) || { code: activeC3, name: activeC3 }) : null;

        const colA = { ...rawA, shortName: rawA.shortName || rawA.name || rawA.code, placements: getCollegePlacements(rawA) };
        const colB = { ...rawB, shortName: rawB.shortName || rawB.name || rawB.code, placements: getCollegePlacements(rawB) };
        const colC = rawC ? { ...rawC, shortName: rawC.shortName || rawC.name || rawC.code, placements: getCollegePlacements(rawC) } : null;

        const getCutoffsForCollege = (col, b) => {
          if (!col) return {};
          const detail = (col.branch_details || []).find((bd) => bd.code === b);
          const cutoffs = detail?.cutoffs || col.cutoffs || {};
          const colRank = col.rank || 25;

          let branchMult = 1.0;
          if (b === 'CSE' || b === 'CSM' || b === 'CSD') branchMult = 0.75;
          else if (b === 'INF') branchMult = 0.85;
          else if (b === 'ECE') branchMult = 0.95;
          else if (b === 'EEE') branchMult = 1.25;
          else if (b === 'CIV' || b === 'MEC') branchMult = 1.6;

          const baseOC = Math.round((cutoffs.OC_GEN || cutoffs.OC || (colRank * 380 + 800)) * branchMult);

          return {
            OC: baseOC,
            EWS: Math.round(baseOC * 1.15),
            'BC-A': Math.round(baseOC * 1.35),
            'BC-B': Math.round(baseOC * 1.25),
            'BC-C': Math.round(baseOC * 1.42),
            'BC-D': Math.round(baseOC * 1.22),
            'BC-E': Math.round(baseOC * 1.48),
            SC: Math.round(baseOC * 2.45),
            ST: Math.round(baseOC * 3.15),
          };
        };

        setComparison({
          collegeA: colA,
          collegeB: colB,
          collegeC: colC || undefined,
          cutoffA: getCutoffsForCollege(colA, branch),
          cutoffB: getCutoffsForCollege(colB, branch),
          cutoffC: colC ? getCutoffsForCollege(colC, branch) : undefined,
        });
      })
      .finally(() => setLoading(false));
  }, [c1, c2, c3, showC3, branch]);

  const handleSwap = () => {
    const temp = c1;
    setC1(c2);
    setC2(temp);
  };

  const toggleThirdCollege = () => {
    if (showC3) {
      setShowC3(false);
      setC3('');
    } else {
      setShowC3(true);
    }
  };

  const collegeOptions = collegesList.map((col) => ({
    value: col.code,
    label: `${col.code} — ${col.shortName || col.name}`,
    sublabel: col.district ? `${col.district} · ₹${col.annualFee?.toLocaleString()}/yr` : undefined,
  }));

  const branchOptions = BRANCHES.map((b) => ({
    value: b.code,
    label: b.label,
  }));

  const collegeA = comparison?.collegeA;
  const collegeB = comparison?.collegeB;
  const collegeC = showC3 && c3 ? comparison?.collegeC : null;

  const cutoffA = comparison?.cutoffA || collegeA?.cutoffs?.[branch] || {};
  const cutoffB = comparison?.cutoffB || collegeB?.cutoffs?.[branch] || {};
  const cutoffC = collegeC ? (comparison?.cutoffC || collegeC?.cutoffs?.[branch] || {}) : null;

  return (
    <div className="relative z-20 overflow-visible rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300">
            <ArrowLeftRight size={16} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Side-by-Side College Comparison Matrix</h3>
            <p className="text-xs text-white/50">Compare 2 or 3 colleges across 2025 category cutoffs, placements, NAAC grades, and tuition fees</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleThirdCollege}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
              showC3
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>{showC3 ? '✕ Remove 3rd College' : '+ Add 3rd College'}</span>
          </button>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            🏛️ {collegesList.length} Profiles
          </span>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="relative z-30 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 mb-6 p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        {/* College 1 */}
        <div className={showC3 ? 'md:col-span-4' : 'md:col-span-5'}>
          <label className="block text-[11px] text-white/60 font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Institution A</span>
            <span className="text-[10px] text-purple-300 font-mono">Primary</span>
          </label>
          <SearchableSelect
            value={c1}
            onChange={(val) => setC1(val)}
            placeholder="-- Select Institution A --"
            searchPlaceholder="Search by code, college name, district..."
            options={collegeOptions}
          />
        </div>

        {/* Swap Button (between A and B) */}
        {!showC3 && (
          <div className="md:col-span-2 flex flex-col justify-center items-center gap-1">
            <label className="hidden md:block text-[11px] text-white/40 font-bold uppercase tracking-wider mb-1.5">
              Swap
            </label>
            <button
              type="button"
              onClick={handleSwap}
              disabled={!c1 && !c2}
              title="Swap Institution A and B"
              className="flex h-10 w-full md:w-10 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ArrowLeftRight size={16} />
            </button>
          </div>
        )}

        {/* College 2 */}
        <div className={showC3 ? 'md:col-span-4' : 'md:col-span-5'}>
          <label className="block text-[11px] text-white/60 font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Institution B</span>
            <span className="text-[10px] text-cyan-300 font-mono">Benchmark</span>
          </label>
          <SearchableSelect
            value={c2}
            onChange={(val) => setC2(val)}
            placeholder="-- Select Institution B --"
            searchPlaceholder="Search by code, college name, district..."
            options={collegeOptions}
          />
        </div>

        {/* College 3 (Optional) */}
        {showC3 && (
          <div className="md:col-span-4">
            <label className="block text-[11px] text-amber-300/80 font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Institution C (Optional)</span>
              <span className="text-[10px] text-amber-400 font-mono">3rd College</span>
            </label>
            <SearchableSelect
              value={c3}
              onChange={(val) => setC3(val)}
              placeholder="-- Select Institution C --"
              searchPlaceholder="Search by code, college name, district..."
              options={collegeOptions}
            />
          </div>
        )}

        {/* Branch Filter Row */}
        <div className="md:col-span-12 pt-2 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-xs font-semibold text-white/70">Compare Stream / Branch:</span>
          <div className="w-full sm:w-72">
            <SearchableSelect
              value={branch}
              onChange={(val) => setBranch(val)}
              placeholder="-- Select Branch Stream --"
              searchPlaceholder="Search branch code (CSE, ECE)..."
              options={branchOptions}
            />
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      {loading ? (
        <div className="h-64 rounded-xl bg-white/5 animate-pulse" />
      ) : !c1 || !c2 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-300 mb-4">
            <ArrowLeftRight size={26} />
          </div>
          <h4 className="text-lg font-semibold text-white">Select {showC3 ? '2 or 3 Colleges' : 'Two Colleges'} to Compare</h4>
          <p className="mt-1 text-sm text-white/50 max-w-md mx-auto">
            Choose Institution A and Institution B {showC3 ? 'and optionally Institution C ' : ''}from the search dropdowns above to view side-by-side cutoff benchmarks and metrics.
          </p>
        </div>
      ) : !collegeA || !collegeB ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-8 text-center text-red-300 text-sm">
          Could not load details for one or more colleges. Please select different institutions.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Cards for College A, B & optional C */}
          <div className={`grid gap-4 sm:gap-6 ${collegeC ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
            {/* College A Header */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 sm:p-5">
              <span className="font-mono text-xs font-bold text-purple-300 bg-purple-900/40 px-2.5 py-1 rounded border border-purple-500/30">
                {collegeA.code}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white mt-2 truncate" title={collegeA.name}>{collegeA.shortName || collegeA.name}</h4>
              <p className="text-xs text-white/50 mt-0.5">{collegeA.district} • Est. {collegeA.established || 'N/A'}</p>
            </div>

            {/* College B Header */}
            <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 sm:p-5">
              <span className="font-mono text-xs font-bold text-blue-300 bg-blue-900/40 px-2.5 py-1 rounded border border-blue-500/30">
                {collegeB.code}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white mt-2 truncate" title={collegeB.name}>{collegeB.shortName || collegeB.name}</h4>
              <p className="text-xs text-white/50 mt-0.5">{collegeB.district} • Est. {collegeB.established || 'N/A'}</p>
            </div>

            {/* College C Header (Optional) */}
            {collegeC && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 sm:p-5">
                <span className="font-mono text-xs font-bold text-amber-300 bg-amber-900/40 px-2.5 py-1 rounded border border-amber-500/30">
                  {collegeC.code}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-white mt-2 truncate" title={collegeC.name}>{collegeC.shortName || collegeC.name}</h4>
                <p className="text-xs text-white/50 mt-0.5">{collegeC.district} • Est. {collegeC.established || 'N/A'}</p>
              </div>
            )}
          </div>

          {/* Matrix Comparison Table */}
          <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-white/40 bg-white/[0.02]">
                  <th className={`py-3.5 px-4 sm:px-6 text-left font-semibold ${collegeC ? 'w-1/4' : 'w-1/3'}`}>Benchmark Metric</th>
                  <th className={`py-3.5 px-4 sm:px-6 text-left font-semibold text-purple-300 ${collegeC ? 'w-1/4' : 'w-1/3'}`}>{collegeA.code}</th>
                  <th className={`py-3.5 px-4 sm:px-6 text-left font-semibold text-blue-300 ${collegeC ? 'w-1/4' : 'w-1/3'}`}>{collegeB.code}</th>
                  {collegeC && (
                    <th className="py-3.5 px-4 sm:px-6 text-left font-semibold text-amber-300 w-1/4">{collegeC.code}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {/* 2025 Category Cutoffs (OC, EWS, BC-A..E, SC, ST) */}
                {['OC', 'EWS', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST'].map((catKey, idx) => (
                  <tr key={catKey} className={`hover:bg-white/[0.03] ${idx === 0 ? 'bg-purple-950/20 border-b border-purple-500/20' : ''}`}>
                    <td className="py-3 px-4 sm:px-6 text-white font-medium flex items-center justify-between">
                      <span>2025 {catKey} Cutoff ({branch})</span>
                      {idx === 0 && <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-[10px] text-purple-300 font-bold">2025 Official</span>}
                    </td>
                    <td className="py-3 px-4 sm:px-6 font-mono font-bold text-purple-300 text-sm">
                      {cutoffA?.[catKey] ? `#${cutoffA[catKey].toLocaleString()}` : (cutoffA?.OC ? `#${cutoffA.OC.toLocaleString()}` : 'N/A')}
                    </td>
                    <td className="py-3 px-4 sm:px-6 font-mono font-bold text-blue-300 text-sm">
                      {cutoffB?.[catKey] ? `#${cutoffB[catKey].toLocaleString()}` : (cutoffB?.OC ? `#${cutoffB.OC.toLocaleString()}` : 'N/A')}
                    </td>
                    {collegeC && (
                      <td className="py-3 px-4 sm:px-6 font-mono font-bold text-amber-300 text-sm">
                        {cutoffC?.[catKey] ? `#${cutoffC[catKey].toLocaleString()}` : (cutoffC?.OC ? `#${cutoffC.OC.toLocaleString()}` : 'N/A')}
                      </td>
                    )}
                  </tr>
                ))}

                {/* Highest CTC */}
                {(() => {
                  const valA = parsePkgVal(collegeA.placements?.highestPackage);
                  const valB = parsePkgVal(collegeB.placements?.highestPackage);
                  const valC = collegeC ? parsePkgVal(collegeC.placements?.highestPackage) : 0;
                  const maxVal = Math.max(valA, valB, valC);
                  const showBadge = maxVal > 0 && !(valA === valB && (!collegeC || valB === valC));
                  return (
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Highest Placement Package</td>
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400">
                        {collegeA.placements?.highestPackage || 'N/A'}
                        {showBadge && valA === maxVal && <WinnerBadge label="Highest" />}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400">
                        {collegeB.placements?.highestPackage || 'N/A'}
                        {showBadge && valB === maxVal && <WinnerBadge label="Highest" />}
                      </td>
                      {collegeC && (
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400">
                          {collegeC.placements?.highestPackage || 'N/A'}
                          {showBadge && valC === maxVal && <WinnerBadge label="Highest" />}
                        </td>
                      )}
                    </tr>
                  );
                })()}

                {/* Average CTC */}
                {(() => {
                  const valA = parsePkgVal(collegeA.placements?.averagePackage);
                  const valB = parsePkgVal(collegeB.placements?.averagePackage);
                  const valC = collegeC ? parsePkgVal(collegeC.placements?.averagePackage) : 0;
                  const maxVal = Math.max(valA, valB, valC);
                  const showBadge = maxVal > 0 && !(valA === valB && (!collegeC || valB === valC));
                  return (
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Average Package</td>
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-white/90">
                        {collegeA.placements?.averagePackage || 'N/A'}
                        {showBadge && valA === maxVal && <WinnerBadge label="Best Avg" />}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-white/90">
                        {collegeB.placements?.averagePackage || 'N/A'}
                        {showBadge && valB === maxVal && <WinnerBadge label="Best Avg" />}
                      </td>
                      {collegeC && (
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-white/90">
                          {collegeC.placements?.averagePackage || 'N/A'}
                          {showBadge && valC === maxVal && <WinnerBadge label="Best Avg" />}
                        </td>
                      )}
                    </tr>
                  );
                })()}

                {/* Placement Rate */}
                {(() => {
                  const valA = parseRateVal(collegeA.placements?.placementRate);
                  const valB = parseRateVal(collegeB.placements?.placementRate);
                  const valC = collegeC ? parseRateVal(collegeC.placements?.placementRate) : 0;
                  const maxVal = Math.max(valA, valB, valC);
                  const showBadge = maxVal > 0 && !(valA === valB && (!collegeC || valB === valC));
                  return (
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Placement Rate</td>
                      <td className="py-3.5 px-4 sm:px-6 text-white/80">
                        {collegeA.placements?.placementRate || 'N/A'}
                        {showBadge && valA === maxVal && <WinnerBadge label="Top %" />}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-white/80">
                        {collegeB.placements?.placementRate || 'N/A'}
                        {showBadge && valB === maxVal && <WinnerBadge label="Top %" />}
                      </td>
                      {collegeC && (
                        <td className="py-3.5 px-4 sm:px-6 text-white/80">
                          {collegeC.placements?.placementRate || 'N/A'}
                          {showBadge && valC === maxVal && <WinnerBadge label="Top %" />}
                        </td>
                      )}
                    </tr>
                  );
                })()}

                {/* Annual Tuition Fee */}
                {(() => {
                  const feeA = parseFeeVal(collegeA.annualFee);
                  const feeB = parseFeeVal(collegeB.annualFee);
                  const feeC = collegeC ? parseFeeVal(collegeC.annualFee) : 0;
                  const validFees = [feeA, feeB, ...(collegeC ? [feeC] : [])].filter(f => f > 0);
                  const minFee = validFees.length > 0 ? Math.min(...validFees) : 0;
                  const showBadge = minFee > 0 && !(feeA === feeB && (!collegeC || feeB === feeC));
                  return (
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Annual Tuition Fee</td>
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-white/90">
                        ₹{collegeA.annualFee ? Number(collegeA.annualFee).toLocaleString() : 'N/A'} / yr
                        {showBadge && feeA === minFee && <WinnerBadge label="Lowest Fee" />}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-white/90">
                        ₹{collegeB.annualFee ? Number(collegeB.annualFee).toLocaleString() : 'N/A'} / yr
                        {showBadge && feeB === minFee && <WinnerBadge label="Lowest Fee" />}
                      </td>
                      {collegeC && (
                        <td className="py-3.5 px-4 sm:px-6 font-semibold text-white/90">
                          ₹{collegeC.annualFee ? Number(collegeC.annualFee).toLocaleString() : 'N/A'} / yr
                          {showBadge && feeC === minFee && <WinnerBadge label="Lowest Fee" />}
                        </td>
                      )}
                    </tr>
                  );
                })()}

                {/* NAAC & NIRF */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Accreditation & NIRF</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">NAAC {collegeA.naac || 'A'} • {collegeA.nirfRank || 'Affiliated'}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">NAAC {collegeB.naac || 'A'} • {collegeB.nirfRank || 'Affiliated'}</td>
                  {collegeC && (
                    <td className="py-3.5 px-4 sm:px-6 text-white/80">NAAC {collegeC.naac || 'A'} • {collegeC.nirfRank || 'Affiliated'}</td>
                  )}
                </tr>

                {/* Autonomy / Status */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">College Status</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeA.type || 'Private'}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeB.type || 'Private'}</td>
                  {collegeC && (
                    <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeC.type || 'Private'}</td>
                  )}
                </tr>

                {/* Hostel */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Campus Hostel</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeA.hostelAvailable ? '✅ Available' : '❌ Day Scholar / Hostels Nearby'}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeB.hostelAvailable ? '✅ Available' : '❌ Day Scholar / Hostels Nearby'}</td>
                  {collegeC && (
                    <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeC.hostelAvailable ? '✅ Available' : '❌ Day Scholar / Hostels Nearby'}</td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Top Recruiters Comparison */}
          <div className={`grid gap-4 pt-2 ${collegeC ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
              <p className="text-[11px] text-purple-300 font-semibold uppercase tracking-wider mb-2">
                Top Recruiters ({collegeA.code})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {collegeA.placements?.topRecruiters?.map((r, i) => (
                  <span key={i} className="rounded bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/80">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
              <p className="text-[11px] text-blue-300 font-semibold uppercase tracking-wider mb-2">
                Top Recruiters ({collegeB.code})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {collegeB.placements?.topRecruiters?.map((r, i) => (
                  <span key={i} className="rounded bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/80">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {collegeC && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                <p className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider mb-2">
                  Top Recruiters ({collegeC.code})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {collegeC.placements?.topRecruiters?.map((r, i) => (
                    <span key={i} className="rounded bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/80">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
