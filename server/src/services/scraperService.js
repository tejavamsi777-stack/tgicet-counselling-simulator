import * as cheerio from "cheerio";
import { pool } from "../config/database.js";

const PORTALS = {
  eapcet: {
    url: "https://tgeapcet.nic.in/default.aspx",
    base: "https://tgeapcet.nic.in",
    cacheKey: "eapcet_notifications",
    source: "tgeapcet.nic.in",
  },
  ecet: {
    url: "https://tgecet.nic.in/default.aspx",
    base: "https://tgecet.nic.in",
    cacheKey: "ecet_notifications",
    source: "tgecet.nic.in",
  },
  icet: {
    url: "https://tgicet.nic.in/default.aspx",
    base: "https://tgicet.nic.in",
    cacheKey: "icet_notifications",
    source: "tgicet.nic.in",
  },
  polycet: {
    url: "https://tgpolycet.nic.in/default.aspx",
    base: "https://tgpolycet.nic.in",
    cacheKey: "polycet_notifications",
    source: "tgpolycet.nic.in",
  },
};

// In-memory hot cache fallback
const inMemoryCache = new Map();

async function fetchHtml(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status} from ${url}`);
    return await resp.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Scrapes official notifications and circulars from an admission portal
 */
export async function scrapePortalNotifications(exam = "eapcet") {
  const config = PORTALS[exam] || PORTALS.eapcet;
  try {
    const html = await fetchHtml(config.url);
    const $ = cheerio.load(html);
    const notifications = [];

    $("a").each((_, el) => {
      const title = $(el).text().replace(/\s+/g, " ").trim();
      let href = $(el).attr("href");
      if (!title || !href || href === "#" || href.startsWith("javascript:")) return;

      if (!href.startsWith("http")) {
        href = href.startsWith("/") ? `${config.base}${href}` : `${config.base}/${href}`;
      }

      const isPdf = href.toLowerCase().endsWith(".pdf");
      const isAllotment =
        href.toLowerCase().includes("college_allotment") ||
        title.toUpperCase().includes("COLLEGE-WISE ALLOTMENT") ||
        title.toUpperCase().includes("ALLOTMENT DETAILS");

      let finalHref = href;
      let isExternal = true;

      if (isAllotment) {
        isExternal = false;
        if (exam === "eapcet") finalHref = "/eapcet/allotments";
        else if (exam === "ecet") finalHref = "/tg-ecet/allotments";
        else if (exam === "polycet") finalHref = "/tg-polycet/allotments";
        else finalHref = "/allotments";
      }

      const isNotice =
        title.toUpperCase().includes("NOTIFICATION") ||
        title.toUpperCase().includes("ORDER") ||
        title.toUpperCase().includes("LIST") ||
        title.toUpperCase().includes("ALLOTMENT") ||
        title.toUpperCase().includes("SCHEDULE") ||
        title.toUpperCase().includes("VACANCY") ||
        title.toUpperCase().includes("ADMISSION") ||
        title.toUpperCase().includes("PRESS") ||
        title.toUpperCase().includes("COUNSELLING") ||
        isAllotment ||
        isPdf;

      if (isNotice && !notifications.some((n => n.url === finalHref || n.title === title))) {
        notifications.push({
          id: `${exam}_${notifications.length + 1}`,
          title,
          url: finalHref,
          href: finalHref,
          isExternal,
          isPdf,
          isNew: notifications.length < 3,
          badge: !isExternal ? "LIVE DATA" : isPdf ? "PDF NOTICE" : "CIRCULAR",
          scrapedAt: new Date().toISOString(),
        });
      }
    });

    // Pre-Ingestion Data Validation Guard
    const isValidStructure = notifications.length >= 2;
    const hasMalformedEntries = notifications.some(n => !n.title || !n.url);

    if (notifications.length === 0 || !isValidStructure || hasMalformedEntries) {
      const errorDetails = notifications.length === 0
        ? "Zero items scraped (portal structural change or fetch block)"
        : hasMalformedEntries
        ? "Malformed entries detected in scraped payload"
        : `Unusually low record count (${notifications.length} items)`;
      
      console.warn(`[Scraper Validation Guard] ⚠️ Ingestion blocked for ${config.source}. Reason: ${errorDetails}. Preserving previous production dataset.`);
      
      // Preserve active production data & return cached fallback
      const cached = inMemoryCache.get(config.cacheKey);
      return cached?.data || [];
    }

    inMemoryCache.set(config.cacheKey, { data: notifications, timestamp: Date.now() });
    await persistEapcetCache(config.cacheKey, notifications);
    console.log(`[Scraper] Successfully scraped & validated ${notifications.length} official items from ${config.source}`);

    return notifications;
  } catch (err) {
    console.warn(`[Scraper Pipeline Error] ${config.source}: ${err.message}. Rolling back to active cache.`);
    const cached = inMemoryCache.get(config.cacheKey);
    return cached?.data || [];
  }
}

export async function scrapeEapcetNotifications() {
  return scrapePortalNotifications("eapcet");
}

export async function persistEapcetCache(key, data) {
  try {
    const json = JSON.stringify(data);
    await pool.query(
      `INSERT INTO eapcet_scrape_cache (cache_key, payload, scraped_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (cache_key)
       DO UPDATE SET payload = EXCLUDED.payload, scraped_at = NOW()`,
      [key, json]
    );
  } catch (err) {
    // silently catch if table not yet migrated
  }
}

export async function getEapcetCache(key) {
  try {
    const { rows } = await pool.query(
      "SELECT payload, scraped_at FROM eapcet_scrape_cache WHERE cache_key = $1",
      [key]
    );
    if (!rows.length) return null;
    const ageMs = Date.now() - new Date(rows[0].scraped_at).getTime();
    return { data: rows[0].payload, ageMs };
  } catch (err) {
    const mem = inMemoryCache.get(key);
    if (mem) return { data: mem.data, ageMs: Date.now() - mem.timestamp };
    return null;
  }
}

export async function runEapcetScrapeRefresh() {
  const notifications = await scrapePortalNotifications("eapcet");
  return { notifications };
}

/**
 * Continuous Live Sync background worker
 * Scrapes official portals every 3 minutes to guarantee true real-time updates
 */
export async function runAllPortalScrapes() {
  for (const exam of ["eapcet", "ecet", "icet", "polycet"]) {
    try {
      await scrapePortalNotifications(exam);
    } catch {
      // Continue next portal
    }
  }
}

let schedulerTimer = null;
export function initLiveScraperScheduler() {
  if (schedulerTimer) return;
  console.log("[Live Sync] Initializing continuous 3-minute official portal sync worker...");
  // Initial run after 5 seconds
  setTimeout(runAllPortalScrapes, 5000);
  // Recurring every 3 minutes
  schedulerTimer = setInterval(runAllPortalScrapes, 3 * 60 * 1000);
}
