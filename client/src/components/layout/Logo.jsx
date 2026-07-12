import { motion } from "framer-motion";

/**
 * Animated logomark: a drawn-on rank-to-result arrow inside a rotating
 * orbit ring, on a violet→cyan gradient badge. Echoes the same "rank in,
 * placement out" motif as the homepage hero arc, just compact for the navbar.
 */
export default function Logo({ size = 36 }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#312e81] via-[#7c3aed] to-[#0e7490] shadow-lg shadow-violet-500/30"
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
          <circle cx="20" cy="7" r="2.4" fill="#fbbf24" />
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
  );
}