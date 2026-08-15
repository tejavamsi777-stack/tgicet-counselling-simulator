import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown } from "lucide-react";
import { useReferenceData } from "../../hooks/useReferenceData";

export default function CourseDropdown({ course, setCourse, examSlug = "tg-icet" }) {
  const { courses } = useReferenceData(examSlug);
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

  const selectedCourseObj = courses.find((c) => c.code === course);
  const selectedLabel = selectedCourseObj
    ? `${selectedCourseObj.code}${selectedCourseObj.name ? ` — ${selectedCourseObj.name}` : ""}`
    : course;

  return (
    <div className={`relative ${open ? "z-50" : "z-10"}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between rounded-2xl border border-white/20 bg-white/10 pl-10 pr-3.5 text-sm font-medium text-white outline-none backdrop-blur-2xl transition-all hover:border-white/40 hover:bg-white/15 focus:border-white/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
      >
        <span className="truncate">
          {course === "" ? <span className="text-gray-400">Select Course</span> : selectedLabel}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-300 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <BookOpen
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="absolute right-0 top-full z-[100] mt-2 w-full min-w-[280px] max-w-[420px] max-h-56 overflow-y-auto overscroll-contain rounded-2xl border border-white/20 bg-[#1a1030]/95 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.15)] backdrop-blur-3xl focus:outline-none"
            style={{
              touchAction: "pan-y",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.3) transparent",
            }}
          >
            {courses.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setCourse(c.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all ${
                  course === c.code
                    ? "bg-white/25 text-white font-bold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]"
                    : "text-gray-200 hover:bg-white/20 hover:text-white"
                }`}
              >
                <span className="truncate">
                  {c.code} {c.name ? `— ${c.name}` : ""}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
