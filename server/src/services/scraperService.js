import * as cheerio from "cheerio";
import { pool } from "../config/database.js";

const TGEAPCET_DEFAULT_URL = "https://tgeapcet.nic.in/default.aspx";
const TGEAPCET_BASE = "https://tgeapcet.nic.in";

async function fetchHtml(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status} from ${url}`);
    return await resp.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Scrapes official notifications, circulars and PDF links from tgeapcet.nic.in
 */
export async function scrapeEapcetNotifications() {
  try {
    const html = await fetchHtml(TGEAPCET_DEFAULT_URL);
    const $ = cheerio.load(html);
    const notifications = [];

    $("a").each((_, el) => {
      const title = $(el).text().replace(/\s+/g, " ").trim();
      let href = $(el).attr("href");
      if (!title || !href || href === "#" || href.startsWith("javascript:")) return;

      if (!href.startsWith("http")) {
        href = href.startsWith("/") ? `${TGEAPCET_BASE}${href}` : `${TGEAPCET_BASE}/${href}`;
      }

      const isPdf = href.toLowerCase().endsWith(".pdf");
      const isNotice = title.toUpperCase().includes("NOTIFICATION") ||
                       title.toUpperCase().includes("ORDER") ||
                       title.toUpperCase().includes("LIST") ||
                       title.toUpperCase().includes("ALLOTMENT") ||
                       title.toUpperCase().includes("SCHEDULE") ||
                       title.toUpperCase().includes("VACANCY") ||
                       title.toUpperCase().includes("ADMISSION") ||
                       isPdf;

      if (isNotice && !notifications.some(n => n.url === href)) {
        notifications.push({
          title,
          url: href,
          isPdf,
          source: "tgeapcet.nic.in",
          scrapedAt: new Date().toISOString()
        });
      }
    });

    console.log(`[Scraper] Scraped ${notifications.length} official items from tgeapcet.nic.in`);
    return notifications;
  } catch (err) {
    console.error("[Scraper] scrapeEapcetNotifications error:", err.message);
    return [];
  }
}

/**
 * Persist scraped data into DB cache table
 */
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
    console.error(`[Scraper] DB persist error for key ${key}:`, err.message);
  }
}

/**
 * Read from DB cache
 */
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
    console.error(`[Scraper] DB get error for key ${key}:`, err.message);
    return null;
  }
}

/**
 * Main refresh runner
 */
export async function runEapcetScrapeRefresh() {
  console.log("[Scraper] Starting live TG EAPCET refresh...");
  const notifications = await scrapeEapcetNotifications();
  await persistEapcetCache("notifications", notifications);
  console.log("[Scraper] TG EAPCET refresh complete.");
  return { notifications };
}
