/**
 * Google AdSense Central Configuration
 * 
 * Instructions:
 * - Replace the placeholder publisher ID with your approved Google AdSense publisher ID
 *   via the environment variable VITE_GOOGLE_ADSENSE_PUBLISHER_ID (e.g. "ca-pub-1234567890123456")
 *   or directly in this config file.
 * - Create individual Ad Unit slots in your Google AdSense dashboard (Display Ads / In-Article Ads)
 *   and provide their slot IDs below or via env variables.
 */

export const ADSENSE_CONFIG = {
  // Google AdSense Publisher ID (format: ca-pub-XXXXXXXXXXXXXXXX)
  publisherId: import.meta.env.VITE_GOOGLE_ADSENSE_PUBLISHER_ID || "ca-pub-XXXXXXXXXXXXXXXX",

  // Master switch to enable or disable ads across the website
  enabled: import.meta.env.VITE_ENABLE_ADS !== "false",

  // Named Ad Unit Slots configured in Google AdSense
  slots: {
    homeBanner: import.meta.env.VITE_ADSENSE_SLOT_HOME_BANNER || "",
    examBanner: import.meta.env.VITE_ADSENSE_SLOT_EXAM_BANNER || "",
    predictorResults: import.meta.env.VITE_ADSENSE_SLOT_PREDICTOR_RESULTS || "",
    mockCounselling: import.meta.env.VITE_ADSENSE_SLOT_MOCK_COUNSELLING || "",
  },
};

/**
 * Checks whether AdSense is configured with a real (non-placeholder) publisher ID.
 */
export function isAdSenseConfigured() {
  const pubId = ADSENSE_CONFIG.publisherId;
  return Boolean(
    pubId &&
    pubId.startsWith("ca-pub-") &&
    pubId !== "ca-pub-XXXXXXXXXXXXXXXX" &&
    !pubId.includes("XXXX")
  );
}

/**
 * Checks whether ads should be displayed in the current environment.
 */
export function shouldDisplayAds() {
  return ADSENSE_CONFIG.enabled;
}
