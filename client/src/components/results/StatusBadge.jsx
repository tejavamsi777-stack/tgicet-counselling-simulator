import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STATUS_META } from "../../utils/status";

const STATUS_STYLES = {
  safe: {
    wash: "linear-gradient(135deg, rgba(16,185,129,0.16), rgba(52,211,153,0.05))",
    border: "rgba(16,185,129,0.4)",
    text: "#047857",
    sphere: "radial-gradient(circle at 32% 28%, #a7f3d0, #10b981 55%, #065f46 100%)",
    glow: "rgba(16,185,129,0.85)",
  },
  moderate: {
    wash: "linear-gradient(135deg, rgba(245,158,11,0.16), rgba(251,191,36,0.05))",
    border: "rgba(245,158,11,0.4)",
    text: "#b45309",
    sphere: "radial-gradient(circle at 32% 28%, #fde68a, #f59e0b 55%, #92400e 100%)",
    glow: "rgba(245,158,11,0.85)",
  },
  risky: {
    wash: "linear-gradient(135deg, rgba(244,63,94,0.16), rgba(251,113,133,0.05))",
    border: "rgba(244,63,94,0.4)",
    text: "#be123c",
    sphere: "radial-gradient(circle at 32% 28%, #fda4af, #f43f5e 55%, #881337 100%)",
    glow: "rgba(244,63,94,0.85)",
  },
};

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.moderate;
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.moderate;
  const [burstKey, setBurstKey] = useState(0);

  const sparkles = Array.from({ length: 7 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 7;
    return {
      id: i,
      x: Math.cos(angle) * 22,
      y: Math.sin(angle) * 22,
    };
  });

  return (
    <motion.span
      onHoverStart={() => setBurstKey((k) => k + 1)}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      className="relative inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 text-xs font-bold backdrop-blur-md"
      style={{
        backgroundImage: style.wash,
        borderColor: style.border,
        color: style.text,
      }}
    >
      {/* sparkle burst on hover */}
      <AnimatePresence>
        {burstKey > 0 && (
          <span key={burstKey} className="pointer-events-none absolute left-[13px] top-1/2 -translate-y-1/2">
            {sparkles.map((s) => (
              <motion.span
                key={s.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                animate={{ x: s.x, y: s.y, opacity: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="absolute h-1 w-1 rounded-full"
                style={{ backgroundColor: style.glow }}
              />
            ))}
          </span>
        )}
      </AnimatePresence>

      {/* glowing orb */}
      <span className="relative inline-block h-4 w-4 shrink-0">
        {/* pulsing outer glow */}
        <motion.span
          className="absolute -inset-1.5 rounded-full"
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.15, 0.9] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ backgroundColor: style.glow, filter: "blur(6px)" }}
        />

        {/* breathing glossy sphere */}
        <motion.span
          className="relative block h-4 w-4 overflow-hidden rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)]"
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ backgroundImage: style.sphere }}
        >
          {/* rotating light ring */}
          <span
            className="status-orbit-spin absolute -inset-2"
            style={{
              backgroundImage:
                "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.95) 25deg, transparent 65deg, transparent 360deg)",
              mixBlendMode: "overlay",
            }}
          />
          {/* fixed specular highlight */}
          <span
            className="absolute left-[3px] top-[3px] h-1.5 w-1.5 rounded-full bg-white/90"
            style={{ filter: "blur(0.5px)" }}
          />
        </motion.span>
      </span>

      <span className="relative">{meta.label}</span>
    </motion.span>
  );
}