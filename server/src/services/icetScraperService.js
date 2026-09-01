import { scrapePortalNotifications } from "./scraperService.js";

// In-memory cache for fast lookups
let inMemoryIcetCache = {
  notifications: [],
  schedule: [],
  lastScraped: null,
  sourceUrl: "https://tgicet.nic.in/default.aspx",
};

export async function getIcetScrapeData(force = false) {
  if (!force && inMemoryIcetCache.notifications.length > 0 && inMemoryIcetCache.lastScraped) {
    const age = Date.now() - new Date(inMemoryIcetCache.lastScraped).getTime();
    if (age < 3 * 60 * 1000) {
      return inMemoryIcetCache;
    }
  }

  try {
    const freshNotifs = await scrapePortalNotifications("icet");
    if (freshNotifs && freshNotifs.length > 0) {
      const formatted = freshNotifs.map((item, idx) => ({
        id: item.id || `icet-${idx + 1}`,
        title: item.title,
        url: item.url || item.href,
        fileUrl: item.url || item.href,
        isPdf: item.isPdf || (item.url || "").toLowerCase().endsWith(".pdf"),
        isNew: idx < 3,
        isExternal: item.isExternal,
        badge: item.badge || (item.isPdf ? "PDF NOTICE" : "CIRCULAR"),
        date: new Date().toISOString().split("T")[0],
        source: "TSCHE Official Portal (tgicet.nic.in)",
      }));

      inMemoryIcetCache = {
        notifications: formatted,
        schedule: [],
        lastScraped: new Date().toISOString(),
        sourceUrl: "https://tgicet.nic.in/default.aspx",
      };
      return inMemoryIcetCache;
    }
  } catch (err) {
    console.warn("[ICET Scraper fallback]:", err.message);
  }

  return inMemoryIcetCache;
}

export async function runIcetScrapeRefresh() {
  return getIcetScrapeData(true);
}
