import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ChevronDown } from "lucide-react";
import { useReferenceData } from "../../hooks/useReferenceData";

export default function CategoryDropdown({ category, setCategory }) {
  const { categories } = useReferenceData();
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
                className="flex w-full items-center px-4 py-2.5 text-left text-sm text-slate-900 transition-colors hover:bg-brand-600 hover:text-white"
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