import { motion } from "framer-motion";
import GenderDropdown from "../shared/GenderDropdown";
import CategoryDropdown from "../shared/CategoryDropdown";

export default function CandidateDetailsForm({
  rank,
  setRank,
  category,
  setCategory,
  gender,
  setGender,
  error,
}) {
  return (
    <div className="rounded-[28px] border border-white/50 bg-white/70 p-6 shadow-[0_20px_60px_rgba(37,99,235,0.12)] backdrop-blur-2xl sm:p-8">
      <h3 className="mb-5 text-base font-semibold tracking-tight text-slate-900">
        Your Details
      </h3>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0 }}
        >
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Rank</label>
          <div className="relative">
            <input
              type="number"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              placeholder="e.g. 12500"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
          <CategoryDropdown category={category} setCategory={setCategory} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
        >
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Gender</label>
          <GenderDropdown gender={gender} setGender={setGender} />
        </motion.div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm font-medium text-rose-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}