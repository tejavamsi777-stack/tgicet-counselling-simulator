import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, Check, Search } from "lucide-react";
import { useReferenceData } from "../../hooks/useReferenceData";

export default function CourseDropdown({ course, setCourse, examSlug = "tg-icet" }) {
  const { courses } = useReferenceData(examSlug);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  const selectedCourseObj = courses.find((c) => c.code === course);
  const selectedLabel = selectedCourseObj
    ? `${selectedCourseObj.code}${selectedCourseObj.name ? ` — ${selectedCourseObj.name}` : ""}`
    : course;

  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return courses;
    const q = searchTerm.toLowerCase();
    return courses.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        (c.name && c.name.toLowerCase().includes(q))
    );
  }, [courses, searchTerm]);

  return (
    <div className={`relative ${open ? "z-50" : "z-10"}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between rounded-2xl border border-white/20 bg-white/10 pl-10 pr-3.5 text-sm font-medium text-white outline-none backdrop-blur-2xl transition-all hover:border-white/40 hover:bg-white/15 focus:border-white/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
      >
        <span className="truncate text-left">
          {course === "" ? <span className="text-gray-400">Select Course / Branch</span> : selectedLabel}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 ml-2 text-gray-300 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
            className="absolute left-0 sm:left-auto right-0 top-full z-[100] mt-2 w-full min-w-full sm:min-w-[380px] max-w-[min(92vw,520px)] rounded-2xl border border-white/20 bg-[#161224]/98 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.15)] backdrop-blur-3xl focus:outline-none"
            style={{ touchAction: "pan-y" }}
          >
            {/* Search Input for fast course discovery */}
            {courses.length > 5 && (
              <div className="relative mb-2 px-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search course or branch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8.5 w-full rounded-xl border border-white/15 bg-white/10 pl-8 pr-3 text-xs text-white placeholder:text-gray-400 outline-none focus:border-purple-400"
                />
              </div>
            )}

            {/* Courses List */}
            <div
              className="max-h-60 overflow-y-auto overscroll-contain space-y-1 pr-1"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.3) transparent",
              }}
            >
              {filteredCourses.length === 0 ? (
                <div className="py-4 text-center text-xs text-gray-400">
                  No courses matching "{searchTerm}"
                </div>
              ) : (
                filteredCourses.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCourse(c.code);
                      setOpen(false);
                      setSearchTerm("");
                    }}
                    className={`flex w-full items-start justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs sm:text-sm transition-all ${
                      course === c.code
                        ? "bg-purple-600/30 text-white border border-purple-500/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
                        : "text-gray-200 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    <div className="flex-1 whitespace-normal break-words leading-snug">
                      <span className="font-bold text-purple-300 mr-2">
                        {c.code}
                      </span>
                      {c.name && (
                        <span className="text-gray-300 font-normal">
                          — {c.name}
                        </span>
                      )}
                    </div>
                    {course === c.code && (
                      <Check size={15} className="mt-0.5 shrink-0 text-purple-300" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
