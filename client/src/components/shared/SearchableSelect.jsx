import { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreeDotsLoader } from "../ui/three-dots-loader";
import { strictMultiFieldMatch } from "../../utils/searchMatch";

export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "-- Select an option --",
  searchPlaceholder = "Type to search...",
  itemLabel = "items",
  disabled = false,
  loading = false,
  loadingLabel = "Loading data...",
  className = "",
  badgeColor = "purple"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.value) === String(value)) || null;
  }, [options, value]);

  // Filter options based on strict prefix & word-boundary search
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    return options.filter((opt) => {
      const fields = [opt.value, opt.label, opt.sublabel].filter(Boolean);
      return strictMultiFieldMatch(fields, searchQuery);
    });
  }, [options, searchQuery]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className={`relative w-full ${isOpen ? 'z-[999]' : 'z-10'} ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all duration-200 cursor-pointer ${
          disabled || loading
            ? "border-white/5 bg-white/[0.02] text-white/30 cursor-not-allowed"
            : isOpen
            ? "border-purple-500 bg-purple-950/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]"
            : "border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/[0.08]"
        }`}
      >
        <span className="flex-1 font-medium block min-w-0">
          {loading ? (
            <ThreeDotsLoader label={loadingLabel} dotClassName="bg-purple-400" />
          ) : selectedOption ? (
            <span
              className="text-white block whitespace-normal break-words leading-tight py-0.5 line-clamp-2"
              title={selectedOption.label}
            >
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-white/40 truncate block">{placeholder}</span>
          )}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedOption && !disabled && (
            <span
              onClick={handleClear}
              className="rounded-full p-0.5 text-white/40 hover:bg-white/10 hover:text-white transition"
              title="Clear selection"
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown
            size={15}
            className={`text-white/50 transition-transform duration-200 ${isOpen ? "rotate-180 text-purple-400" : ""}`}
          />
        </div>
      </button>

      {/* Floating Searchable Menu Dropdown */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-full z-[99999] mt-2 max-h-80 overflow-hidden rounded-2xl border-2 border-purple-500/60 bg-[#0d0718] shadow-[0_30px_90px_rgba(0,0,0,1),0_0_40px_rgba(168,85,247,0.35)] text-white flex flex-col"
            style={{ backgroundColor: '#0d0718', opacity: 1 }}
          >
            {/* Search Input Box */}
            <div className="p-3 border-b border-white/10 bg-[#07030e]" style={{ backgroundColor: '#07030e' }}>
              <div className="relative flex items-center">
                <Search size={15} className="absolute left-3 text-purple-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-xl border border-white/20 bg-white/10 pl-9 pr-8 py-2 text-xs font-medium text-white placeholder-gray-400 focus:border-purple-400 focus:bg-purple-950/40 focus:outline-none transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 text-gray-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between px-1.5 pt-2 text-[11px] text-gray-400">
                <span className="font-semibold text-purple-300">{filteredOptions.length} of {options.length} {itemLabel} found</span>
                {searchQuery && <span className="text-gray-400">Press Esc to close</span>}
              </div>
            </div>

            {/* Options List */}
            <div ref={listRef} className="overflow-y-auto max-h-56 p-2 space-y-1 custom-scrollbar bg-[#0d0718]" style={{ backgroundColor: '#0d0718' }}>
              {filteredOptions.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  No {itemLabel} found matching &quot;<span className="text-purple-300 font-bold">{searchQuery}</span>&quot;
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <button
                      key={`${opt.value || ''}_${idx}`}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs transition-all cursor-pointer ${
                        isSelected
                          ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/40 border border-purple-400"
                          : "bg-white/[0.03] text-gray-200 hover:bg-purple-600/20 hover:text-white hover:border-purple-500/40 border border-transparent"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1 pr-2">
                        <span className="font-semibold text-white text-xs whitespace-normal break-words leading-snug">
                          {opt.label}
                        </span>
                        {opt.sublabel && (
                          <span className="text-[11px] text-gray-400 whitespace-normal break-words leading-snug">
                            {opt.sublabel}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {opt.count !== undefined && (
                          <span className="rounded-md bg-white/10 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-cyan-300 font-bold">
                            {opt.count}
                          </span>
                        )}
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
