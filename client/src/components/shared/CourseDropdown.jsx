import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, Check, Search, X } from "lucide-react";
import { useReferenceData } from "../../hooks/useReferenceData";
import { strictMultiFieldMatch } from "../../utils/searchMatch";

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
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return courses;
    return courses.filter((c) => strictMultiFieldMatch([c.code, c.name], search));
  }, [courses, search]);

  const selectedCourseObj = courses.find((c) => c.code === course);
  const selectedLabel = selectedCourseObj
    ? `${selectedCourseObj.code}${selectedCourseObj.name ? ` — ${selectedCourseObj.name}` : ""}`
    : course;

  return (
    <div className={`relative ${open ? "z-50" : "z-10"}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between rounded-2xl border border-white/20 bg-white/10 pl-10 pr-3.5 text-xs sm:text-sm font-medium text-white outline-none backdrop-blur-2xl transition-all hover:border-white/40 hover:bg-white/15 focus:border-white/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
      >
        <span className="truncate">
          {!course ? <span className="text-gray-400">Select</span> : selectedLabel}
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
            className="absolute left-0 sm:left-auto sm:right-0 top-full z-[100] mt-2 flex flex-col w-full min-w-[280px] sm:min-w-[340px] md:min-w-[400px] max-h-80 overflow-hidden rounded-2xl border border-white/20 bg-[#140e24]/98 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.15)] backdrop-blur-3xl focus:outline-none"
          >
            {/* Search Input */}
            <div className="relative p-1.5 border-b border-white/10">
              <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search branch code or name (e.g. CSE, ECE, Civil)..."
                className="h-9 w-full rounded-xl border border-white/15 bg-white/5 pl-8 pr-7 text-xs text-white placeholder-gray-400 outline-none transition focus:border-white/40 focus:bg-white/10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Scrollable Course List */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto overscroll-contain p-1 space-y-1"
              style={{
                touchAction: "pan-y",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.3) transparent",
              }}
            >
              {filteredCourses.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  No courses found matching &ldquo;{search}&rdquo;
                </div>
              ) : (
                filteredCourses.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCourse(c.code);
                      setOpen(false);
                    }}
                    className={`flex w-full items-start justify-between rounded-xl p-2.5 text-left transition-all ${
                      course === c.code
                        ? "bg-purple-600/30 text-white border border-purple-500/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
                        : "text-gray-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex flex-col pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block rounded-md bg-purple-500/20 px-2 py-0.5 text-[11px] font-bold tracking-wide text-purple-300">
                          {c.code}
                        </span>
                      </div>
                      {c.name && (
                        <span className="mt-1 text-[11px] font-normal leading-tight text-gray-300">
                          {c.name}
                        </span>
                      )}
                    </div>
                    {course === c.code && (
                      <Check size={14} className="shrink-0 text-purple-300 mt-1" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer summary */}
            <div className="border-t border-white/10 bg-[#140e24]/98 px-3 py-1.5 text-[10px] text-gray-400 flex items-center justify-between">
              <span>
                {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"}
                {search && ` (filtered)`}
              </span>
              <span className="text-gray-500">Scroll to view all</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
