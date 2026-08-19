import React, { useState } from "react";
import { SPONSORED_BANNERS } from "../../data/sponsoredBanners";

export function DirectBannerAd({ placement = "hero", className = "" }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Filter active banners matching placement
  const activeBanner = SPONSORED_BANNERS.find(
    (b) => b.active && (b.placements.includes(placement) || b.placements.includes("all"))
  );

  if (!activeBanner) return null;

  const handleBannerClick = () => {
    // Log click event
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "sponsored_banner_click", {
        banner_id: activeBanner.id,
        sponsor_name: activeBanner.sponsorName,
      });
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-slate-900/95 via-emerald-950/40 to-slate-900/95 p-4 sm:p-5 shadow-xl shadow-emerald-950/20 backdrop-blur-md transition-all hover:border-emerald-500/50 ${className}`}
    >
      {/* Top Banner Tag & Close Button */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-emerald-500/10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {activeBanner.badge || "SPONSORED PARTNER"}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
            {activeBanner.sponsorName}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-200 text-xs p-1 rounded-md transition-colors"
          title="Dismiss ad"
        >
          ✕
        </button>
      </div>

      {/* Main Content */}
      <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800/90 border border-emerald-500/30 text-2xl shadow-inner">
            {activeBanner.logo || "🎓"}
          </div>
          <div>
            <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              {activeBanner.headline}
            </h4>
            <p className="mt-0.5 text-xs text-slate-300 line-clamp-2 leading-relaxed">
              {activeBanner.description}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center gap-2">
          <a
            href={activeBanner.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleBannerClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {activeBanner.ctaText || "Enquire Now ↗"}
          </a>
        </div>
      </div>
    </div>
  );
}
