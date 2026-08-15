import { motion } from "framer-motion";
import { GlowCard } from "../ui/spotlight-card";
import GenderDropdown from "../shared/GenderDropdown";
import CategoryDropdown from "../shared/CategoryDropdown";
import { GlassButton } from "../ui/glass-button";

export default function CandidateDetailsForm({
  rank,
  setRank,
  category,
  setCategory,
  gender,
  setGender,
  error,
  examSlug = "tg-icet",
  onSubmit,
}) {
  return (
    <GlowCard customSize={true} glowColor="purple" className="p-6 sm:p-8 relative z-30 overflow-visible" tilt={false}>
      <h3 className="mb-5 text-xl font-bold tracking-tight text-white font-display">
        Your Details
      </h3>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0 }}
          className="relative z-10 flex flex-col justify-between"
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">Rank</label>
            <div className="relative">
              <input
                type="number"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="e.g. 12500"
                className="h-11 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-sm text-white outline-none backdrop-blur-2xl transition-all placeholder:text-gray-400 focus:border-white/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
              />
            </div>
          </div>

          {onSubmit && (
            <div className="mt-6 hidden sm:block">
              <GlassButton onClick={onSubmit} size="lg" className="w-full">
                Continue
              </GlassButton>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="relative z-30"
        >
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">Category</label>
          <CategoryDropdown category={category} setCategory={setCategory} examSlug={examSlug} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="relative z-20"
        >
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">Gender</label>
          <GenderDropdown gender={gender} setGender={setGender} />
        </motion.div>
      </div>

      {onSubmit && (
        <div className="mt-6 block sm:hidden">
          <GlassButton onClick={onSubmit} size="lg" className="w-full">
            Continue
          </GlassButton>
        </div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm font-semibold text-rose-400"
        >
          {error}
        </motion.p>
      )}
    </GlowCard>
  );
}