import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronDown, Check } from "lucide-react";
import ThreeDotsLoader from "../ui/three-dots-loader";

export default function YearDropdown({
  year,
  setYear,
  selectedYears = [],
  setSelectedYears,
  years = [],
}) {
  const isMulti = Boolean(setSelectedYears);
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

  const yearList = useMemo(() => {
    return years
      .map((y) => (typeof y === "object" ? Number(y.year) : Number(y)))
      .filter((y) => !isNaN(y) && y > 0)
      .sort((a, b) => b - a);
  }, [years]);

  function toggleYear(yNum) {
    if (!isMulti) {
      if (setYear) setYear(String(yNum));
      setOpen(false);
      return;
    }

    if (selectedYears.includes(yNum)) {
      // Don't allow unselecting all if user clicks the last one, or allow it
      setSelectedYears(selectedYears.filter((y) => y !== yNum));
    } else {
      setSelectedYears([...selectedYears, yNum].sort((a, b) => b - a));
    }
  }

  function handleSelectAll() {
    setSelectedYears(yearList);
  }

  function handleClearAll() {
    setSelectedYears([]);
  }

  const triggerLabel = useMemo(() => {
    if (yearList.length === 0) {
      return <ThreeDotsLoader label="Loading Years" dotClassName="bg-purple-400" />;
    }
    if (!isMulti) {
      return !year ? <span className="text-gray-400">Select Year</span> : year;
    }

    if (selectedYears.length === 0 || selectedYears.length === yearList.length) {
      return <span className="text-gray-300">All Cutoff Years</span>;
    }
    if (selectedYears.length === 1) {
      return `${selectedYears[0]}`;
    }
    return selectedYears.join(", ");
  }, [isMulti, year, selectedYears, yearList]);

  return (
    <div className={`relative ${open ? "z-50" : "z-10"}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between rounded-2xl border border-white/20 bg-white/10 pl-10 pr-3.5 text-sm font-medium text-white outline-none backdrop-blur-2xl transition-all hover:border-white/40 hover:bg-white/15 focus:border-white/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
      >
        <span className="truncate pr-2">{triggerLabel}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {isMulti && selectedYears.length > 0 && selectedYears.length < yearList.length && (
            <span className="inline-flex items-center justify-center rounded-full bg-purple-500/30 px-1.5 py-0.5 text-[10px] font-bold text-purple-200">
              {selectedYears.length}
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-gray-300 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      <Calendar
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
            className="absolute left-0 right-0 z-[100] mt-2 overflow-hidden rounded-2xl border border-white/20 bg-[#1a1030]/95 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.15)] backdrop-blur-3xl focus:outline-none"
          >
            {isMulti && yearList.length > 1 && (
              <div className="flex items-center justify-between border-b border-white/10 px-2.5 py-1.5 text-[11px]">
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
            )}

            {yearList.length === 0 ? (
              <div className="p-4 flex items-center justify-center">
                <ThreeDotsLoader label="Loading years" dotClassName="bg-purple-400" />
              </div>
            ) : (
              <div className="space-y-0.5 p-0.5">
                {yearList.map((yNum) => {
                const isSelected = isMulti
                  ? selectedYears.includes(yNum)
                  : String(year) === String(yNum);

                return (
                  <button
                    key={yNum}
                    type="button"
                    onClick={() => toggleYear(yNum)}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-purple-600/30 text-white border border-purple-500/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] font-semibold"
                        : "text-gray-200 hover:bg-white/10 hover:text-white border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isMulti && (
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                            isSelected
                              ? "border-purple-400 bg-purple-600 text-white"
                              : "border-white/30 bg-white/5"
                          }`}
                        >
                          {isSelected && <Check size={11} strokeWidth={3} />}
                        </div>
                      )}
                      <span>{yNum}</span>
                    </div>
                    {isSelected && !isMulti && (
                      <Check size={15} className="text-purple-300 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
