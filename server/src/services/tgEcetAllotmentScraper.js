import * as cheerio from "cheerio";

// Cache scraped results in memory to avoid repetitive government portal hits
const SCRAPE_CACHE = new Map();
let ALL_COLLEGES_CACHE = null;

/**
 * CookieJar helper for multi-step ASP.NET sessions
 */
class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  addCookies(setCookieHeader) {
    if (!setCookieHeader) return;
    const items = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    items.forEach((header) => {
      header.split(",").forEach((part) => {
        const first = part.split(";")[0].trim();
        if (first && first.includes("=")) {
          const [k, v] = first.split("=");
          this.cookies.set(k.trim(), v.trim());
        }
      });
    });
  }

  getCookieString() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }
}

/**
 * Scrapes all available college options from the live TG ECET official portal
 */
export async function scrapeOfficialTgEcetColleges() {
  if (ALL_COLLEGES_CACHE && ALL_COLLEGES_CACHE.length > 0) {
    return ALL_COLLEGES_CACHE;
  }

  const jar = new CookieJar();
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  try {
    const initRes = await fetch("https://tgecet.nic.in/default.aspx", {
      headers: { "User-Agent": userAgent },
      signal: AbortSignal.timeout(5000),
    });
    jar.addCookies(initRes.headers.get("set-cookie"));
    jar.addCookies(initRes.headers.getSetCookie?.());

    const getRes = await fetch("https://tgecet.nic.in/college_allotment.aspx", {
      headers: {
        "User-Agent": userAgent,
        Referer: "https://tgecet.nic.in/default.aspx",
        Cookie: jar.getCookieString(),
      },
      signal: AbortSignal.timeout(6000),
    });

    const html = await getRes.text();
    const $ = cheerio.load(html);

    const colleges = [];
    $("select[name*='DropDownList1'] option, #MainContent_DropDownList1 option").each((_, opt) => {
      const code = $(opt).val()?.trim();
      const name = $(opt).text()?.trim();
      if (code && !name.toLowerCase().includes("select")) {
        colleges.push({ code, name });
      }
    });

    if (colleges.length > 0) {
      ALL_COLLEGES_CACHE = colleges;
      return colleges;
    }
  } catch (err) {
    console.warn("[TG ECET Official Colleges Scraper Warning]:", err.message);
  }

  return [];
}

const CODE_ALIASES = {
  VNRV: "VJEC",
  GRET: "GRRR",
  GRIE: "GRRR",
  JNTJ: "JNKR",
  MATR: "MECS",
  STMT: "MRTN",
  NAWA: "NAWB",
  LORI: "LRDS",
  JBIE: "JBIT",
  MLRS: "MLID",
  MLRIT: "MLID",
  MLRTM: "MLRS",
  INDU: "INDU",
};

/**
 * Scrapes official lateral entry seat allotments directly from https://tgecet.nic.in/college_allotment.aspx
 * @param {string} collegeCode e.g. "CBIT", "JNTH", "OUCE", "VASV", "VJEC", "GRRR", "KMIT"
 * @param {string} branchCode e.g. "CSE", "CSM", "CSD", "INF", "ECE", "EEE", "MEC", "CIV"
 */
export async function scrapeOfficialTgEcetAllotment(collegeCode = "CBIT", branchCode = "CSE") {
  let rawCode = (collegeCode || "CBIT").toUpperCase().trim();
  const code = CODE_ALIASES[rawCode] || rawCode;
  const branch = (branchCode || "CSE").toUpperCase().trim();
  const cacheKey = `${code}_${branch}`;

  if (SCRAPE_CACHE.has(cacheKey)) {
    return SCRAPE_CACHE.get(cacheKey);
  }

  const jar = new CookieJar();
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  try {
    // 1. Initial GET to obtain session cookie from Default.aspx
    const initRes = await fetch("https://tgecet.nic.in/default.aspx", {
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(6000),
    });

    jar.addCookies(initRes.headers.get("set-cookie"));
    jar.addCookies(initRes.headers.getSetCookie?.());

    // 2. GET college_allotment.aspx with Referer & Session
    const getRes = await fetch("https://tgecet.nic.in/college_allotment.aspx", {
      headers: {
        "User-Agent": userAgent,
        Referer: "https://tgecet.nic.in/default.aspx",
        Cookie: jar.getCookieString(),
      },
      signal: AbortSignal.timeout(6000),
    });

    jar.addCookies(getRes.headers.get("set-cookie"));
    jar.addCookies(getRes.headers.getSetCookie?.());

    let html = await getRes.text();
    let $ = cheerio.load(html);

    let viewState = $('input[name="__VIEWSTATE"]').val();
    let viewStateGen = $('input[name="__VIEWSTATEGENERATOR"]').val();
    let eventValidation = $('input[name="__EVENTVALIDATION"]').val();

    if (!viewState) {
      throw new Error("ViewState not returned by tgecet.nic.in portal.");
    }

    const collegeSelectName = $("select").first().attr("name") || "SMPage$MainContent$DropDownList1";
    const branchSelectName = $("select").eq(1).attr("name") || "SMPage$MainContent$DropDownList2";

    // 3. POST to trigger AutoPostBack for College selection (loads branches)
    const formParams1 = new URLSearchParams();
    formParams1.append("__EVENTTARGET", collegeSelectName);
    formParams1.append("__EVENTARGUMENT", "");
    formParams1.append("__LASTFOCUS", "");
    formParams1.append("__VIEWSTATE", viewState);
    if (viewStateGen) formParams1.append("__VIEWSTATEGENERATOR", viewStateGen);
    if (eventValidation) formParams1.append("__EVENTVALIDATION", eventValidation);
    formParams1.append(collegeSelectName, code);

    const post1Res = await fetch("https://tgecet.nic.in/college_allotment.aspx", {
      method: "POST",
      headers: {
        "User-Agent": userAgent,
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://tgecet.nic.in/college_allotment.aspx",
        Cookie: jar.getCookieString(),
      },
      body: formParams1.toString(),
      signal: AbortSignal.timeout(8000),
    });

    jar.addCookies(post1Res.headers.get("set-cookie"));
    jar.addCookies(post1Res.headers.getSetCookie?.());

    html = await post1Res.text();
    $ = cheerio.load(html);

    viewState = $('input[name="__VIEWSTATE"]').val();
    viewStateGen = $('input[name="__VIEWSTATEGENERATOR"]').val();
    eventValidation = $('input[name="__EVENTVALIDATION"]').val();

    // 4. POST to click 'Show Allotments'
    const btn = $('input[type="submit"]').first();
    const btnName = btn.attr("name") || "SMPage$MainContent$btn_allot";
    const btnVal = btn.attr("value") || "Show Allotments";

    const formParams2 = new URLSearchParams();
    formParams2.append("__VIEWSTATE", viewState);
    if (viewStateGen) formParams2.append("__VIEWSTATEGENERATOR", viewStateGen);
    if (eventValidation) formParams2.append("__EVENTVALIDATION", eventValidation);
    formParams2.append(collegeSelectName, code);
    formParams2.append(branchSelectName, branch);
    formParams2.append(btnName, btnVal);

    const post2Res = await fetch("https://tgecet.nic.in/college_allotment.aspx", {
      method: "POST",
      headers: {
        "User-Agent": userAgent,
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://tgecet.nic.in/college_allotment.aspx",
        Cookie: jar.getCookieString(),
      },
      body: formParams2.toString(),
      signal: AbortSignal.timeout(10000),
    });

    jar.addCookies(post2Res.headers.get("set-cookie"));

    html = await post2Res.text();
    $ = cheerio.load(html);

    // 5. Parse Candidate Allotment Table
    const candidates = [];
    $("table tr").each((i, row) => {
      const cells = $(row)
        .find("td, th")
        .map((_, c) => $(c).text().replace(/\s+/g, " ").trim())
        .get();

      if (cells.length >= 7) {
        const [sno, htk, rnk, name, sx, cat, reg, seatCat] = cells;
        const parsedRank = parseFloat(rnk);

        if (!isNaN(parsedRank) && parsedRank > 0 && htk && !htk.toLowerCase().includes("ticket")) {
          candidates.push({
            rank: parsedRank,
            hallTicket: htk,
            name: name || `Candidate ${parsedRank}`,
            gender: sx?.toLowerCase().startsWith("f") ? "Female" : "Male",
            caste: cat || "OC",
            region: reg || "OU",
            seatCategory: seatCat || `${cat}_GEN_OU`,
            branchCode: branch,
          });
        }
      }
    });

    if (candidates.length > 0) {
      candidates.sort((a, b) => a.rank - b.rank);
      const result = {
        collegeCode: code,
        branchCode: branch,
        totalSeats: candidates.length,
        openingRank: candidates[0]?.rank,
        closingRank: candidates[candidates.length - 1]?.rank,
        candidates,
        isLiveScraped: true,
        source: "https://tgecet.nic.in/college_allotment.aspx",
        lastUpdated: new Date().toISOString(),
      };

      SCRAPE_CACHE.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn(`[TG ECET Live Scraper Note (${code} - ${branch})]:`, err.message);
  }

  return null;
}
