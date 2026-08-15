import { motion } from "framer-motion";
import { GlowCard } from "../ui/spotlight-card";
import { GlassButton } from "../ui/glass-button";
import GenderDropdown from "../shared/GenderDropdown";
import CategoryDropdown from "../shared/CategoryDropdown";
import CourseDropdown from "../shared/CourseDropdown";

export default function PredictorForm({
  rank,
  setRank,
  category,
  setCategory,
  gender,
  setGender,
  course,
  setCourse,
  onPredict,
  error,
  examSlug = "tg-icet",
  rankLabel,
  examBadge = "TG ICET 2025",
}) {
  const displayRankLabel =
    rankLabel || (examSlug ? `${examSlug.replace("tg-", "TG ").toUpperCase()} Rank` : "TG ICET Rank");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      id="predict"
      className="relative z-30"
    >
      <GlowCard customSize={true} glowColor="purple" className="p-6 sm:p-10" tilt={false}>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Predict Your College
          </h2>
          <div>
            <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-purple-300 backdrop-blur-sm">
              {examBadge}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300">
            Enter your rank and branch to explore eligible colleges based on previous year cutoffs.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Rank (Full width on mobile) */}
          <div className="relative z-[40]">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
              {displayRankLabel}
            </label>
            <input
              type="number"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              placeholder="e.g. 12500"
              className="h-11 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-sm text-white outline-none backdrop-blur-2xl transition-all placeholder:text-gray-400 focus:border-white/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
            />
          </div>

          {/* 2. Category & Gender (Side-by-side on mobile) */}
          <div className="grid grid-cols-2 gap-3 sm:contents">
            <div className="relative z-[30]">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Category
              </label>
              <CategoryDropdown category={category} setCategory={setCategory} examSlug={examSlug} />
            </div>

            <div className="relative z-[20]">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Gender
              </label>
              <GenderDropdown gender={gender} setGender={setGender} />
            </div>
          </div>

          {/* 3. Course / Branch (Full width on mobile) */}
          <div className="relative z-[10]">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
              Course
            </label>
            <CourseDropdown course={course} setCourse={setCourse} examSlug={examSlug} />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-xs sm:text-sm font-semibold text-rose-400">{error}</p>
        )}

        <div className="relative z-[1] mt-7 flex justify-center">
          <GlassButton
            onClick={onPredict}
            size="default"
            className="w-full sm:w-auto min-w-[180px]"
            contentClassName="flex items-center justify-center gap-2 font-semibold"
          >
            Predict Colleges
          </GlassButton>
        </div>
      </GlowCard>
    </motion.div>
  );
}