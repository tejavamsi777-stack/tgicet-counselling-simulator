import { motion } from "framer-motion";
import { GlowCard } from "../ui/spotlight-card";
import { useCountUp } from "../../hooks/useCountUp";
import { cn } from "../../lib/utils";

const accentMap = {
  brand: "text-purple-300 bg-purple-500/20 border border-purple-500/30",
  safe: "text-emerald-300 bg-emerald-500/20 border border-emerald-500/30",
  moderate: "text-amber-300 bg-amber-500/20 border border-amber-500/30",
  risky: "text-rose-300 bg-rose-500/20 border border-rose-500/30",
};

export default function StatCard({ label, value, icon: Icon, accent = "brand", delay = 0 }) {
  const count = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      className="relative"
    >
      <GlowCard customSize={true} glowColor="purple" className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-300">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white">
              {count.toLocaleString()}
            </p>
          </div>
          {Icon && (
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur-md", accentMap[accent])}>
              <Icon size={20} />
            </div>
          )}
        </div>
      </GlowCard>
    </motion.div>
  );
}