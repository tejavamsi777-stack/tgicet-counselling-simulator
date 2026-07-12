import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Mars, Venus, ChevronDown } from "lucide-react";
import { useReferenceData } from "../../hooks/useReferenceData";

const GENDERS = ["Male", "Female"]; // no backend endpoint for this — stays static

function GenderDropdown({ gender, setGender }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isFemale = gender === "Female";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-11 w-full items-center gap-2 rounded-xl border bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:ring-4 ${
          isFemale
            ? "border-pink-200 focus:border-pink-500 focus:ring-pink-500/10"
            : gender === "Male"
            ? "border-blue-200 focus:border-blue-500 focus:ring-blue-500/10"
            : "border-slate-200 focus:border-brand-500 focus:ring-brand-500/10"
        }`}
      >
        {gender === "" && <span className="text-slate-400">Select Gender</span>}
        {gender !== "" && <span>{gender}</span>}
      </button>

      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
        {isFemale ? (
          <Venus size={16} className="text-pink-500" />
        ) : gender === "Male" ? (
          <Mars size={16} className="text-blue-500" />
        ) : (
          <Users size={16} className="text-slate-400" />
        )}
      </div>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            {GENDERS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGender(g);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                  gender === g
                    ? "bg-brand-600 text-white"
                    : "text-slate-900 hover:bg-slate-50"
                }`}
              >
                {g === "Female" ? (
                  <Venus size={16} className={gender === g ? "text-white" : "text-pink-500"} />
                ) : (
                  <Mars size={16} className={gender === g ? "text-white" : "text-blue-500"} />
                )}
                {g}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
function CategoryDropdown({ category, setCategory, categories }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
      >
        {category === "" ? (
          <span className="text-slate-400">Select Category</span>
        ) : (
          <span>{category}</span>
        )}
      </button>

      <Users
        size={16}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="scroll-brand absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            {categories.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setCategory(c.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors ${
                  category === c.code
                    ? "bg-brand-600 text-white"
                    : "text-slate-900 hover:bg-slate-50"
                }`}
              >
                {c.code}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CandidateDetailsForm({
  rank,
  setRank,
  category,
  setCategory,
  gender,
  setGender,
  error,
}) {
  const { categories } = useReferenceData();

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
          <CategoryDropdown category={category} setCategory={setCategory} categories={categories} />
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