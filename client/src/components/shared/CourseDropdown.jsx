import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, Search, Check, X } from "lucide-react";
import { useReferenceData } from "../../hooks/useReferenceData";

export default function CourseDropdown({ course, setCourse, examSlug = "tg-icet" }) {
  const { courses } = useReferenceData(examSlug);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch("");
    }
  }, [open]);

  const selectedCourseObj = useMemo(() => {
    return courses.find((c) => c.code?.toUpperCase() === course?.toUpperCase());
  }, [courses, course]);

  const filteredCourses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return courses;
    return courses.filter((c) => {
      const codeMatch = c.code?.toLowerCase().includes(term);
      const nameMatch = c.name?.toLowerCase().includes(term);
      return codeMatch || nameMatch;
    });
  }, [courses, search]);

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
        <span className="truncate text-left">
          {course === "" ? <span className="text-gray-400">Select Branch / Course</span> : selectedLabel}
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
            className="absolute left-0 sm:right-0 sm:left-auto top-full z-[100] mt-2 w-full min-w-[300px] sm:w-[460px] max-w-[min(94vw,520px)] rounded-2xl border border-white/20 bg-[#161026]/98 p-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.15)] backdrop-blur-3xl focus:outline-none"
          >
            {/* Search Input for Quick Branch Filtering */}
            {courses.length > 5 && (
              <div className="relative mb-2 px-1">
                <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search branch code or name (e.g. CSE, ECE, Civil)..."
                  className="h-9 w-full rounded-xl border border-white/15 bg-white/5 pl-9 pr-8 text-xs text-white placeholder-gray-400 outline-none transition focus:border-purple-400/50 focus:bg-white/10"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            )}

            {/* Course List */}
            <div
              ref={listRef}
              className="max-h-72 sm:max-h-84 overflow-y-auto overscroll-contain space-y-1 pr-1"
              style={{
                touchAction: "pan-y",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.3) transparent",
              }}
            >
              {filteredCourses.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">
                  No courses matching "{search}"
                </div>
              ) : (
                filteredCourses.map((c) => {
                  const isSelected = course?.toUpperCase() === c.code?.toUpperCase();
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setCourse(c.code);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left transition-all ${
                        isSelected
                          ? "bg-purple-500/25 border border-purple-500/40 text-white font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
                          : "text-gray-200 hover:bg-white/15 hover:text-white border border-transparent"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md border border-purple-500/30 bg-purple-500/20 px-2 py-0.5 text-xs font-bold tracking-wider text-purple-300">
                            {c.code}
                          </span>
                        </div>
                        {c.name && (
                          <span className="text-xs text-gray-300 font-normal leading-snug break-words mt-0.5">
                            {c.name}
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <Check size={16} className="shrink-0 text-purple-300" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-2 border-t border-white/10 pt-2 px-2 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Showing {filteredCourses.length} of {courses.length} courses</span>
              <span className="text-purple-300/80">Scroll to view all</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
