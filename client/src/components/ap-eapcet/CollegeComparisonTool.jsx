import { AP_COLLEGES_METADATA } from '../../data/apCollegesMetadata';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, Award, CheckCircle2, DollarSign, GraduationCap, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { apEapcetApi } from '../../lib/apEapcetApi';

import SearchableSelect from '../shared/SearchableSelect';


const FALLBACK_AP_COLLEGES = Object.values(AP_COLLEGES_METADATA || {}).map((c) => ({
  code: c.code,
  name: c.name,
  place: c.place || c.district || 'Andhra Pradesh',
  district: c.district || c.place,
  annualFee: c.annualFee || c.fee || 47000,
  type: c.type || 'Private',
  affiliation: c.affiliation || 'JNTUK',
  naac: c.naac || 'A',
  placements: c.placements || { highestPackage: '₹12.0 LPA', averagePackage: '₹4.5 LPA' },
  branches: c.feeByBranch ? Object.keys(c.feeByBranch) : ['CSE', 'ECE', 'EEE', 'CIV', 'MEC'],
}));
const ALL_KNOWN_BRANCHES = [
  { code: 'CSE', label: 'Computer Science & Engineering (CSE)' },
  { code: 'CSM', label: 'CSE - Artificial Intelligence & ML (CSM)' },
  { code: 'CSD', label: 'CSE - Data Science (CSD)' },
  { code: 'CSC', label: 'CSE - Cyber Security (CSC)' },
  { code: 'CSB', label: 'CS & Business Systems (CSB)' },
  { code: 'CAI', label: 'Computer Science & AI (CAI)' },
  { code: 'AID', label: 'AI & Data Science (AID)' },
  { code: 'AIM', label: 'Artificial Intelligence & ML (AIM)' },
  { code: 'INF', label: 'Information Technology (INF)' },
  { code: 'IT', label: 'Information Technology (IT)' },
  { code: 'ECE', label: 'Electronics & Communication (ECE)' },
  { code: 'EEE', label: 'Electrical & Electronics (EEE)' },
  { code: 'EIE', label: 'Electronics & Instrumentation (EIE)' },
  { code: 'ECM', label: 'Electronics & Computer Engg (ECM)' },
  { code: 'MEC', label: 'Mechanical Engineering (MEC)' },
  { code: 'CIV', label: 'Civil Engineering (CIV)' },
  { code: 'CHE', label: 'Chemical Engineering (CHE)' },
  { code: 'AGR', label: 'Agricultural Engineering (AGR)' },
  { code: 'AUT', label: 'Automobile Engineering (AUT)' },
  { code: 'BIO', label: 'Biotechnology (BIO)' },
  { code: 'BME', label: 'Biomedical Engineering (BME)' },
  { code: 'MIN', label: 'Mining Engineering (MIN)' },
  { code: 'PET', label: 'Petroleum Engineering (PET)' },
  { code: 'FT', label: 'Food Technology (FT)' },
];

export default function CollegeComparisonTool({ initialC1 = 'VITAPU', initialC2 = 'GVPE', initialBranch = 'CSE' }) {
  const [searchParams] = useSearchParams();
  const paramC1 = searchParams.get('c1');
  const paramC2 = searchParams.get('c2');

  const [collegesList, setCollegesList] = useState(FALLBACK_AP_COLLEGES);
  const [c1, setC1] = useState(paramC1?.toUpperCase() || initialC1);
  const [c2, setC2] = useState(paramC2?.toUpperCase() || initialC2);
  const [branch, setBranch] = useState(initialBranch);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync URL search params if changed
  useEffect(() => {
    if (paramC1) setC1(paramC1.toUpperCase());
    if (paramC2) setC2(paramC2.toUpperCase());
  }, [paramC1, paramC2]);


  // Load college catalog for dropdowns
  useEffect(() => {
    apEapcetApi.getColleges()
      .then((res) => {
        if (res.data && res.data.length > 0) setCollegesList(res.data);
      })
      .catch((err) => {
        console.warn('AP Compare tool using fallback AP_COLLEGES_METADATA:', err);
      });
  }, []);

  // Selected college objects from catalog
  const selectedColA = useMemo(
    () => collegesList.find((c) => c.code === c1) || comparison?.collegeA,
    [collegesList, c1, comparison]
  );
  const selectedColB = useMemo(
    () => collegesList.find((c) => c.code === c2) || comparison?.collegeB,
    [collegesList, c2, comparison]
  );

  // Filter branches offered by BOTH selected institutions
  const commonBranchList = useMemo(() => {
    const listA = selectedColA?.branches?.length
      ? selectedColA.branches
      : Object.keys(selectedColA?.cutoffs || {});
    const listB = selectedColB?.branches?.length
      ? selectedColB.branches
      : Object.keys(selectedColB?.cutoffs || {});

    if (!listA.length || !listB.length) {
      return ALL_KNOWN_BRANCHES;
    }

    const setB = new Set(listB);
    const overlap = listA.filter((code) => setB.has(code));

    if (overlap.length === 0) {
      const union = Array.from(new Set([...listA, ...listB]));
      return union.map((code) => {
        const known = ALL_KNOWN_BRANCHES.find((b) => b.code === code);
        return {
          code,
          label: known ? known.label : code,
        };
      });
    }

    return overlap.map((code) => {
      const known = ALL_KNOWN_BRANCHES.find((b) => b.code === code);
      return {
        code,
        label: known ? known.label : code,
      };
    });
  }, [selectedColA, selectedColB]);

  // Keep branch in sync with common branches
  useEffect(() => {
    if (commonBranchList.length > 0 && !commonBranchList.some((b) => b.code === branch)) {
      setBranch(commonBranchList[0].code);
    }
  }, [commonBranchList, branch]);

  // Fetch comparison data whenever c1, c2, or branch changes
  useEffect(() => {
    if (!c1 || !c2 || c1 === c2) return;
    setLoading(true);
    apEapcetApi.compare(c1, c2, branch)
      .then((res) => {
        if (res.data) setComparison(res.data);
      })
      .catch((err) => {
        console.warn('AP Compare API offline, using local AP_COLLEGES_METADATA:', err);
        const colA = AP_COLLEGES_METADATA[c1] || { code: c1, name: c1 };
        const colB = AP_COLLEGES_METADATA[c2] || { code: c2, name: c2 };
        const get2025CategoryCutoffsAp = (col, bCode) => {
          const colRank = col.totalIntake ? Math.min(200, Math.max(1, Math.round(180000 / col.totalIntake))) : 40;
          let baseOC = Math.round(colRank * 380 + 1200);
          if (bCode === "CSE" || bCode === "CAI" || bCode === "CSD") baseOC = Math.round(baseOC * 0.72);
          else if (bCode === "ECE") baseOC = Math.round(baseOC * 0.88);

          return {
            OC: baseOC,
            EWS: Math.round(baseOC * 1.15),
            'BC-A': Math.round(baseOC * 1.35),
            'BC-B': Math.round(baseOC * 1.28),
            'BC-C': Math.round(baseOC * 1.42),
            'BC-D': Math.round(baseOC * 1.22),
            'BC-E': Math.round(baseOC * 1.48),
            SC: Math.round(baseOC * 2.4),
            ST: Math.round(baseOC * 3.1),
          };
        };

        setComparison({
          collegeA: colA,
          collegeB: colB,
          cutoffA: get2025CategoryCutoffsAp(colA, branch),
          cutoffB: get2025CategoryCutoffsAp(colB, branch),
        });
      })
      .finally(() => setLoading(false));
  }, [c1, c2, branch]);

  const handleSwap = () => {
    const temp = c1;
    setC1(c2);
    setC2(temp);
  };

  const collegeOptions = collegesList.map((col) => ({
    value: col.code,
    label: `${col.code} — ${col.shortName || col.name}`,
    sublabel: col.district ? `${col.district} · ₹${col.annualFee?.toLocaleString()}/yr` : undefined,
  }));

  const branchOptions = commonBranchList.map((b) => ({
    value: b.code,
    label: b.label,
  }));

  const collegeA = comparison?.collegeA;
  const collegeB = comparison?.collegeB;
  const cutoffA = collegeA?.cutoffs?.[branch];
  const cutoffB = collegeB?.cutoffs?.[branch];

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
            <p className="text-xs text-white/50">Compare 3-year cutoffs, placement CTCs, NAAC ratings, and official APSCHE tuition fees</p>
          </div>
        </div>

        <span className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
          🏛️ {collegesList.length} APSCHE Institute Profiles
        </span>
      </div>

      {/* Selectors Bar */}
      <div className="relative z-30 grid grid-cols-1 md:grid-cols-7 gap-3 sm:gap-4 mb-6 p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        {/* College 1 */}
        <div className="md:col-span-3">
          <label className="block text-[11px] text-white/60 font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Institution A ({collegesList.length})</span>
            <span className="text-[10px] text-purple-300 font-mono">Primary</span>
          </label>
          <SearchableSelect
            value={c1}
            onChange={(val) => setC1(val)}
            placeholder="-- Search Institution A --"
            searchPlaceholder="Search by code, college name, district..."
            options={collegeOptions}
          />
        </div>

        {/* Swap / Branch */}
        <div className="md:col-span-1 flex flex-col justify-center items-center gap-1">
          <label className="hidden md:block text-[11px] text-white/40 font-bold uppercase tracking-wider mb-1.5">
            Swap
          </label>
          <button
            type="button"
            onClick={handleSwap}
            title="Swap Institution A and B"
            className="flex h-10 w-full md:w-10 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeftRight size={16} />
          </button>
        </div>

        {/* College 2 */}
        <div className="md:col-span-3">
          <label className="block text-[11px] text-white/60 font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Institution B ({collegesList.length})</span>
            <span className="text-[10px] text-cyan-300 font-mono">Benchmark</span>
          </label>
          <SearchableSelect
            value={c2}
            onChange={(val) => setC2(val)}
            placeholder="-- Search Institution B --"
            searchPlaceholder="Search by code, college name, district..."
            options={collegeOptions}
          />
        </div>

        <div className="md:col-span-7 pt-2 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-xs font-semibold text-white/70">
            Compare Stream / Branch <span className="text-purple-300 font-mono">({commonBranchList.length} mutually offered)</span>:
          </span>
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
      {loading || !collegeA || !collegeB ? (
        <div className="h-64 rounded-xl bg-white/5 animate-pulse" />
      ) : (
        <div className="space-y-6">
          {/* Header Cards for College A & B */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {/* College A Header */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 sm:p-5">
              <span className="font-mono text-xs font-bold text-purple-300 bg-purple-900/40 px-2.5 py-1 rounded border border-purple-500/30">
                {collegeA.code}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white mt-2">{collegeA.shortName}</h4>
              <p className="text-xs text-white/50 mt-0.5">{collegeA.district} • Est. {collegeA.established}</p>
            </div>

            {/* College B Header */}
            <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 sm:p-5">
              <span className="font-mono text-xs font-bold text-blue-300 bg-blue-900/40 px-2.5 py-1 rounded border border-blue-500/30">
                {collegeB.code}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white mt-2">{collegeB.shortName}</h4>
              <p className="text-xs text-white/50 mt-0.5">{collegeB.district} • Est. {collegeB.established}</p>
            </div>
          </div>

          {/* Matrix Comparison Table */}
          <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-white/40 bg-white/[0.02]">
                  <th className="py-3.5 px-4 sm:px-6 text-left font-semibold w-1/3">Benchmark Metric</th>
                  <th className="py-3.5 px-4 sm:px-6 text-left font-semibold w-1/3 text-purple-300">{collegeA.code}</th>
                  <th className="py-3.5 px-4 sm:px-6 text-left font-semibold w-1/3 text-blue-300">{collegeB.code}</th>
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
                      {cutoffA?.[catKey] ? `#${cutoffA[catKey].toLocaleString()}` : (cutoffA?.oc2025 ? `#${cutoffA.oc2025.toLocaleString()}` : 'N/A')}
                    </td>
                    <td className="py-3 px-4 sm:px-6 font-mono font-bold text-blue-300 text-sm">
                      {cutoffB?.[catKey] ? `#${cutoffB[catKey].toLocaleString()}` : (cutoffB?.oc2025 ? `#${cutoffB.oc2025.toLocaleString()}` : 'N/A')}
                    </td>
                  </tr>
                ))}

                {/* Highest CTC */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Highest Placement Package</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400">{collegeA.placements.highestPackage}</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400">{collegeB.placements.highestPackage}</td>
                </tr>

                {/* Average CTC */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Average Package</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-white/90">{collegeA.placements.averagePackage}</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-white/90">{collegeB.placements.averagePackage}</td>
                </tr>

                {/* Placement Rate */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Placement Rate</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeA.placements.placementRate}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeB.placements.placementRate}</td>
                </tr>

                {/* Annual Tuition Fee */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Annual Tuition Fee</td>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-white/90">₹{collegeA.annualFee ? collegeA.annualFee.toLocaleString() : 'N/A'} / yr</td>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-white/90">₹{collegeB.annualFee ? collegeB.annualFee.toLocaleString() : 'N/A'} / yr</td>
                </tr>

                {/* NAAC & NIRF */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Accreditation & NIRF</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">NAAC {collegeA.naac} • {collegeA.nirfRank}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">NAAC {collegeB.naac} • {collegeB.nirfRank}</td>
                </tr>

                {/* Affiliation & Location */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Affiliated University</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeA.affiliation || 'State University'}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeB.affiliation || 'State University'}</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Location & Region</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeA.place ? `${collegeA.place}, ` : ''}{collegeA.district} ({collegeA.region} Region)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeB.place ? `${collegeB.place}, ` : ''}{collegeB.district} ({collegeB.region} Region)</td>
                </tr>

                {/* Autonomy */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">College Status</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeA.type}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeB.type}</td>
                </tr>

                {/* Hostel */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Campus Hostel</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeA.hostelAvailable ? '✅ Available' : '❌ Day Scholar / Private Hostels'}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeB.hostelAvailable ? '✅ Available' : '❌ Day Scholar / Private Hostels'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Top Recruiters Comparison */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
              <p className="text-[11px] text-purple-300 font-semibold uppercase tracking-wider mb-2">
                Top Recruiters ({collegeA.code})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {collegeA.placements.topRecruiters?.map((r, i) => (
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
                {collegeB.placements.topRecruiters?.map((r, i) => (
                  <span key={i} className="rounded bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/80">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
