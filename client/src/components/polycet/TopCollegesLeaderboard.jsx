import { useState } from 'react';
import { Award, Building, ExternalLink, MapPin, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const TOP_POLYTECHNICS = [
  {
    rank: 1,
    code: 'MASB',
    name: 'Government Polytechnic, Masab Tank',
    place: 'Masab Tank, Hyderabad',
    district: 'Hyderabad',
    type: 'Government',
    annualFee: 3800,
    cmeCutoff: 1885,
    eceCutoff: 3420,
    totalAllotted: 732,
    hostel: 'Available',
    estd: 1923,
    badge: 'Premier Flagship',
  },
  {
    rank: 2,
    code: 'JNGP',
    name: 'Jawaharlal Nehru Govt Polytechnic, Ramanthapur',
    place: 'Ramanthapur, Hyderabad',
    district: 'Medchal-Malkajgiri',
    type: 'Government',
    annualFee: 3800,
    cmeCutoff: 2450,
    eceCutoff: 4100,
    totalAllotted: 680,
    hostel: 'Available',
    estd: 1957,
    badge: 'High Placement',
  },
  {
    rank: 3,
    code: 'IOES',
    name: 'Government Institute of Electronics (GIOE)',
    place: 'East Marredpally, Secunderabad',
    district: 'Hyderabad',
    type: 'Government Special',
    annualFee: 3800,
    cmeCutoff: 3100,
    eceCutoff: 3950,
    totalAllotted: 613,
    hostel: 'Available',
    estd: 1968,
    badge: 'Specialized Tech',
  },
  {
    rank: 4,
    code: 'GPWS',
    name: 'Government Polytechnic for Women, Secunderabad',
    place: 'Secunderabad',
    district: 'Hyderabad',
    type: 'Govt (Women)',
    annualFee: 3800,
    cmeCutoff: 4200,
    eceCutoff: 5800,
    totalAllotted: 339,
    hostel: 'Available',
    estd: 1962,
    badge: 'Top Women Inst.',
  },
  {
    rank: 5,
    code: 'WRGL',
    name: 'Government Polytechnic, Warangal',
    place: 'Warangal',
    district: 'Warangal Urban',
    type: 'Government',
    annualFee: 3800,
    cmeCutoff: 4900,
    eceCutoff: 6500,
    totalAllotted: 588,
    hostel: 'Available',
    estd: 1955,
    badge: 'Regional Hub',
  },
  {
    rank: 6,
    code: 'NZBD',
    name: 'Government Polytechnic, Nizamabad',
    place: 'Nizamabad',
    district: 'Nizamabad',
    type: 'Government',
    annualFee: 3800,
    cmeCutoff: 5300,
    eceCutoff: 7100,
    totalAllotted: 615,
    hostel: 'Available',
    estd: 1959,
    badge: 'North TG Lead',
  },
  {
    rank: 7,
    code: 'MBNR',
    name: 'Government Polytechnic, Mahabubnagar',
    place: 'Mahabubnagar',
    district: 'Mahabubnagar',
    type: 'Government',
    annualFee: 3800,
    cmeCutoff: 5800,
    eceCutoff: 7900,
    totalAllotted: 562,
    hostel: 'Available',
    estd: 1960,
    badge: 'South TG Lead',
  },
];

export default function TopCollegesLeaderboard() {
  const [selectedBranch, setSelectedBranch] = useState('CME');

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-black/40 p-6 sm:p-8 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Award size={18} className="text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Top Government Polytechnic Institutions Leaderboard
            </h2>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Ranked by candidate admission demand, faculty strength, and closing cutoff benchmarks
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['CME', 'ECE'].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBranch(b)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedBranch === b
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {b === 'CME' ? 'Computer Engg (CME)' : 'Electronics (ECE)'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.04] text-white/50 uppercase font-bold tracking-wider text-[11px]">
              <th className="py-3.5 px-4 text-center">Rank</th>
              <th className="py-3.5 px-4">Code</th>
              <th className="py-3.5 px-4">Polytechnic Institution</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Govt Fee</th>
              <th className="py-3.5 px-4 font-mono">
                {selectedBranch === 'CME' ? 'CME Closing Rank' : 'ECE Closing Rank'}
              </th>
              <th className="py-3.5 px-4">Total Allotted</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-white/80 font-medium">
            {TOP_POLYTECHNICS.map((poly) => (
              <tr key={poly.code} className="hover:bg-white/[0.03] transition-colors">
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 font-bold font-mono text-xs">
                    #{poly.rank}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-purple-300">{poly.code}</td>
                <td className="py-3.5 px-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{poly.name}</span>
                      <span className="rounded-md border border-amber-400/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                        {poly.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40">{poly.place} • Estd {poly.estd}</p>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-white/60">{poly.type}</span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                  ₹{poly.annualFee.toLocaleString()} / yr
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                  #{selectedBranch === 'CME' ? poly.cmeCutoff.toLocaleString() : poly.eceCutoff.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 font-mono text-white/70">
                  {poly.totalAllotted} candidates
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    to={`/tg-polycet/allotments?college=${poly.code}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <span>Allotments</span>
                    <ExternalLink size={11} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
