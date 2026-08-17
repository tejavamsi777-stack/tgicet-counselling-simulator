import { useState, useEffect } from 'react';
import { ArrowLeftRight, Award, CheckCircle2, DollarSign, GraduationCap, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { icetApi } from '../../lib/icetApi';
import { ICET_INSTITUTIONS, ICET_PROGRAMS } from '../../data/icetInstitutions';

export default function CollegeComparisonTool({ initialC1 = 'OUCC', initialC2 = 'CBIT', initialProgram = 'MBA' }) {
  const [collegesList, setCollegesList] = useState(ICET_INSTITUTIONS);
  const [c1, setC1] = useState(initialC1);
  const [c2, setC2] = useState(initialC2);
  const [program, setProgram] = useState(initialProgram);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load college catalog
  useEffect(() => {
    icetApi.getColleges({ program })
      .then((res) => {
        if (res.data?.colleges) setCollegesList(res.data.colleges);
      })
      .catch(console.error);
  }, [program]);

  // Fetch comparison data
  useEffect(() => {
    if (!c1 || !c2 || c1 === c2) return;
    setLoading(true);
    icetApi.compare(c1, c2, program)
      .then((res) => {
        if (res.data) setComparison(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [c1, c2, program]);

  const collegeA = comparison?.collegeA || ICET_INSTITUTIONS.find(c => c.code === c1);
  const collegeB = comparison?.collegeB || ICET_INSTITUTIONS.find(c => c.code === c2);
  const cutoffA = collegeA?.targetCutoffs || collegeA?.cutoffs?.[program];
  const cutoffB = collegeB?.targetCutoffs || collegeB?.cutoffs?.[program];

  const avgPackageA = collegeA?.placements?.averagePackage || `₹${collegeA?.averagePlacementLpa || 0} LPA`;
  const avgPackageB = collegeB?.placements?.averagePackage || `₹${collegeB?.averagePlacementLpa || 0} LPA`;
  const highPackageA = collegeA?.placements?.highestPackage || `₹${collegeA?.highestPlacementLpa || 0} LPA`;
  const highPackageB = collegeB?.placements?.highestPackage || `₹${collegeB?.highestPlacementLpa || 0} LPA`;
  const feeA = collegeA?.annualFee || collegeA?.tuitionFeePerYear || 0;
  const feeB = collegeB?.annualFee || collegeB?.tuitionFeePerYear || 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300">
          <ArrowLeftRight size={16} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Side-by-Side MBA &amp; MCA Comparison Matrix</h3>
          <p className="text-xs text-white/50">Compare 4-year cutoffs, placement CTCs, NAAC ratings, and tuition fees</p>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 sm:p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
        {/* College 1 */}
        <div>
          <label className="block text-[11px] text-white/50 font-semibold uppercase tracking-wider mb-1.5">
            Institution A
          </label>
          <select
            value={c1}
            onChange={(e) => setC1(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/80 p-2.5 text-xs font-semibold text-white focus:border-purple-500 focus:outline-none"
          >
            {ICET_INSTITUTIONS.map((col) => (
              <option key={col.code} value={col.code} disabled={col.code === c2} className="bg-neutral-900 text-white">
                {col.code} — {col.shortName || col.name}
              </option>
            ))}
          </select>
        </div>

        {/* Program */}
        <div>
          <label className="block text-[11px] text-white/50 font-semibold uppercase tracking-wider mb-1.5">
            Select Programme
          </label>
          <select
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            className="w-full rounded-lg border border-purple-500/30 bg-purple-950/30 p-2.5 text-xs font-semibold text-purple-200 focus:border-purple-500 focus:outline-none"
          >
            {ICET_PROGRAMS.map((p) => (
              <option key={p.code} value={p.code} className="bg-neutral-900 text-white">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* College 2 */}
        <div>
          <label className="block text-[11px] text-white/50 font-semibold uppercase tracking-wider mb-1.5">
            Institution B
          </label>
          <select
            value={c2}
            onChange={(e) => setC2(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/80 p-2.5 text-xs font-semibold text-white focus:border-purple-500 focus:outline-none"
          >
            {ICET_INSTITUTIONS.map((col) => (
              <option key={col.code} value={col.code} disabled={col.code === c1} className="bg-neutral-900 text-white">
                {col.code} — {col.shortName || col.name}
              </option>
            ))}
          </select>
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
                {/* 2025 Final Cutoff Rank */}
                <tr className="hover:bg-white/[0.02] bg-purple-950/10">
                  <td className="py-3.5 px-4 sm:px-6 text-white font-semibold">
                    <span>2025 Final Cutoff ({program} OC)</span>
                    <span className="ml-2 rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-[10px] text-purple-300 font-bold">Latest</span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-purple-300 text-sm">
                    {cutoffA?.oc2025 ? `~${cutoffA.oc2025.toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-blue-300 text-sm">
                    {cutoffB?.oc2025 ? `~${cutoffB.oc2025.toLocaleString()}` : 'N/A'}
                  </td>
                </tr>

                {/* 2024 Cutoff Rank */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">2024 OC Cutoff ({program})</td>
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-medium text-white/90">
                    {cutoffA?.oc2024 ? `~${cutoffA.oc2024.toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-medium text-white/90">
                    {cutoffB?.oc2024 ? `~${cutoffB.oc2024.toLocaleString()}` : 'N/A'}
                  </td>
                </tr>

                {/* 2023 Cutoff Rank */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">2023 OC Cutoff ({program})</td>
                  <td className="py-3.5 px-4 sm:px-6 font-mono text-white/80">{cutoffA?.oc2023?.toLocaleString() || 'N/A'}</td>
                  <td className="py-3.5 px-4 sm:px-6 font-mono text-white/80">{cutoffB?.oc2023?.toLocaleString() || 'N/A'}</td>
                </tr>

                {/* 2022 Cutoff Rank */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">2022 OC Cutoff ({program})</td>
                  <td className="py-3.5 px-4 sm:px-6 font-mono text-white/60">{cutoffA?.oc2022?.toLocaleString() || 'N/A'}</td>
                  <td className="py-3.5 px-4 sm:px-6 font-mono text-white/60">{cutoffB?.oc2022?.toLocaleString() || 'N/A'}</td>
                </tr>

                {/* Highest CTC */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Highest Placement Package</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400">{highPackageA}</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400">{highPackageB}</td>
                </tr>

                {/* Average CTC */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Average Package</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-white/90">{avgPackageA}</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-white/90">{avgPackageB}</td>
                </tr>

                {/* Placement Rate */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Placement Rate</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeA.placements?.placementRate || '90%+'}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeB.placements?.placementRate || '90%+'}</td>
                </tr>

                {/* Annual Tuition Fee */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Annual Tuition Fee</td>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-white/90">₹{Number(feeA).toLocaleString()} / yr</td>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-white/90">₹{Number(feeB).toLocaleString()} / yr</td>
                </tr>

                {/* NAAC & NIRF */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Accreditation Grade</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">NAAC {collegeA.naac || collegeA.naacGrade || 'A'} • {collegeA.nirfRank ? `NIRF #${collegeA.nirfRank}` : (collegeA.university || 'Affiliated')}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">NAAC {collegeB.naac || collegeB.naacGrade || 'A'} • {collegeB.nirfRank ? `NIRF #${collegeB.nirfRank}` : (collegeB.university || 'Affiliated')}</td>
                </tr>

                {/* Status & Affiliation */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 sm:px-6 text-white/70 font-medium">Affiliation &amp; Status</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeA.university || collegeA.affiliation || 'OU'} ({collegeA.type})</td>
                  <td className="py-3.5 px-4 sm:px-6 text-white/80">{collegeB.university || collegeB.affiliation || 'OU'} ({collegeB.type})</td>
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
          </div>
        </div>
      )}
    </div>
  );
}
