import { motion } from "framer-motion";

export default function Logo({ size = 36 }) {
  return (
    <div className="glass-button-wrap relative inline-flex">
      <div
        className="glass-button flex items-center justify-center rounded-2xl border border-white/30 bg-gradient-to-br from-white/25 via-white/10 to-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 40 40" width={size * 0.7} height={size * 0.7} fill="none">
          <motion.circle
            cx="20"
            cy="20"
            r="13"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            style={{ originX: "20px", originY: "20px" }}
          >
            <circle cx="20" cy="7" r="2.4" fill="#c084fc" />
          </motion.g>
          <motion.path
            d="M11 25 L18 15 L23 20 L29 9"
            stroke="white"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
      </div>
      <div className="glass-button-shadow rounded-2xl"></div>
    </div>
  );
}