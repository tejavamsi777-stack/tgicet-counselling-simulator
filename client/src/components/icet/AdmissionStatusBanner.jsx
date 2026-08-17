import { Link } from 'react-router-dom';
import { getAutoStatus, getPhaseAutoStatus } from '../../utils/dateStatus';

export default function AdmissionStatusBanner({ phases = [], year = '2026' }) {
  // Determine if any phase is active or upcoming automatically from the dates
  const isAnyPhaseLive = phases.some(p => getPhaseAutoStatus(p) === 'active');
  const activePhase = phases.find(p => getPhaseAutoStatus(p) === 'active');
  const nextUpcomingPhase = phases.find(p => getPhaseAutoStatus(p) === 'upcoming');

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-950/40 via-black/60 to-black/80 p-6 sm:p-8 backdrop-blur-xl">
      {/* Subtle purple radial glow */}
      <div className="absolute inset-0 bg-purple-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Status badge */}
        <div className="mb-4">
          {isAnyPhaseLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3.5 py-1 text-xs font-semibold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {activePhase?.label || 'Counselling'} Live Now
            </span>
          ) : nextUpcomingPhase ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/15 px-3.5 py-1 text-xs font-semibold text-sky-300">
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
              {nextUpcomingPhase?.label || 'Next Phase'} Active / Upcoming
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
              Admissions In Progress
            </span>
          )}
        </div>

        {/* Main heading */}
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
          TG ICET {year} Admissions &amp; Counselling
        </h2>

        {/* Subtext */}
        <p className="text-white/70 text-sm sm:text-base max-w-2xl mb-6 leading-relaxed">
          Official MBA &amp; MCA admissions gateway conducted by Kakatiya University on behalf of TGCHE. Track live phase progression, verify HLC documentation, and simulate web options.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-3">
          <Link
            to="/exams/tg-icet/predictor"
            className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/20 px-5 py-2.5 text-sm font-semibold text-purple-200 hover:bg-purple-500/30 hover:border-purple-400/50 transition-all duration-200"
          >
            Predict My College
          </Link>
          <Link
            to="/exams/tg-icet/mock-counselling"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
          >
            Simulate Web Options
          </Link>
        </div>
      </div>
    </div>
  );
}
