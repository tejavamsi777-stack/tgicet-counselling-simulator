import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronDown, Check, Search, X } from "lucide-react";
import { getDistrictName } from "../../utils/districtNames";
import { useReferenceData } from "../../hooks/useReferenceData";
import ThreeDotsLoader from "../ui/three-dots-loader";
import { strictMultiFieldMatch } from "../../utils/searchMatch";

export default function DistrictMultiSelect({
  selectedDistricts = [],
  setSelectedDistricts,
  districts: propDistricts,
  examSlug = "tg-eapcet",
}) {
  const { districts: refDistricts, loading } = useReferenceData(examSlug);
  const districts = (propDistricts && propDistricts.length > 0) ? propDistricts : (refDistricts || []);

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
    if (open) {
      setSearch("");
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const sortedDistricts = useMemo(() => {
    const map = new Map();
    for (const d of districts) {
      const rawCode = (d?.code || d?.name || d || "").toString().trim().toUpperCase();
      if (!rawCode) continue;
      if (!map.has(rawCode)) {
        const displayName = getDistrictName(rawCode) || d?.name || rawCode;
        map.set(rawCode, { code: rawCode, name: displayName });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [districts]);

  const filteredDistricts = useMemo(() => {
    if (!search.trim()) return sortedDistricts;
    return sortedDistricts.filter((d) => strictMultiFieldMatch([d.code, d.name], search));
  }, [sortedDistricts, search]);


  function toggleDistrict(code) {
    const norm = String(code).trim().toUpperCase();
    if (selectedDistricts.includes(norm)) {
      setSelectedDistricts(selectedDistricts.filter((d) => d !== norm));
    } else {
      setSelectedDistricts([...selectedDistricts, norm]);
    }
  }

  function handleSelectAll() {
    setSelectedDistricts(sortedDistricts.map((d) => (d.code || d).toString().trim().toUpperCase()));
  }

  function handleClearAll() {
    setSelectedDistricts([]);
  }

  const isAllSelected =
    sortedDistricts.length > 0 && selectedDistricts.length === sortedDistricts.length;
  const isNoneSelected = selectedDistricts.length === 0;

  // Trigger label determination
  const triggerLabel = useMemo(() => {
    if (loading && sortedDistricts.length === 0) {
      return <ThreeDotsLoader label="Loading districts" dotClassName="bg-cyan-400" />;
    }
    if (isNoneSelected || isAllSelected) {
      return <span className="text-gray-300">All Districts</span>;
    }
    if (selectedDistricts.length === 1) {
      const code = selectedDistricts[0];
      return `${getDistrictName(code)} (${code})`;
    }
    if (selectedDistricts.length <= 2) {
      return selectedDistricts.map((c) => getDistrictName(c) || c).join(", ");
    }
    return `${selectedDistricts.length} Districts Selected`;
  }, [selectedDistricts, isNoneSelected, isAllSelected, loading, districts]);

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
              {selectedDistricts.length}
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-gray-300 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      <MapPin
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
            className="absolute left-0 sm:left-auto sm:right-0 top-full z-[100] mt-2 flex flex-col w-full min-w-[280px] sm:min-w-[320px] md:min-w-[360px] max-h-72 overflow-hidden rounded-2xl border border-white/20 bg-[#140e24]/98 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.15)] backdrop-blur-3xl focus:outline-none"
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
                  placeholder="Search district name or code..."
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
              <div className="flex items-center justify-between text-[11px] px-1">
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
                    Clear (All Districts)
                  </button>
                </div>
                <span className="text-gray-400 text-[10px]">
                  {selectedDistricts.length === 0 ? "All selected" : `${selectedDistricts.length} selected`}
                </span>
              </div>
            </div>

            {/* Scrollable District List */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto overscroll-contain p-1 space-y-0.5"
              style={{
                touchAction: "pan-y",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.3) transparent",
              }}
            >
              {filteredDistricts.length === 0 ? (
                loading ? (
                  <div className="p-6 flex items-center justify-center">
                    <ThreeDotsLoader label="Loading districts" dotClassName="bg-cyan-400" />
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">
                    No districts found matching &ldquo;{search}&rdquo;
                  </div>
                )
              ) : (
                filteredDistricts.map((d) => {
                  const code = (d.code || d).toString().trim().toUpperCase();
                  const name = getDistrictName(code) || d.name || code;
                  const isChecked = selectedDistricts.includes(code);

                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => toggleDistrict(code)}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-all ${
                        isChecked
                          ? "bg-purple-600/30 text-white border border-purple-500/40"
                          : "text-gray-200 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                            isChecked
                              ? "border-purple-400 bg-purple-500 text-white"
                              : "border-white/30 bg-white/5"
                          }`}
                        >
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-medium text-white">{name}</span>
                          <span className="ml-1.5 text-[10px] text-purple-300/80 font-mono">
                            {code}
                          </span>
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
                {filteredDistricts.length} {filteredDistricts.length === 1 ? "district" : "districts"}
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
