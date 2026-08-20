import { Award, ExternalLink, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

// Real 2026 TG PGECET allotment data (crawled from pgecetadm.tgche.ac.in)
const TOP_PG_COLLEGES = [
  {
    rank: 1,
    code: 'JNTH',
    collegeCode: 'JNTH',
    name: 'JNTUH University College of Engineering, Hyderabad',
    place: 'Kukatpally, Hyderabad',
    type: 'University Autonomous',
    affiliation: 'JNTUH',
    topCourses: ['Computer Science & Engg', 'Cyber Security', 'Power Electronics', 'VLSI Design'],
    openRank: 1,
    closeRank: 6135,
    totalAllotted: 258,
    gateAllotted: 113,
    naac: 'A++',
    nirf: 51,
  },
  {
    rank: 2,
    code: 'OUCE',
    collegeCode: 'OUCE',
    name: 'University College of Engineering, Osmania University',
    place: 'Amberpet, Hyderabad',
    type: 'University Autonomous',
    affiliation: 'Osmania University',
    topCourses: ['Artificial Intelligence & DS', 'Structural Engineering', 'Embedded Systems', 'CAD/CAM'],
    openRank: 1,
    closeRank: 4126,
    totalAllotted: 202,
    gateAllotted: 88,
    naac: 'A+',
    nirf: 76,
  },
  {
    rank: 3,
    code: 'VJEC',
    collegeCode: 'VJEC',
    name: 'VNR Vignana Jyothi Institute of Engineering & Technology',
    place: 'Bachupally, Hyderabad',
    type: 'Autonomous Private',
    affiliation: 'JNTUH',
    topCourses: ['VLSI System Design', 'AI & Data Science', 'Computer Networks & Info Security', 'Highway Engg'],
    openRank: 1,
    closeRank: 4423,
    totalAllotted: 103,
    gateAllotted: 10,
    naac: 'A+',
    nirf: null,
  },
  {
    rank: 4,
    code: 'CBIT',
    collegeCode: 'CBIT',
    name: 'Chaitanya Bharathi Institute of Technology',
    place: 'Gandipet, Hyderabad',
    type: 'Autonomous Private',
    affiliation: 'Osmania University',
    topCourses: ['AI & Data Science', 'Embedded Systems & VLSI', 'CAD/CAM', 'Power Systems / Power Electronics'],
    openRank: 7,
    closeRank: 2920,
    totalAllotted: 81,
    gateAllotted: 13,
    naac: 'A+',
    nirf: 87,
  },
  {
    rank: 5,
    code: 'IARE',
    collegeCode: 'IARE',
    name: 'Institute of Aeronautical Engineering',
    place: 'Dundigal, Hyderabad',
    type: 'Autonomous Private',
    affiliation: 'JNTUH',
    topCourses: ['Computer Science & Engg', 'Embedded Systems', 'Structural Engineering'],
    openRank: 2,
    closeRank: 1211,
    totalAllotted: 21,
    gateAllotted: 1,
    naac: 'A',
    nirf: null,
  },
  {
    rank: 6,
    code: 'MUFK',
    collegeCode: 'MUFK',
    name: 'Muffakham Jah College of Engineering and Technology',
    place: 'Banjara Hills, Hyderabad',
    type: 'Autonomous Private',
    affiliation: 'Osmania University',
    topCourses: ['Computer Science & Engg', 'Power Electronics', 'Communication Systems'],
    openRank: 4,
    closeRank: 990,
    totalAllotted: 42,
    gateAllotted: 0,
    naac: 'A',
    nirf: null,
  },
  {
    rank: 7,
    code: 'GRRR',
    collegeCode: 'GRRR',
    name: 'Gokaraju Rangaraju Institute of Engineering & Technology',
    place: 'Bachupally, Hyderabad',
    type: 'Autonomous Private',
    affiliation: 'JNTUH',
    topCourses: ['Computer Science & Engg', 'Structural Engineering'],
    openRank: 9,
    closeRank: 3200,
    totalAllotted: 30,
    gateAllotted: 0,
    naac: 'A+',
    nirf: null,
  },
  {
    rank: 8,
    code: 'BVRT',
    collegeCode: 'BVRT',
    name: 'B.V. Raju Institute of Technology',
    place: 'Narsapur, Medak',
    type: 'Autonomous Private',
    affiliation: 'JNTUH',
    topCourses: ['Computer Science & Engg', 'Data Sciences', 'VLSI Design', 'Embedded Systems'],
    openRank: 12,
    closeRank: 4419,
    totalAllotted: 61,
    gateAllotted: 0,
    naac: 'A',
    nirf: null,
  },
];

function RankBadge({ n }) {
  const gold   = n === 1 ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-300' : '';
  const silver = n === 2 ? 'bg-slate-300/20 border-slate-300/40 text-slate-300' : '';
  const bronze = n === 3 ? 'bg-orange-400/20 border-orange-400/40 text-orange-300' : '';
  const def    = n > 3  ? 'bg-purple-500/20 border-purple-400/30 text-purple-300' : '';
  return (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold font-mono ${gold || silver || bronze || def}`}>
      #{n}
    </span>
  );
}

export default function TopCollegesLeaderboard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#120a22]/90 via-[#180f2d]/90 to-[#0c0616]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-400">
            <Award size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Top PG Colleges — TG PGECET 2026</h3>
            <p className="text-xs text-white/50">
              Real cutoffs from official 2026 allotment data · Ranked by demand &amp; opening rank
            </p>
          </div>
        </div>
        <Link
          to="/tg-pgecet/allotments"
          className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition"
        >
          <ExternalLink size={12} />
          View Allotments
        </Link>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-white/40">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-400 inline-block" /> Opening / Closing PGECET Rank</span>
        <span className="flex items-center gap-1"><Star size={11} className="text-amber-400" /> GATE/GPAT allotted</span>
        <span className="flex items-center gap-1"><Zap size={11} className="text-purple-400" /> Total candidates allotted</span>
      </div>

      {/* College cards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {TOP_PG_COLLEGES.map((col) => (
          <Link
            key={col.code}
            to={`/tg-pgecet/allotments`}
            className="group flex items-start justify-between gap-3 rounded-2xl border border-white/[0.08] bg-black/40 p-4 hover:border-purple-500/40 hover:bg-white/[0.03] transition cursor-pointer"
          >
            <div className="flex items-start gap-3 min-w-0">
              <RankBadge n={col.rank} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-cyan-300">{col.code}</span>
                  <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50">{col.type}</span>
                  {col.naac && (
                    <span className="rounded bg-green-500/10 border border-green-500/30 px-1.5 py-0.5 text-[10px] font-bold text-green-400">
                      NAAC {col.naac}
                    </span>
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-white mt-1 leading-snug">{col.name}</h4>
                <p className="text-[10px] text-white/40 mt-0.5">{col.place} · {col.affiliation}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {col.topCourses.slice(0, 3).map((c) => (
                    <span key={c} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-purple-200">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="text-right shrink-0 space-y-1.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-white/30 block">Open / Close Rank</span>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  #{col.openRank} – #{col.closeRank}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/30 block">Allotted</span>
                <span className="font-mono text-xs text-white/70">
                  <Zap size={10} className="inline text-purple-400 mr-0.5" />{col.totalAllotted}
                  {col.gateAllotted > 0 && (
                    <span className="ml-1.5 text-amber-400"><Star size={10} className="inline mr-0.5" />{col.gateAllotted} GATE</span>
                  )}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] text-white/30">
        Data sourced directly from <span className="text-purple-300">pgecetadm.tgche.ac.in</span> · 2026 Phase I allotments
      </p>
    </div>
  );
}



