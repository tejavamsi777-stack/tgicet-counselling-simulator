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
}) {
  const displayRankLabel =
    rankLabel || (examSlug ? `${examSlug.replace("tg-", "TG ").toUpperCase()} Rank` : "TG ICET Rank");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      id="predict"
      className="relative z-30"
    >
      <GlowCard customSize={true} glowColor="purple" className="p-6 sm:p-10">
        <h2 className="text-2xl font-bold tracking-tight text-white font-display">
          Predict Your College
        </h2>
        <p className="mt-1 text-sm text-gray-300">
          Enter your details to see eligible colleges based on previous year cutoffs.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
              {displayRankLabel}
            </label>
            <input
              type="number"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              placeholder="e.g. 12500"
              className="h-11 w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none transition-all placeholder:text-gray-400 focus:border-white/30 backdrop-blur-md"
            />
          </div>

          <div className="relative z-30">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">Category</label>
            <CategoryDropdown category={category} setCategory={setCategory} examSlug={examSlug} />
          </div>

          <div className="relative z-30">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">Gender</label>
            <GenderDropdown gender={gender} setGender={setGender} />
          </div>

          <div className="relative z-30">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">Course</label>
            <CourseDropdown course={course} setCourse={setCourse} examSlug={examSlug} />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm font-semibold text-rose-400">{error}</p>
        )}

        <div className="mt-8 flex justify-center">
          <GlassButton
            onClick={onPredict}
            size="lg"
            className="w-full sm:w-auto min-w-[220px]"
            contentClassName="flex items-center justify-center gap-2"
          >
            Predict Colleges
          </GlassButton>
        </div>
      </GlowCard>
    </motion.div>
  );
}