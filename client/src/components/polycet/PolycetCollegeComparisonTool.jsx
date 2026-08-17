import { useState, useEffect } from 'react';
import { ArrowLeftRight, CheckCircle2, DollarSign, GraduationCap, MapPin, Sparkles, Building2, Phone, Mail } from 'lucide-react';
import { polycetApi } from '../../lib/polycetApi';
import { POLYCET_INSTITUTIONS, POLYCET_BRANCHES } from '../../data/polycetInstitutions';

export default function PolycetCollegeComparisonTool({
  initialC1 = 'MASB',
  initialC2 = 'JNGP',
  initialBranch = 'CME',
}) {
  const [collegesList] = useState(POLYCET_INSTITUTIONS);
  const [c1, setC1] = useState(initialC1);
  const [c2, setC2] = useState(initialC2);
  const [branch, setBranch] = useState(initialBranch);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch comparison data
  useEffect(() => {
    if (!c1 || !c2) return;
    setLoading(true);
    polycetApi
      .compare(c1, c2, branch)
      .then((res) => {
        if (res.data?.success) setComparison(res.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [c1, c2, branch]);

  const collegeA = comparison?.collegeA || collegesList.find((c) => c.code === c1) || collegesList[0];
  const collegeB = comparison?.collegeB || collegesList.find((c) => c.code === c2) || collegesList[1];

  const courseA = collegeA?.courses?.find((c) => c.branchCode.toUpperCase() === branch.toUpperCase());
  const courseB = collegeB?.courses?.find((c) => c.branchCode.toUpperCase() === branch.toUpperCase());

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300">
          <ArrowLeftRight size={16} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Side-by-Side Polytechnic Comparison Matrix</h3>
          <p className="text-xs text-white/50">
            Compare government-regulated fees, diploma streams, seat intakes, and campus facilities across 114 polytechnic institutions
          </p>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* College 1 */}
        <div>
          <label className="text-xs font-semibold text-white/60 mb-1.5 block">First Polytechnic</label>
          <select
            value={c1}
            onChange={(e) => setC1(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs sm:text-sm text-white focus:border-purple-500 focus:bg-purple-950/20 focus:outline-none cursor-pointer"
          >
            {collegesList.map((c) => (
              <option key={c.code} value={c.code} className="bg-gray-900 text-white">
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Branch (In the Middle) */}
        <div>
          <label className="text-xs font-semibold text-white/60 mb-1.5 block">Diploma Branch</label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full rounded-xl border border-purple-500/30 bg-purple-950/30 px-3 py-2.5 text-xs sm:text-sm text-purple-200 focus:border-purple-500 focus:outline-none cursor-pointer"
          >
            {POLYCET_BRANCHES.map((b) => (
              <option key={b.code} value={b.code} className="bg-gray-900 text-white">
                {b.code} — {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* College 2 */}
        <div>
          <label className="text-xs font-semibold text-white/60 mb-1.5 block">Second Polytechnic</label>
          <select
            value={c2}
            onChange={(e) => setC2(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs sm:text-sm text-white focus:border-purple-500 focus:bg-purple-950/20 focus:outline-none cursor-pointer"
          >
            {collegesList.map((c) => (
              <option key={c.code} value={c.code} className="bg-gray-900 text-white">
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-white/40">
          <Sparkles className="mx-auto h-6 w-6 animate-spin text-purple-400 mb-2" />
          <p className="text-sm">Loading verified polytechnic parameters...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/15 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="rounded-lg border border-purple-400/40 bg-purple-500/20 px-2.5 py-1 text-xs font-mono font-bold text-purple-200">
                  {collegeA.code}
                </span>
                <span className="text-[11px] font-semibold text-purple-300">{collegeA.type}</span>
              </div>
              <h4 className="text-base font-bold text-white leading-snug">{collegeA.name}</h4>
              <p className="text-xs text-white/50 mt-1 flex items-center gap-1">
                <MapPin size={13} className="text-purple-400 shrink-0" />
                {collegeA.place}, {collegeA.district} ({collegeA.region} Region)
              </p>

              <div className="mt-5 space-y-3 pt-4 border-t border-white/10 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Annual Tuition Fee</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    ₹{collegeA.annualFee?.toLocaleString()} / yr
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Hostel Facility</span>
                  <span className={`font-semibold ${collegeA.hostelAvailable ? 'text-cyan-300' : 'text-white/40'}`}>
                    {collegeA.hostelAvailable ? 'Available on Campus' : 'No / External'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Affiliation</span>
                  <span className="text-white/80 font-medium">{collegeA.affiliation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">{branch} Intake</span>
                  <span className="font-mono font-bold text-white">
                    {courseA ? `${courseA.intake} Seats` : 'Not Offered'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 text-[11px] text-white/50 space-y-1">
              {collegeA.phone && <p className="flex items-center gap-1"><Phone size={11} /> {collegeA.phone}</p>}
              {collegeA.email && <p className="flex items-center gap-1"><Mail size={11} /> {collegeA.email}</p>}
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/15 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="rounded-lg border border-indigo-400/40 bg-indigo-500/20 px-2.5 py-1 text-xs font-mono font-bold text-indigo-200">
                  {collegeB.code}
                </span>
                <span className="text-[11px] font-semibold text-indigo-300">{collegeB.type}</span>
              </div>
              <h4 className="text-base font-bold text-white leading-snug">{collegeB.name}</h4>
              <p className="text-xs text-white/50 mt-1 flex items-center gap-1">
                <MapPin size={13} className="text-indigo-400 shrink-0" />
                {collegeB.place}, {collegeB.district} ({collegeB.region} Region)
              </p>

              <div className="mt-5 space-y-3 pt-4 border-t border-white/10 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Annual Tuition Fee</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    ₹{collegeB.annualFee?.toLocaleString()} / yr
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Hostel Facility</span>
                  <span className={`font-semibold ${collegeB.hostelAvailable ? 'text-cyan-300' : 'text-white/40'}`}>
                    {collegeB.hostelAvailable ? 'Available on Campus' : 'No / External'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Affiliation</span>
                  <span className="text-white/80 font-medium">{collegeB.affiliation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">{branch} Intake</span>
                  <span className="font-mono font-bold text-white">
                    {courseB ? `${courseB.intake} Seats` : 'Not Offered'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 text-[11px] text-white/50 space-y-1">
              {collegeB.phone && <p className="flex items-center gap-1"><Phone size={11} /> {collegeB.phone}</p>}
              {collegeB.email && <p className="flex items-center gap-1"><Mail size={11} /> {collegeB.email}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
