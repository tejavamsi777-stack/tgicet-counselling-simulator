import { motion } from 'framer-motion';
import { Database, Sparkles } from 'lucide-react';

export default function UniqueDataLoader({
  title = "Loading Allotment Records...",
  subtitle = "Connecting to official counselling database & preparing records...",
  examName = "Vuela Learn",
}) {
  return (
    <div className="relative my-8 overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-b from-[#160b2b]/90 via-[#0d071a]/95 to-black/90 p-8 sm:p-12 text-center backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(168,85,247,0.2)]">
      {/* Background Ambient Glows */}
      <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-purple-600/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-cyan-600/20 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Futuristic Orbital Ring Loader */}
        <div className="relative flex h-24 w-24 items-center justify-center mb-6">
          {/* Outer Rotating Glowing Gradient Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 border-r-cyan-400 opacity-90 filter drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]"
          />

          {/* Reverse Rotating Secondary Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 rounded-full border-2 border-dashed border-transparent border-b-pink-500 border-l-purple-400 opacity-70"
          />

          {/* Pulsing Core Badge */}
          <motion.div
            animate={{ scale: [0.92, 1.08, 0.92] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] border border-purple-300/40"
          >
            <Database size={24} className="text-white drop-shadow-md" />
          </motion.div>

          {/* Floating Sparkle Particles */}
          <motion.span
            animate={{ y: [-4, 4, -4], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 right-2 text-cyan-300"
          >
            <Sparkles size={14} />
          </motion.span>
        </div>

        {/* Text & Status */}
        <div className="space-y-2 max-w-md mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[11px] font-bold text-purple-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Fetching Official Data · {examName}</span>
          </div>

          <h3
            className="text-lg sm:text-xl font-bold tracking-tight text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Shimmer Data Placeholder Skeleton */}
        <div className="mt-8 w-full max-w-xl space-y-2.5 opacity-60">
          <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden relative">
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
            />
          </div>
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="h-2 rounded bg-white/5 animate-pulse" />
            <div className="h-2 rounded bg-white/10 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="h-2 rounded bg-white/5 animate-pulse" style={{ animationDelay: '0.4s' }} />
            <div className="h-2 rounded bg-white/10 animate-pulse" style={{ animationDelay: '0.6s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
