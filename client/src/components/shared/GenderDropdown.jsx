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
    <div className={`relative ${open ? "z-50" : "z-10"}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center gap-2 rounded-2xl border border-white/20 bg-white/10 pl-10 pr-4 text-sm font-medium text-white outline-none backdrop-blur-2xl transition-all hover:border-white/40 hover:bg-white/15 focus:border-white/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
      >
        {gender === "" && <span className="text-gray-400">Select Gender</span>}
        {gender !== "" && <span className="text-white">{gender}</span>}
      </button>

      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
        {isFemale ? (
          <Venus size={16} className="text-pink-400" />
        ) : gender === "Male" ? (
          <Mars size={16} className="text-sky-400" />
        ) : (
          <Users size={16} className="text-gray-300" />
        )}
      </div>

      <ChevronDown
        size={16}
        className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-white/20 bg-[#1a1030]/95 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.15)] backdrop-blur-3xl"
          >
            {GENDERS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGender(g);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all ${
                  gender === g
                    ? "bg-white/25 text-white font-bold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]"
                    : "text-gray-200 hover:bg-white/20 hover:text-white"
                }`}
              >
                {g === "Female" ? (
                  <Venus size={16} className="text-pink-400" />
                ) : (
                  <Mars size={16} className="text-sky-400" />
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