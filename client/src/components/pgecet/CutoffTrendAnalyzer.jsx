import { TrendingUp, BarChart3 } from 'lucide-react';

const POPULAR_CUTOFF_TRENDS = [
  {
    branch: 'Computer Science & Engineering',
    category: 'M.Tech CSE / Software',
    topCutoff: 45,
    avgCutoff: 1250,
    maxCutoff: 4800,
    topCollege: 'OUCE / JNTH',
  },
  {
    branch: 'Artificial Intelligence & Machine Learning',
    category: 'Emerging Tech',
    topCutoff: 62,
    avgCutoff: 1100,
    maxCutoff: 4200,
    topCollege: 'CBIT / VNRV',
  },
  {
    branch: 'VLSI & Embedded Systems Design',
    category: 'Electronics Core',
    topCutoff: 88,
    avgCutoff: 1450,
    maxCutoff: 5100,
    topCollege: 'OUCE / VASV',
  },
  {
    branch: 'Structural Engineering',
    category: 'Civil Core',
    topCutoff: 110,
    avgCutoff: 1600,
    maxCutoff: 5600,
    topCollege: 'JNTH / OUCE',
  },
  {
    branch: 'Power Electronics & Electrical Drives',
    category: 'Electrical Core',
    topCutoff: 140,
    avgCutoff: 1850,
    maxCutoff: 5900,
    topCollege: 'GCTC / CVRH',
  },
  {
    branch: 'Thermal Engineering & CAD/CAM',
    category: 'Mechanical Core',
    topCutoff: 190,
    avgCutoff: 2100,
    maxCutoff: 6400,
    topCollege: 'MGIT / JNTH',
  },
];

export default function CutoffTrendAnalyzer() {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#120a22]/90 via-[#180f2d]/90 to-[#0c0616]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-center gap-2.5 border-b border-white/10 pb-5">
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-2 text-purple-400">
          <TrendingUp size={18} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">
            Specialization Cutoff Analytics &amp; Score Trajectory
          </h3>
          <p className="text-xs text-white/50">
            Opening and closing rank distributions across top Telangana postgraduate engineering streams
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {POPULAR_CUTOFF_TRENDS.map((item, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-black/40 p-4 hover:border-purple-500/40 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-purple-300 rounded bg-purple-500/20 px-2 py-0.5">
                {item.category}
              </span>
              <span className="text-[11px] font-mono text-cyan-300 font-bold">
                Top: {item.topCollege}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white mt-2">
              {item.branch}
            </h4>

            <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-1 text-center">
              <div>
                <span className="text-[10px] text-white/40 block">Opening</span>
                <span className="font-mono text-xs font-bold text-emerald-400">#{item.topCutoff}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 block">Average</span>
                <span className="font-mono text-xs font-bold text-amber-400">#{item.avgCutoff}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 block">Closing</span>
                <span className="font-mono text-xs font-bold text-rose-400">#{item.maxCutoff}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
