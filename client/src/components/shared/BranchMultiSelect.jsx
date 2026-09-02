import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, Check, Search, X, Sparkles } from "lucide-react";
import { useReferenceData, sortCourses } from "../../hooks/useReferenceData";
import ThreeDotsLoader from "../ui/three-dots-loader";
import { strictMultiFieldMatch } from "../../utils/searchMatch";

export default function BranchMultiSelect({
  selectedCourses = [],
  setSelectedCourses,
  courses: propCourses,
  examSlug = "tg-eapcet",
}) {
  const { courses: refCourses, loading } = useReferenceData(examSlug);
  const courses = useMemo(() => {
    const list = (propCourses && propCourses.length > 0) ? propCourses : (refCourses || []);
    return sortCourses(list, examSlug);
  }, [propCourses, refCourses, examSlug]);

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

  function toggleCourse(code) {
    const norm = String(code).trim().toUpperCase();
    if (selectedCourses.includes(norm)) {
      setSelectedCourses(selectedCourses.filter((c) => c !== norm));
    } else {
      setSelectedCourses([...selectedCourses, norm]);
    }
  }

  function handleSelectAll() {
    setSelectedCourses(courses.map((c) => (c.code || c).toString().trim().toUpperCase()));
  }

  function handleClearAll() {
    setSelectedCourses([]);
  }

  const shortcut = useMemo(() => {
    if (examSlug === "tg-eapcet" || examSlug === "tg-ecet" || examSlug === "ap-eapcet") {
      return {
        label: "CSE & Allied",
        codes: ["CSE", "CSM", "CSD", "CSC", "CSIT", "INF", "IT", "CSO", "CSB", "CSI", "AIM", "AID", "AI", "CAI", "CAD", "CIC", "CIT", "CSBS"],
      };
    }
    if (examSlug === "tg-polycet") {
      return {
        label: "CS & Allied",
        codes: ["CME", "CS"],
      };
    }
    if (examSlug === "tg-icet") {
      return {
        label: "MBA & MCA",
        codes: ["MBA", "MCA"],
      };
    }
    return null;
  }, [examSlug]);

  function handleSelectShortcut() {
    if (!shortcut) return;
    const validCodes = courses
      .map((c) => (c.code || c).toString().trim().toUpperCase())
      .filter((c) => shortcut.codes.includes(c));
    setSelectedCourses(validCodes);
  }

  const isAllSelected =
    courses.length > 0 && selectedCourses.length === courses.length;
  const isNoneSelected = selectedCourses.length === 0;

  // Trigger label determination
  const triggerLabel = useMemo(() => {
    if (loading && courses.length === 0) {
      return <ThreeDotsLoader label="Loading courses" dotClassName="bg-purple-400" />;
    }
    if (isNoneSelected) {
      return <span className="text-gray-400">Select</span>;
    }
    if (isAllSelected) {
      return <span className="text-gray-300">All Branches</span>;
    }
    if (selectedCourses.length === 1) {
      const code = selectedCourses[0];
      const match = courses.find((c) => (c.code || c).toString().toUpperCase() === code);
      return match?.name ? `${code} — ${match.name}` : code;
    }
    if (selectedCourses.length <= 2) {
      return selectedCourses.join(", ");
    }
    return `${selectedCourses.length} Branches Selected`;
  }, [selectedCourses, courses, isNoneSelected, isAllSelected, loading]);

  return (
    <div className={`relative ${open ? "z-50" : "z-10"}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between rounded-2xl border border-white/20 bg-white/10 pl-10 pr-3.5 text-xs sm:text-sm font-medium text-white outline-none backdrop-blur-2xl transition-all hover:border-white/40 hover:bg-white/15 focus:border-white/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
      >
        <span className="truncate pr-2">{triggerLabel}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {!isNoneSelected && !isAllSelected && (
            <span className="inline-flex items-center justify-center rounded-full bg-purple-500/30 px-1.5 py-0.5 text-[10px] font-bold text-purple-200">
              {selectedCourses.length}
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-gray-300 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
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
            className="absolute left-0 sm:left-auto sm:right-0 top-full z-[100] mt-2 flex flex-col w-full min-w-[290px] sm:min-w-[360px] md:min-w-[420px] max-h-72 overflow-hidden rounded-2xl border border-white/20 bg-[#140e24]/98 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.15)] backdrop-blur-3xl focus:outline-none"
          >
            {/* Search and Quick Actions */}
            <div className="p-1.5 border-b border-white/10 space-y-2">
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search branch (e.g. CSE, CSM, ECE, Civil)..."
                  className="h-8 w-full rounded-xl border border-white/15 bg-white/5 pl-8 pr-7 text-xs text-white placeholder-gray-400 outline-none transition focus:border-white/40 focus:bg-white/10"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Quick Select Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] px-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="font-medium text-purple-300 hover:text-purple-200 transition"
                  >
                    Select All
                  </button>
                  <span className="text-gray-600">|</span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="font-medium text-gray-400 hover:text-gray-300 transition"
                  >
                    Clear (All)
                  </button>
                </div>
                {shortcut && (
                  <button
                    type="button"
                    onClick={handleSelectShortcut}
                    className="inline-flex items-center gap-1 rounded-md bg-purple-500/20 px-2 py-0.5 font-medium text-purple-300 hover:bg-purple-500/30 transition text-[10px]"
                  >
                    <Sparkles size={11} /> {shortcut.label}
                  </button>
                )}
              </div>
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
                loading ? (
                  <div className="p-6 flex items-center justify-center">
                    <ThreeDotsLoader label="Loading branches & courses" dotClassName="bg-purple-400" />
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">
                    No courses found matching &ldquo;{search}&rdquo;
                  </div>
                )
              ) : (
                filteredCourses.map((c) => {
                  const code = (c.code || c).toString().trim().toUpperCase();
                  const isChecked = selectedCourses.includes(code);

                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => toggleCourse(code)}
                      className={`flex w-full items-start justify-between rounded-xl p-2 text-left transition-all ${
                        isChecked
                          ? "bg-purple-600/30 text-white border border-purple-500/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                          : "text-gray-200 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 pr-2">
                        <div
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                            isChecked
                              ? "border-purple-400 bg-purple-500 text-white"
                              : "border-white/30 bg-white/5"
                          }`}
                        >
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="inline-block rounded-md bg-purple-500/20 px-2 py-0.5 text-[11px] font-bold tracking-wide text-purple-300 w-fit">
                            {code}
                          </span>
                          {c.name && (
                            <span className="mt-1 text-[11px] font-normal leading-tight text-gray-300">
                              {c.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 bg-[#140e24]/98 px-3 py-1.5 text-[10px] text-gray-400 flex items-center justify-between">
              <span>
                {selectedCourses.length === 0 ? "All courses" : `${selectedCourses.length} selected`}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-purple-300 hover:text-purple-200 font-semibold text-[11px]"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
