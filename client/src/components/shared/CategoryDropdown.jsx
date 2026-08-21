import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ChevronDown, Check } from "lucide-react";
import { useReferenceData, sortCategories } from "../../hooks/useReferenceData";

export default function CategoryDropdown({ category, setCategory, examSlug = "tg-icet" }) {
  const { categories: rawCategories } = useReferenceData(examSlug);
  const categories = sortCategories(rawCategories);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
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
    if (open && listRef.current) {
      const activeEl = listRef.current.querySelector("[data-selected='true']");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [open]);

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    const codes = categories.map((c) => c.code || c);
    const currentIndex = codes.indexOf(category);

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = currentIndex < codes.length - 1 ? currentIndex + 1 : 0;
      setCategory(codes[nextIdx]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIdx = currentIndex > 0 ? currentIndex - 1 : codes.length - 1;
      setCategory(codes[prevIdx]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(false);
    }
  }

  const selectedCat = categories.find((c) => (c.code || c) === category);
  const displayName = selectedCat ? (selectedCat.name || selectedCat.code || selectedCat) : category;

  return (
    <div className={`relative ${open ? "z-50" : "z-10"}`} ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between rounded-2xl border border-white/20 bg-white/10 pl-10 pr-3.5 text-sm font-medium text-white outline-none backdrop-blur-2xl transition-all hover:border-white/40 hover:bg-white/15 focus:border-white/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
      >
        <span className="truncate">
          {category === "" ? <span className="text-gray-400">Select</span> : displayName}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-300 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <Users
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
      />

      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="absolute left-0 right-0 z-[100] mt-2 max-h-80 overflow-y-auto overscroll-contain rounded-2xl border border-white/20 bg-[#1a1030]/95 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.15)] backdrop-blur-3xl focus:outline-none"
            style={{
              touchAction: "pan-y",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.3) transparent",
            }}
          >
            {categories.length === 0 ? (
              <div className="px-4 py-3 text-center text-xs font-medium text-gray-300">
                Loading categories…
              </div>
            ) : (
              categories.map((c) => {
                const code = c.code || c;
                const isSelected = category === code;
                return (
                  <button
                    key={code}
                    type="button"
                    data-selected={isSelected}
                    onClick={() => {
                      setCategory(code);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-white/25 text-white font-bold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]"
                        : "text-gray-200 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    <span>{c.name || code}</span>
                    {isSelected && <Check size={15} className="text-purple-300 shrink-0" />}
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}