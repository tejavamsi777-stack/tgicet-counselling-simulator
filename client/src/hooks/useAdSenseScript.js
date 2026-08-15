import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ADSENSE_CONFIG, isAdSenseConfigured } from "../config/adsense";

// Routes where AdSense script must NEVER be injected (admin, auth, private)
const EXCLUDED_ROUTE_PREFIXES = [
  "/admin",
  "/login",
  "/forgot-password",
  "/reset-password",
];

export function useAdSenseScript() {
  const location = useLocation();

  useEffect(() => {
    if (!ADSENSE_CONFIG.enabled || !isAdSenseConfigured()) {
      return;
    }

    // Check if the current route is excluded
    const isExcluded = EXCLUDED_ROUTE_PREFIXES.some((prefix) =>
      location.pathname.startsWith(prefix)
    );

    if (isExcluded) {
      return;
    }

    const scriptId = "google-adsense-script";
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.publisherId}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }, [location.pathname]);
}
