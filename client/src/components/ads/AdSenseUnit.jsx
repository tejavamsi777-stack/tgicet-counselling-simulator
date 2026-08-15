import { useEffect, useRef } from "react";
import { ADSENSE_CONFIG, isAdSenseConfigured, shouldDisplayAds } from "../../config/adsense";

/**
 * Reusable, policy-compliant Google AdSense Ad Unit Component.
 * 
 * Supports responsive sizing, CLS layout reservation, graceful fallback in development,
 * and zero-interference styling.
 */
export default function AdSenseUnit({
  slotId,
  slotName,
  format = "auto",
  responsive = true,
  className = "",
  minHeight = 100,
  label = "Advertisement",
}) {
  const adRef = useRef(null);
  const pushedRef = useRef(false);

  // Resolve slot ID from prop or named slot config
  const activeSlotId = slotId || (slotName ? ADSENSE_CONFIG.slots[slotName] : "") || "";
  const isConfigured = isAdSenseConfigured() && activeSlotId;
  const isEnabled = shouldDisplayAds();

  useEffect(() => {
    if (!isEnabled || !isConfigured || pushedRef.current) {
      return;
    }

    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      }
    } catch (err) {
      console.warn("Google AdSense push notice:", err);
    }
  }, [isEnabled, isConfigured]);

  // If ads are globally disabled, render nothing
  if (!isEnabled) {
    return null;
  }

  // Development / Unconfigured Placeholder Mode
  if (!isConfigured) {
    return (
      <aside
        aria-label="Advertisement placeholder"
        className={`relative mx-auto my-6 w-full max-w-5xl overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-center backdrop-blur-sm transition-all ${className}`}
        style={{ minHeight: `${minHeight}px` }}
      >
        <div className="flex min-h-[70px] flex-col items-center justify-center gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            {label}
          </span>
          <span className="text-xs text-gray-500">
            {slotName ? `Slot: ${slotName}` : "Google AdSense Responsive Unit"}
          </span>
        </div>
      </aside>
    );
  }

  // Production Ad Unit
  return (
    <aside
      aria-label="Advertisement"
      className={`relative mx-auto my-6 w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-center backdrop-blur-sm ${className}`}
      style={{ minHeight: `${minHeight}px` }}
    >
      <div className="mb-1 text-[10px] font-medium uppercase tracking-widest text-gray-400">
        {label}
      </div>
      <div ref={adRef} className="w-full overflow-hidden flex justify-center">
        <ins
          className="adsbygoogle block w-full"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CONFIG.publisherId}
          data-ad-slot={activeSlotId}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      </div>
    </aside>
  );
}
