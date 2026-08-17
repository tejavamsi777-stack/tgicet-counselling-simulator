import { Link } from 'react-router-dom';

export default function AdmissionStatusBanner({ phases = [], year = '2026' }) {
  const isLive = phases.some((p) => p.status === 'active' || p.status === 'Live Now');

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-950/40 via-black/60 to-black/80 p-6 sm:p-8 backdrop-blur-xl">
      {/* Subtle purple radial glow */}
      <div className="absolute inset-0 bg-purple-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Status badge */}
        <div className="mb-4">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-300">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Live Now
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
              Concluded
            </span>
          )}
        </div>

        {/* Main heading */}
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
          TG POLYCET {year} Counselling
        </h2>

        {/* Subtext */}
        <p className="text-white/60 text-sm sm:text-base max-w-2xl mb-6 leading-relaxed">
          Explore 114 Government and Private polytechnic colleges, verified 2026 candidate allotments, and 4-year cutoff trends.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-3">
          <Link
            to="/tg-polycet/predictor"
            className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/20 px-5 py-2.5 text-sm font-semibold text-purple-200 hover:bg-purple-500/30 hover:border-purple-400/50 transition-all duration-200"
          >
            Estimate My Polytechnic
          </Link>
          <Link
            to="/tg-polycet/mock-counselling"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
          >
            Generate Web Options
          </Link>
        </div>
      </div>
    </div>
  );
}
