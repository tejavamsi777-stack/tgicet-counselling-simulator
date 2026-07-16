import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
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
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      id="predict"
    >
      <Card
        glass
        className="rounded-[32px] border border-white/50 bg-white/70 p-8 shadow-[0_20px_60px_rgba(37,99,235,0.12)] backdrop-blur-2xl"
      >
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Predict Your College
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter your details to see eligible colleges based on previous year cutoffs.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              TG ICET Rank
            </label>
            <input
              type="number"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              placeholder="e.g. 12500"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
            <CategoryDropdown category={category} setCategory={setCategory} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Gender</label>
            <GenderDropdown gender={gender} setGender={setGender} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Course</label>
            <CourseDropdown course={course} setCourse={setCourse} />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>
        )}

        <div className="mt-6">
          <button
  onClick={onPredict}
 className="mx-auto mt-8 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 px-8 py-2.5 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
>
  Predict Colleges
</button>
        </div>
      </Card>
    </motion.div>
  );
}