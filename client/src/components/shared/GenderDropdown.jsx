import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Mars, Venus, ChevronDown } from "lucide-react";

const GENDERS = ["Male", "Female"];

export default function GenderDropdown({ gender, setGender }) {
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
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-900 transition-colors hover:bg-brand-600 hover:text-white"
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