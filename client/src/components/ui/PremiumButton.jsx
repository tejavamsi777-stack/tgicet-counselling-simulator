import { motion } from "framer-motion";

export default function PremiumButton({ children, onClick, className = "" }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-full px-6 py-2.5 font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all ${className}`}
      style={{
        background: "linear-gradient(135deg, #3b82f6, #2563eb)", // Brand Blue
      }}
    >
      {/* The "Shine" Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      
      {/* Inner Highlight for Depth */}
      <div className="absolute inset-0 rounded-full border border-white/20" />
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}