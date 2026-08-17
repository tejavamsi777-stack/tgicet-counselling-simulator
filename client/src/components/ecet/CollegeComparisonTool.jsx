import { useState, useEffect } from 'react';
import { ArrowLeftRight, Award, CheckCircle2, DollarSign, GraduationCap, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { ecetApi } from '../../lib/ecetApi';
import { ECET_INSTITUTIONS } from '../../data/ecetInstitutions';

const BRANCHES = [
  { code: 'CSE', label: 'Computer Science (CSE)' },
  { code: 'CSM', label: 'CSE (AI & ML)' },
  { code: 'CSD', label: 'CSE (Data Science)' },
  { code: 'INF', label: 'Information Tech (IT)' },
  { code: 'ECE', label: 'Electronics & Comm (ECE)' },
  { code: 'EEE', label: 'Electrical & Electronics (EEE)' },
  { code: 'MEC', label: 'Mechanical (MEC)' },
  { code: 'CIV', label: 'Civil (CIV)' },
];

export default function CollegeComparisonTool({ initialC1 = 'CBIT', initialC2 = 'VASV', initialBranch = 'CSE' }) {
  const [collegesList, setCollegesList] = useState(ECET_INSTITUTIONS);
  const [c1, setC1] = useState(initialC1);
  const [c2, setC2] = useState(initialC2);
  const [branch, setBranch] = useState(initialBranch);
  const [comparison, setComparison] = useState(() => {
    const collegeA = ECET_INSTITUTIONS.find((i) => i.code === initialC1) || ECET_INSTITUTIONS[0];
    const collegeB = ECET_INSTITUTIONS.find((i) => i.code === initialC2) || ECET_INSTITUTIONS[1];
    return { collegeA, collegeB, branch: initialBranch };
  });
  const [loading, setLoading] = useState(false);

  // Load college catalog for dropdowns
  useEffect(() => {
    ecetApi
      .getColleges()
      .then((res) => {
        const list = res?.data || (Array.isArray(res) ? res : []);
        if (list.length > 0) setCollegesList(list);
      })
      .catch(console.error);
  }, []);

  // Fetch comparison data whenever c1, c2, or branch changes
  useEffect(() => {
    if (!c1 || !c2) return;
    const localA = collegesList.find((i) => i.code === c1) || ECET_INSTITUTIONS.find((i) => i.code === c1);
    const localB = collegesList.find((i) => i.code === c2) || ECET_INSTITUTIONS.find((i) => i.code === c2);
    if (localA && localB) {
      setComparison({ collegeA: localA, collegeB: localB, branch });
    }

    ecetApi
      .compareColleges(c1, c2, branch)
      .then((res) => {
        if (res?.data?.collegeA && res?.data?.collegeB) {
          setComparison(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [c1, c2, branch, collegesList]);

  const collegeA = comparison?.collegeA;
  const collegeB = comparison?.collegeB;
  const cutoffA = collegeA?.cutoffs?.[branch];
  const cutoffB = collegeB?.cutoffs?.[branch];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300">
          <ArrowLeftRight size={16} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Side-by-Side College Comparison Matrix</h3>
          <p className="text-xs text-white/50">Compare lateral entry cutoffs, placement CTCs, affiliations, and tuition fees</p>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
        {/* College A Dropdown */}
        <div>
          <label className="text-xs font-semibold text-white/50 block mb-1.5">First College</label>
          <select
            value={c1}
            onChange={(e) => setC1(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            {collegesList.map((c) => (
              <option key={c.code} value={c.code} className="bg-gray-900 text-white">
                {c.code} - {c.shortName || c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Branch Dropdown (Center) */}
        <div>
          <label className="text-xs font-semibold text-purple-300 block mb-1.5">Lateral Entry Branch</label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full bg-purple-950/30 border border-purple-500/30 rounded-lg px-3 py-2 text-xs font-bold text-purple-200 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            {BRANCHES.map((b) => (
              <option key={b.code} value={b.code} className="bg-gray-900 text-white">
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {/* College B Dropdown */}
        <div>
          <label className="text-xs font-semibold text-white/50 block mb-1.5">Second College</label>
          <select
            value={c2}
            onChange={(e) => setC2(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            {collegesList.map((c) => (
              <option key={c.code} value={c.code} className="bg-gray-900 text-white">
                {c.code} - {c.shortName || c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side by Side Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-72 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-72 rounded-xl bg-white/5 animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A */}
          {collegeA && (
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/10 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-md bg-purple-500/20 border border-purple-500/30 px-2.5 py-1 font-mono text-xs font-bold text-purple-300">
                    {collegeA.code}
                  </span>
                  <span className="text-xs text-white/50">{collegeA.type}</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-1">{collegeA.name}</h4>
                <p className="text-xs text-white/40 flex items-center gap-1 mb-4">
                  <MapPin size={12} className="text-purple-400" />
                  {collegeA.place}, {collegeA.district} ({collegeA.region} Region)
                </p>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="rounded-lg bg-white/5 p-3">
                    <span className="text-[10px] text-white/40 uppercase font-semibold block">Tuition Fee/Year</span>
                    <span className="font-mono text-base font-bold text-cyan-300">
                      ₹{collegeA.annualFee?.toLocaleString()}/yr
                    </span>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <span className="text-[10px] text-white/40 uppercase font-semibold block">Max Placement Package</span>
                    <span className="font-mono text-base font-bold text-emerald-400">
                      {collegeA.placements?.highestPackage || '—'}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3.5 space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-white/70">
                    {branch} 2025 Lateral Cutoff Ranks
                  </h5>
                  {cutoffA ? (
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[10px] text-white/40 block">OC</span>
                        <span className="font-bold text-white">#{cutoffA.oc2025 || cutoffA.oc2024 || '—'}</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[10px] text-white/40 block">BC-B</span>
                        <span className="font-bold text-amber-300">#{cutoffA.bcb2025 || '—'}</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[10px] text-white/40 block">SC</span>
                        <span className="font-bold text-purple-300">#{cutoffA.sc2025 || '—'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-white/40">Branch not offered or cutoffs pending.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Card B */}
          {collegeB && (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-md bg-white/10 border border-white/15 px-2.5 py-1 font-mono text-xs font-bold text-white/80">
                    {collegeB.code}
                  </span>
                  <span className="text-xs text-white/50">{collegeB.type}</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-1">{collegeB.name}</h4>
                <p className="text-xs text-white/40 flex items-center gap-1 mb-4">
                  <MapPin size={12} className="text-purple-400" />
                  {collegeB.place}, {collegeB.district} ({collegeB.region} Region)
                </p>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="rounded-lg bg-white/5 p-3">
                    <span className="text-[10px] text-white/40 uppercase font-semibold block">Tuition Fee/Year</span>
                    <span className="font-mono text-base font-bold text-cyan-300">
                      ₹{collegeB.annualFee?.toLocaleString()}/yr
                    </span>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <span className="text-[10px] text-white/40 uppercase font-semibold block">Max Placement Package</span>
                    <span className="font-mono text-base font-bold text-emerald-400">
                      {collegeB.placements?.highestPackage || '—'}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3.5 space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-white/70">
                    {branch} 2025 Lateral Cutoff Ranks
                  </h5>
                  {cutoffB ? (
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[10px] text-white/40 block">OC</span>
                        <span className="font-bold text-white">#{cutoffB.oc2025 || cutoffB.oc2024 || '—'}</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[10px] text-white/40 block">BC-B</span>
                        <span className="font-bold text-amber-300">#{cutoffB.bcb2025 || '—'}</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[10px] text-white/40 block">SC</span>
                        <span className="font-bold text-purple-300">#{cutoffB.sc2025 || '—'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-white/40">Branch not offered or cutoffs pending.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
