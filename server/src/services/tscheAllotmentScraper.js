import * as cheerio from "cheerio";

// Cache scraped results in memory/process to avoid repetitive TSCHE portal hits
const SCRAPE_CACHE = new Map();

/**
 * Helper to manage cookie jar across ASP.NET redirects & postbacks
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
 * Scrapes official real allotment candidate list from https://tgeapcet.nic.in/college_allotment.aspx
 * @param {string} collegeCode e.g. "CBIT", "JNTH", "OUCE", "VNRV"
 * @param {string} branchCode e.g. "CIV", "CSE", "CSM", "INF", "ECE", "EEE", "MEC"
 */
export async function scrapeOfficialTscheAllotment(collegeCode = "CBIT", branchCode = "CIV") {
  const cacheKey = `${collegeCode.toUpperCase()}_${branchCode.toUpperCase()}`;
  if (SCRAPE_CACHE.has(cacheKey)) {
    return SCRAPE_CACHE.get(cacheKey);
  }

  const jar = new CookieJar();
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  try {
    // 1. Initial GET to obtain session cookie from Default.aspx
    const initRes = await fetch("https://tgeapcet.nic.in/Default.aspx", {
      headers: {
        "User-Agent": userAgent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    jar.addCookies(initRes.headers.get("set-cookie"));
    jar.addCookies(initRes.headers.getSetCookie?.());

    // 2. GET college_allotment.aspx
    const getRes = await fetch("https://tgeapcet.nic.in/college_allotment.aspx", {
      headers: {
        "User-Agent": userAgent,
        "Referer": "https://tgeapcet.nic.in/Default.aspx",
        "Cookie": jar.getCookieString()
      }
    });
    jar.addCookies(getRes.headers.get("set-cookie"));
    jar.addCookies(getRes.headers.getSetCookie?.());

    let html = await getRes.text();
    let $ = cheerio.load(html);

    let viewState = $('input[name="__VIEWSTATE"]').val();
    let viewStateGen = $('input[name="__VIEWSTATEGENERATOR"]').val();
    let eventValidation = $('input[name="__EVENTVALIDATION"]').val();

    if (!viewState) {
      throw new Error("ViewState not found on official portal.");
    }

    const collegeSelectName = $('select').first().attr('name') || 'SMPage$MainContent$DropDownList1';
    const branchSelectName = $('select').eq(1).attr('name') || 'SMPage$MainContent$DropDownList2';

    // 3. POST to trigger AutoPostBack for College selection (loads corresponding branches)
    const formParams1 = new URLSearchParams();
    formParams1.append('__EVENTTARGET', collegeSelectName);
    formParams1.append('__EVENTARGUMENT', '');
    formParams1.append('__LASTFOCUS', '');
    formParams1.append('__VIEWSTATE', viewState);
    if (viewStateGen) formParams1.append('__VIEWSTATEGENERATOR', viewStateGen);
    if (eventValidation) formParams1.append('__EVENTVALIDATION', eventValidation);
    formParams1.append(collegeSelectName, collegeCode.toUpperCase());
    formParams1.append(branchSelectName, '');

    const post1Res = await fetch("https://tgeapcet.nic.in/college_allotment.aspx", {
      method: 'POST',
      headers: {
        'User-Agent': userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://tgeapcet.nic.in/college_allotment.aspx',
        'Cookie': jar.getCookieString()
      },
      body: formParams1.toString()
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
    const btnName = btn.attr('name') || 'SMPage$MainContent$btnSubmit';
    const btnVal = btn.attr('value') || 'Show Allotments';

    const formParams2 = new URLSearchParams();
    formParams2.append('__VIEWSTATE', viewState);
    if (viewStateGen) formParams2.append('__VIEWSTATEGENERATOR', viewStateGen);
    if (eventValidation) formParams2.append('__EVENTVALIDATION', eventValidation);
    formParams2.append(collegeSelectName, collegeCode.toUpperCase());
    formParams2.append(branchSelectName, branchCode.toUpperCase());
    formParams2.append(btnName, btnVal);

    const post2Res = await fetch("https://tgeapcet.nic.in/college_allotment.aspx", {
      method: 'POST',
      headers: {
        'User-Agent': userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://tgeapcet.nic.in/college_allotment.aspx',
        'Cookie': jar.getCookieString()
      },
      body: formParams2.toString()
    });
    jar.addCookies(post2Res.headers.get("set-cookie"));

    html = await post2Res.text();
    $ = cheerio.load(html);

    console.log("Post 2 Status:", post2Res.status, "HTML Length:", html.length);
    if (html.includes("ErrorPage.aspx") || html.length < 2000) {
      console.log("Post 2 Error HTML Preview:", html);
    }

    // Extract table rows
    const candidates = [];
    $('table tr').each((i, tr) => {
      const tds = $(tr).find('td');
      if (tds.length >= 7) {
        const rollNo = $(tds[1]).text().trim();
        const rankText = $(tds[2]).text().trim().replace(/,/g, '');
        const rank = parseFloat(rankText);
        const candidateName = $(tds[3]).text().trim();
        const gender = $(tds[4]).text().trim();
        const category = $(tds[5]).text().trim();
        const region = $(tds[6]).text().trim();
        const seatCategory = $(tds[7]).text().trim();

        if (rollNo && !isNaN(rank) && candidateName) {
          candidates.push({
            rollNo,
            rank: Math.round(rank),
            candidateName,
            gender: gender.toUpperCase().startsWith('F') ? 'F' : 'M',
            category,
            region,
            seatCategory
          });
        }
      }
    });

    console.log(`[TSCHE Scraper] Scraped ${candidates.length} candidates for ${collegeCode} ${branchCode}`);

    if (candidates.length === 0) {
      return null;
    }

    // Sort by rank
    candidates.sort((a, b) => a.rank - b.rank);

    const totalSeats = candidates.length;
    const openingRank = candidates[0].rank;
    const closingRank = candidates[candidates.length - 1].rank;
    const maleCount = candidates.filter(c => c.gender === "M").length;
    const femaleCount = candidates.filter(c => c.gender === "F").length;

    const categoryCounts = {};
    candidates.forEach(c => {
      categoryCounts[c.seatCategory] = (categoryCounts[c.seatCategory] || 0) + 1;
    });

    const categoryClosingRanks = {};
    candidates.forEach(c => {
      if (!categoryClosingRanks[c.seatCategory] || c.rank > categoryClosingRanks[c.seatCategory].closingRank) {
        categoryClosingRanks[c.seatCategory] = {
          seatCategory: c.seatCategory,
          closingRank: c.rank,
          openingRank: categoryClosingRanks[c.seatCategory]?.openingRank || c.rank
        };
      }
    });

    const result = {
      isOfficialLiveScraped: true,
      source: "https://tgeapcet.nic.in/college_allotment.aspx",
      totalSeats,
      openingRank,
      closingRank,
      genderSplit: {
        male: maleCount,
        female: femaleCount,
        malePercent: Math.round((maleCount / totalSeats) * 100),
        femalePercent: Math.round((femaleCount / totalSeats) * 100)
      },
      categoryCounts,
      categoryClosingRanks: Object.values(categoryClosingRanks).sort((a, b) => a.closingRank - b.closingRank),
      candidates
    };

    SCRAPE_CACHE.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[TSCHE Scraper] Error scraping ${collegeCode} ${branchCode}:`, err.message);
    return null;
  }
}
