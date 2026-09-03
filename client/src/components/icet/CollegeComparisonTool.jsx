import { useState, useEffect } from 'react';
import { ArrowLeftRight, Award, CheckCircle2, DollarSign, GraduationCap, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { icetApi } from '../../lib/icetApi';
import { ICET_INSTITUTIONS, ICET_PROGRAMS } from '../../data/icetInstitutions';
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

export default function CollegeComparisonTool({ initialC1 = '', initialC2 = '', initialC3 = '', initialProgram = 'MBA' }) {
  const [collegesList, setCollegesList] = useState(ICET_INSTITUTIONS);
  const [c1, setC1] = useState(initialC1);
  const [c2, setC2] = useState(initialC2);
  const [c3, setC3] = useState(initialC3);
  const [showC3, setShowC3] = useState(Boolean(initialC3));
  const [program, setProgram] = useState(initialProgram);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load college catalog
  useEffect(() => {
    icetApi.getColleges({ program })
      .then((res) => {
        if (res.data?.colleges && res.data.colleges.length > 0) setCollegesList(res.data.colleges);
      })
      .catch(console.error);
  }, [program]);

  // Fetch comparison data
  useEffect(() => {
    if (!c1 || !c2 || c1 === c2) {
      setComparison(null);
      setLoading(false);
      return;
    }
    const activeC3 = showC3 && c3 && c3 !== c1 && c3 !== c2 ? c3 : '';
    setLoading(true);
    icetApi.compare(c1, c2, program, activeC3)
      .then((res) => {
        if (res.data) setComparison(res.data);
      })
      .catch((err) => {
        console.warn('ICET Compare API offline, fallback to local dataset:', err);
        const colA = ICET_INSTITUTIONS.find(c => c.code === c1) || { code: c1, name: c1 };
        const colB = ICET_INSTITUTIONS.find(c => c.code === c2) || { code: c2, name: c2 };
        const colC = activeC3 ? (ICET_INSTITUTIONS.find(c => c.code === activeC3) || { code: activeC3, name: activeC3 }) : null;

        const histA = colA.cutoffHistory?.['2025']?.[program.toLowerCase()] || {};
        const histB = colB.cutoffHistory?.['2025']?.[program.toLowerCase()] || {};
        const histC = colC ? (colC.cutoffHistory?.['2025']?.[program.toLowerCase()] || {}) : {};

        setComparison({
          collegeA: colA,
          collegeB: colB,
          collegeC: colC || undefined,
          cutoffA: {
            OC: histA.oc,
            EWS: histA.ews,
            'BC-A': histA.bca,
            'BC-B': histA.bcb,
            'BC-C': histA.bcc,
            'BC-D': histA.bcd,
            'BC-E': histA.bce,
            SC: histA.sc,
            ST: histA.st,
          },
          cutoffB: {
            OC: histB.oc,
            EWS: histB.ews,
            'BC-A': histB.bca,
            'BC-B': histB.bcb,
            'BC-C': histB.bcc,
            'BC-D': histB.bcd,
            'BC-E': histB.bce,
            SC: histB.sc,
            ST: histB.st,
          },
          cutoffC: colC ? {
            OC: histC.oc,
            EWS: histC.ews,
            'BC-A': histC.bca,
            'BC-B': histC.bcb,
            'BC-C': histC.bcc,
            'BC-D': histC.bcd,
            'BC-E': histC.bce,
            SC: histC.sc,
            ST: histC.st,
          } : undefined,
        });
      })
      .finally(() => setLoading(false));
  }, [c1, c2, c3, showC3, program]);

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
    sublabel: col.district ? `${col.district} · ₹${(col.annualFee || 0).toLocaleString()}/yr` : undefined,
  }));

  const programOptions = ICET_PROGRAMS.map((p) => ({
    value: p.code,
    label: p.name,
  }));

  const collegeA = comparison?.collegeA || comparison?.college1;
  const collegeB = comparison?.collegeB || comparison?.college2;
  const collegeC = showC3 && c3 ? (comparison?.collegeC) : null;

  const cutoffA = comparison?.cutoffA || {};
  const cutoffB = comparison?.cutoffB || {};
  const cutoffC = collegeC ? (comparison?.cutoffC || {}) : null;

  const avgPackageA = collegeA?.placements?.averagePackage || `₹${collegeA?.averagePlacementLpa || 0} LPA`;
  const avgPackageB = collegeB?.placements?.averagePackage || `₹${collegeB?.averagePlacementLpa || 0} LPA`;
  const avgPackageC = collegeC ? (collegeC?.placements?.averagePackage || `₹${collegeC?.averagePlacementLpa || 0} LPA`) : null;

  const highPackageA = collegeA?.placements?.highestPackage || `₹${collegeA?.highestPlacementLpa || 0} LPA`;
  const highPackageB = collegeB?.placements?.highestPackage || `₹${collegeB?.highestPlacementLpa || 0} LPA`;
  const highPackageC = collegeC ? (collegeC?.placements?.highestPackage || `₹${collegeC?.highestPlacementLpa || 0} LPA`) : null;

  const feeA = collegeA?.annualFee || collegeA?.tuitionFeePerYear || 0;
  const feeB = collegeB?.annualFee || collegeB?.tuitionFeePerYear || 0;
  const feeC = collegeC ? (collegeC?.annualFee || collegeC?.tuitionFeePerYear || 0) : null;

  return (
    <div className="relative z-20 overflow-visible rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300">
            <ArrowLeftRight size={16} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Side-by-Side MBA &amp; MCA Comparison Matrix</h3>
            <p className="text-xs text-white/50">Compare 2 or 3 colleges across 2025 category cutoffs, placement CTCs, NAAC ratings, and tuition fees</p>
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
            🏛️ {collegesList.length} TSCHE Institute Profiles
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

        {/* Swap (shown only when comparing 2 colleges) */}
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

        {/* Programme Filter Row */}
        <div className="md:col-span-12 pt-2 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-xs font-semibold text-white/70">Select Programme (MBA / MCA):</span>
          <div className="w-full sm:w-80">
            <SearchableSelect
              value={program}
              onChange={(val) => setProgram(val)}
              placeholder="-- Select Programme --"
              options={programOptions}
            />
          </div>
        </div>
      </div>

      {/* Comparison Grid or Selection Prompt */}
      {loading ? (
        <div className="h-64 rounded-xl bg-white/5 animate-pulse" />
      ) : !c1 || !c2 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-300 mb-4">
            <ArrowLeftRight size={26} />
          </div>
          <h4 className="text-lg font-semibold text-white">Select {showC3 ? '2 or 3 Colleges' : 'Two Colleges'} to Compare</h4>
          <p className="mt-1 text-sm text-white/50 max-w-md mx-auto">
            Choose Institution A and Institution B {showC3 ? 'and optionally Institution C ' : ''}from the dropdowns above to analyze 2025 last-rank category cutoffs, packages, and fees side-by-side.
          </p>
        </div>
      ) : !collegeA || !collegeB ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-8 text-center text-red-300 text-sm">
          Could not load details for one or more colleges. Please select different institutions.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Cards for College A, B & C */}
          <div className={`grid gap-4 sm:gap-6 ${collegeC ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
            {/* College A Header */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 sm:p-5">
              <span className="font-mono text-xs font-bold text-purple-300 bg-purple-900/40 px-2.5 py-1 rounded border border-purple-500/30">
                {collegeA.code}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white mt-2 truncate" title={collegeA.name}>{collegeA.shortName || collegeA.name}</h4>
              <p className="text-xs text-white/50 mt-0.5">{collegeA.district} • {collegeA.place || ''}</p>
            </div>

            {/* College B Header */}
            <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 sm:p-5">
              <span className="font-mono text-xs font-bold text-blue-300 bg-blue-900/40 px-2.5 py-1 rounded border border-blue-500/30">
                {collegeB.code}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white mt-2 truncate" title={collegeB.name}>{collegeB.shortName || collegeB.name}</h4>
              <p className="text-xs text-white/50 mt-0.5">{collegeB.district} • {collegeB.place || ''}</p>
            </div>

            {/* College C Header (Optional) */}
            {collegeC && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 sm:p-5">
                <span className="font-mono text-xs font-bold text-amber-300 bg-amber-900/40 px-2.5 py-1 rounded border border-amber-500/30">
                  {collegeC.code}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-white mt-2 truncate" title={collegeC.name}>{collegeC.shortName || collegeC.name}</h4>
                <p className="text-xs text-white/50 mt-0.5">{collegeC.district} • {collegeC.place || ''}</p>
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
                {/* 2025 Category Cutoffs (OC, EWS, BC-A, BC-B, BC-C, BC-D, BC-E, SC, ST) */}
                {['OC', 'EWS', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST'].map((catKey, idx) => (
                  <tr key={catKey} className={`hover:bg-white/[0.03] ${idx === 0 ? 'bg-purple-950/20 border-b border-purple-500/20' : ''}`}>
                    <td className="py-3 px-4 sm:px-6 text-white font-medium flex items-center justify-between">
                      <span>2025 {catKey} Cutoff ({program})</span>
                      {idx === 0 && (
                        <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-[10px] text-purple-300 font-bold">
                          2025 Official
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 sm:px-6 font-mono font-bold text-purple-300 text-sm">
                      {cutoffA?.[catKey] ? `#${cutoffA[catKey].toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 sm:px-6 font-mono font-bold text-blue-300 text-sm">
                      {cutoffB?.[catKey] ? `#${cutoffB[catKey].toLocaleString()}` : 'N/A'}
                    </td>
                    {collegeC && (
                      <td className="py-3 px-4 sm:px-6 font-mono font-bold text-amber-300 text-sm">
                        {cutoffC?.[catKey] ? `#${cutoffC[catKey].toLocaleString()}` : 'N/A'}
                      </td>
                    )}
                  </tr>
                ))}

                {/* Highest CTC */}
                {(() => {
                  const valA = parsePkgVal(highPackageA);
                  const valB = parsePkgVal(highPackageB);
                  const valC = collegeC ? parsePkgVal(highPackageC) : 0;
                  const maxVal = Math.max(valA, valB, valC);
                  const showBadge = maxVal > 0 && !(valA === valB && (!collegeC || valB === valC));
                  return (
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Highest Placement Package</td>
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400">
                        {highPackageA}
                        {showBadge && valA === maxVal && <WinnerBadge label="Highest" />}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400">
                        {highPackageB}
                        {showBadge && valB === maxVal && <WinnerBadge label="Highest" />}
                      </td>
                      {collegeC && (
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400">
                          {highPackageC}
                          {showBadge && valC === maxVal && <WinnerBadge label="Highest" />}
                        </td>
                      )}
                    </tr>
                  );
                })()}

                {/* Average CTC */}
                {(() => {
                  const valA = parsePkgVal(avgPackageA);
                  const valB = parsePkgVal(avgPackageB);
                  const valC = collegeC ? parsePkgVal(avgPackageC) : 0;
                  const maxVal = Math.max(valA, valB, valC);
                  const showBadge = maxVal > 0 && !(valA === valB && (!collegeC || valB === valC));
                  return (
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Average Package</td>
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-white/90">
                        {avgPackageA}
                        {showBadge && valA === maxVal && <WinnerBadge label="Best Avg" />}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-white/90">
                        {avgPackageB}
                        {showBadge && valB === maxVal && <WinnerBadge label="Best Avg" />}
                      </td>
                      {collegeC && (
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-white/90">
                          {avgPackageC}
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
                        {collegeA.placements?.placementRate || '90%+'}
                        {showBadge && valA === maxVal && <WinnerBadge label="Top %" />}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-white/80">
                        {collegeB.placements?.placementRate || '90%+'}
                        {showBadge && valB === maxVal && <WinnerBadge label="Top %" />}
                      </td>
                      {collegeC && (
                        <td className="py-3.5 px-4 sm:px-6 text-white/80">
                          {collegeC.placements?.placementRate || '90%+'}
                          {showBadge && valC === maxVal && <WinnerBadge label="Top %" />}
                        </td>
                      )}
                    </tr>
                  );
                })()}

                {/* Annual Tuition Fee */}
                {(() => {
                  const numA = parseFeeVal(feeA);
                  const numB = parseFeeVal(feeB);
                  const numC = collegeC ? parseFeeVal(feeC) : 0;
                  const validFees = [numA, numB, ...(collegeC ? [numC] : [])].filter(f => f > 0);
                  const minFee = validFees.length > 0 ? Math.min(...validFees) : 0;
                  const showBadge = minFee > 0 && !(numA === numB && (!collegeC || numB === numC));
                  return (
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Annual Tuition Fee</td>
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-white/90">
                        ₹{Number(feeA).toLocaleString()} / yr
                        {showBadge && numA === minFee && <WinnerBadge label="Lowest Fee" />}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-white/90">
                        ₹{Number(feeB).toLocaleString()} / yr
                        {showBadge && numB === minFee && <WinnerBadge label="Lowest Fee" />}
                      </td>
                      {collegeC && (
                        <td className="py-3.5 px-4 sm:px-6 font-semibold text-white/90">
                          ₹{Number(feeC).toLocaleString()} / yr
                          {showBadge && numC === minFee && <WinnerBadge label="Lowest Fee" />}
                        </td>
                      )}
                    </tr>
                  );
                })()}

                {/* NAAC & NIRF */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Accreditation Grade</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">NAAC {collegeA.naac || collegeA.naacGrade || 'A'} • {collegeA.nirfRank ? `NIRF #${collegeA.nirfRank}` : (collegeA.university || 'Affiliated')}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">NAAC {collegeB.naac || collegeB.naacGrade || 'A'} • {collegeB.nirfRank ? `NIRF #${collegeB.nirfRank}` : (collegeB.university || 'Affiliated')}</td>
                  {collegeC && (
                    <td className="py-3.5 px-4 sm:px-6 text-white/80">NAAC {collegeC.naac || collegeC.naacGrade || 'A'} • {collegeC.nirfRank ? `NIRF #${collegeC.nirfRank}` : (collegeC.university || 'Affiliated')}</td>
                  )}
                </tr>

                {/* Status & Affiliation */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Affiliation &amp; Status</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeA.university || collegeA.affiliation || 'OU'} ({collegeA.type})</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeB.university || collegeB.affiliation || 'OU'} ({collegeB.type})</td>
                  {collegeC && (
                    <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeC.university || collegeC.affiliation || 'OU'} ({collegeC.type})</td>
                  )}
                </tr>

                {/* Hostel */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Campus Hostel</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeA.hostelAvailable ? '✅ Available' : '❌ Day Scholar / Private Hostels'}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeB.hostelAvailable ? '✅ Available' : '❌ Day Scholar / Private Hostels'}</td>
                  {collegeC && (
                    <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeC.hostelAvailable ? '✅ Available' : '❌ Day Scholar / Private Hostels'}</td>
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
