import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_MESSAGES = [
  "Loading Previous Year Data",
  "Matching Category",
  "Comparing Rank",
  "Finding Eligible Colleges",
  "Calculating Safe Colleges",
  "Calculating Moderate Colleges",
  "Ranking Best Colleges",
  "Preparing Final Prediction",
];

const DURATION = 3000;

const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  angle: (360 / 10) * i,
  delay: i * 0.08,
}));

export default function PredictionLoader({ stats, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

useEffect(() => {
    startRef.current = performance.now();

    function tick(now) {
      const elapsed = now - startRef.current;
      const pct = Math.min(100, Math.round((elapsed / DURATION) * 100));
      setProgress(pct);

      if (elapsed < DURATION) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          onComplete?.();
        }, 450);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-white/50 backdrop-blur-2xl"
      role="status"
      aria-live="polite"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.15),_transparent_65%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex w-[92%] max-w-md flex-col items-center px-4 text-center"
      >
        <div className="relative mb-8 flex h-40 w-40 items-center justify-center">
          {[0, 1, 2].map((ring) => (
            <motion.div
              key={ring}
              className="absolute rounded-full border border-brand-400/40"
              style={{
                width: `${100 + ring * 34}px`,
                height: `${100 + ring * 34}px`,
              }}
              animate={{ rotate: ring % 2 === 0 ? 360 : -360 }}
              transition={{
                duration: 6 + ring * 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

          {PARTICLES.map((p) => (
            <motion.span
              key={p.id}
              className="absolute h-1.5 w-1.5 rounded-full bg-brand-400"
              style={{
                transform: `rotate(${p.angle}deg) translate(78px)`,
              }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.6, 1.1, 0.6] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
            />
          ))}

          <motion.div
            className="absolute h-20 w-20 rounded-full bg-gradient-to-br from-brand-400 via-brand-600 to-indigo-500 blur-[2px]"
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute h-20 w-20 rounded-full bg-gradient-to-br from-brand-300 via-brand-500 to-indigo-400 opacity-60 blur-xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          AI Counselling Assistant
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Analyzing your TG ICET Rank...
        </p>

        <div className="mt-6 h-6">
          <AnimatePresence mode="wait">
            {progress >= 100 ? (
              <motion.p
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm font-semibold text-emerald-600"
              >
                ✓ Analysis Complete
              </motion.p>
            ) : (
              <motion.p
                key={statusIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="text-sm font-medium text-brand-600"
              >
                ✓ {STATUS_MESSAGES[statusIndex]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 w-full">
          <div className="h-2 w-full overflow-hidden rounded-full border border-white/60 bg-white/50 backdrop-blur-md">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 via-brand-600 to-indigo-500"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          <p className="mt-2 text-xs font-medium text-slate-500">{progress}%</p>
        </div>

        {stats && (
          <div className="mt-7 grid w-full grid-cols-3 gap-3">
            <StatBlock
              label="Records Scanned"
              value={Math.round((progress / 100) * stats.recordsScanned)}
            />
            <StatBlock
              label="Colleges Checked"
              value={Math.round((progress / 100) * stats.collegesChecked)}
            />
            <StatBlock
              label="Safe Matches"
              value={Math.round((progress / 100) * stats.safeMatches)}
            />
          </div>
        )}

        <p className="mt-8 text-xs text-slate-400">
          Please wait... this usually takes only a few seconds.
        </p>
      </motion.div>
    </motion.div>
  );
}

function StatBlock({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/50 bg-white/60 p-3 backdrop-blur-md">
      <p className="text-base font-semibold text-slate-900">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="mt-0.5 text-[11px] text-slate-500">{label}</p>
    </div>
  );
}