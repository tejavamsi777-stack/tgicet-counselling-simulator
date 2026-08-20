import { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "-- Select an option --",
  searchPlaceholder = "Type to search...",
  disabled = false,
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

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => {
      const valMatch = String(opt.value || "").toLowerCase().includes(q);
      const labelMatch = String(opt.label || "").toLowerCase().includes(q);
      const subMatch = opt.sublabel ? String(opt.sublabel).toLowerCase().includes(q) : false;
      return valMatch || labelMatch || subMatch;
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
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all duration-200 cursor-pointer ${
          disabled
            ? "border-white/5 bg-white/[0.02] text-white/30 cursor-not-allowed"
            : isOpen
            ? "border-purple-500 bg-purple-950/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]"
            : "border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/[0.08]"
        }`}
      >
        <span className="truncate flex-1 font-medium block">
          {selectedOption ? (
            <span className="text-white truncate block">
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
            className="absolute left-0 right-0 top-full z-[9999] mt-1.5 max-h-80 overflow-hidden rounded-2xl border border-purple-500/40 bg-[#120826] shadow-[0_25px_60px_rgba(0,0,0,0.98),0_0_20px_rgba(168,85,247,0.2)] text-white flex flex-col"
          >
            {/* Search Input Box */}
            <div className="p-2.5 border-b border-white/10 bg-[#0d051c]">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-purple-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-xl border border-white/15 bg-white/5 pl-9 pr-8 py-2 text-xs text-white placeholder-white/40 focus:border-purple-500 focus:bg-purple-950/30 focus:outline-none transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 text-white/40 hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between px-1.5 pt-1.5 text-[10px] text-white/40">
                <span>{filteredOptions.length} of {options.length} matches</span>
                {searchQuery && <span>Press Escape to close</span>}
              </div>
            </div>

            {/* Options List */}
            <div ref={listRef} className="overflow-y-auto max-h-52 p-1.5 space-y-0.5 custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-xs text-white/50">
                  No matching options found for &quot;<span className="text-purple-300 font-semibold">{searchQuery}</span>&quot;
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-purple-600/30 border border-purple-500/40 text-purple-200 font-semibold"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 truncate pr-2">
                        <span className="truncate font-medium text-white">
                          {opt.label}
                        </span>
                        {opt.sublabel && (
                          <span className="text-[11px] text-white/50 truncate">
                            {opt.sublabel}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {opt.count !== undefined && (
                          <span className="rounded-md bg-white/5 border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
                            {opt.count}
                          </span>
                        )}
                        {isSelected && <Check size={14} className="text-purple-400" />}
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
