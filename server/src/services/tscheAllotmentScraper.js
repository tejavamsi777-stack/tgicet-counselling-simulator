import * as cheerio from "cheerio";

// Cache scraped results in memory to avoid redundant portal hits
const SCRAPE_CACHE = new Map();

/**
 * Scrapes official real candidate allotment list from https://tgeapcet.nic.in/college_allotment.aspx
 * @param {string} collegeCode e.g. "CBIT", "JNTH", "OUCE", "VASV", "AARM", "VJEC"
 * @param {string} branchCode e.g. "CIV", "CSE", "CSM", "INF", "ECE", "EEE", "MEC", "AIM"
 */
export async function scrapeOfficialTscheAllotment(collegeCode = "CBIT", branchCode = "CIV") {
  const cCode = collegeCode.trim().toUpperCase();
  const bCode = branchCode.trim().toUpperCase();
  const cacheKey = `${cCode}_${bCode}`;

  if (SCRAPE_CACHE.has(cacheKey)) {
    return SCRAPE_CACHE.get(cacheKey);
  }

  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
  const cookies = [];

  const extractCookies = (res) => {
    const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get("set-cookie")];
    for (const c of raw) {
      if (!c) continue;
      const part = c.split(";")[0].trim();
      if (part && !cookies.some(x => x.startsWith(part.split("=")[0] + "="))) {
        cookies.push(part);
      }
    }
  };

  try {
    // 1. Initial GET to obtain session cookie from default.aspx
    const initRes = await fetch("https://tgeapcet.nic.in/default.aspx", {
      headers: {
        "User-Agent": userAgent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    extractCookies(initRes);

    // 2. GET college_allotment.aspx
    const getRes = await fetch("https://tgeapcet.nic.in/college_allotment.aspx", {
      headers: {
        "User-Agent": userAgent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://tgeapcet.nic.in/default.aspx",
        "Cookie": cookies.join("; ")
      }
    });
    extractCookies(getRes);

    let html = await getRes.text();
    let $ = cheerio.load(html);

    let viewState = $('#__VIEWSTATE').val();
    let viewStateGen = $('#__VIEWSTATEGENERATOR').val();
    let eventValidation = $('#__EVENTVALIDATION').val();

    if (!viewState) {
      throw new Error("ViewState not found on official portal.");
    }

    const collegeSelectName = $('select').first().attr('name') || 'SMPage$MainContent$DropDownList1';
    const branchSelectName = $('select').eq(1).attr('name') || 'SMPage$MainContent$DropDownList2';

    // In ASP.NET WebForms, if the target college is already the default selected option (AARM),
    // we must first toggle to another college (ACEG) so that DropDownList1 fires SelectedIndexChanged
    const firstOptionVal = $(`select[name="${collegeSelectName}"] option`).first().attr('value');
    if (cCode === firstOptionVal) {
      const toggleForm = new URLSearchParams();
      toggleForm.append('__EVENTTARGET', collegeSelectName);
      toggleForm.append('__VIEWSTATE', viewState);
      if (viewStateGen) toggleForm.append('__VIEWSTATEGENERATOR', viewStateGen);
      if (eventValidation) toggleForm.append('__EVENTVALIDATION', eventValidation);
      toggleForm.append(collegeSelectName, 'ACEG');

      const toggleRes = await fetch("https://tgeapcet.nic.in/college_allotment.aspx", {
        method: 'POST',
        headers: {
          'User-Agent': userAgent,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': 'https://tgeapcet.nic.in/college_allotment.aspx',
          'Cookie': cookies.join("; ")
        },
        body: toggleForm.toString()
      });
      extractCookies(toggleRes);
      html = await toggleRes.text();
      $ = cheerio.load(html);
      viewState = $('#__VIEWSTATE').val();
      viewStateGen = $('#__VIEWSTATEGENERATOR').val();
      eventValidation = $('#__EVENTVALIDATION').val();
    }

    // 3. POST AutoPostBack for target College selection (loads corresponding branches)
    const formParams1 = new URLSearchParams();
    formParams1.append('__EVENTTARGET', collegeSelectName);
    formParams1.append('__EVENTARGUMENT', '');
    formParams1.append('__LASTFOCUS', '');
    formParams1.append('__VIEWSTATE', viewState);
    if (viewStateGen) formParams1.append('__VIEWSTATEGENERATOR', viewStateGen);
    if (eventValidation) formParams1.append('__EVENTVALIDATION', eventValidation);
    formParams1.append(collegeSelectName, cCode);

    const post1Res = await fetch("https://tgeapcet.nic.in/college_allotment.aspx", {
      method: 'POST',
      headers: {
        'User-Agent': userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://tgeapcet.nic.in/college_allotment.aspx',
        'Origin': 'https://tgeapcet.nic.in',
        'Cookie': cookies.join("; ")
      },
      body: formParams1.toString()
    });
    extractCookies(post1Res);

    html = await post1Res.text();
    $ = cheerio.load(html);

    viewState = $('#__VIEWSTATE').val();
    viewStateGen = $('#__VIEWSTATEGENERATOR').val();
    eventValidation = $('#__EVENTVALIDATION').val();

    // Check available branches for this college
    const availableBranches = [];
    $(`select[name="${branchSelectName}"] option`).each((_, el) => {
      const val = $(el).attr('value');
      const text = $(el).text().trim();
      if (val && val !== '0') {
        availableBranches.push({ val: val.toUpperCase(), text });
      }
    });

    const isBranchAvailable = availableBranches.some(b => b.val === bCode);
    if (!isBranchAvailable && availableBranches.length > 0) {
      console.warn(`[TSCHE Scraper] Branch ${bCode} not offered at ${cCode}. Available: ${availableBranches.map(b => b.val).join(', ')}`);
      return {
        isOfficialLiveScraped: true,
        available: false,
        reason: `Branch ${bCode} is not offered at college ${cCode}.`,
        availableBranches,
        candidates: []
      };
    }

    // 4. POST 'Show Allotments' button click
    const btn = $('input[type="submit"]').first();
    const btnName = btn.attr('name') || 'SMPage$MainContent$btn_allot';
    const btnVal = btn.attr('value') || 'Show Allotments';

    const formParams2 = new URLSearchParams();
    formParams2.append('__VIEWSTATE', viewState);
    if (viewStateGen) formParams2.append('__VIEWSTATEGENERATOR', viewStateGen);
    if (eventValidation) formParams2.append('__EVENTVALIDATION', eventValidation);
    formParams2.append(collegeSelectName, cCode);
    formParams2.append(branchSelectName, bCode);
    formParams2.append(btnName, btnVal);

    const post2Res = await fetch("https://tgeapcet.nic.in/college_allotment.aspx", {
      method: 'POST',
      headers: {
        'User-Agent': userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://tgeapcet.nic.in/college_allotment.aspx',
        'Origin': 'https://tgeapcet.nic.in',
        'Cookie': cookies.join("; ")
      },
      body: formParams2.toString()
    });
    extractCookies(post2Res);

    html = await post2Res.text();
    $ = cheerio.load(html);

    // Extract candidate table rows
    const candidates = [];
    $('table tr').each((i, tr) => {
      const tds = $(tr).find('td');
      if (tds.length >= 7) {
        const sNo = $(tds[0]).text().trim();
        const rollNo = $(tds[1]).text().trim();
        const rankText = $(tds[2]).text().trim().replace(/,/g, '');
        const rank = parseInt(rankText, 10);
        const candidateName = $(tds[3]).text().trim();
        const gender = $(tds[4]).text().trim();
        const category = $(tds[5]).text().trim();
        const region = $(tds[6]).text().trim();
        const seatCategory = $(tds[7]).text().trim();

        if (rollNo && !isNaN(rank) && candidateName && !sNo.toLowerCase().includes('sno') && !sNo.toLowerCase().includes('s.no')) {
          candidates.push({
            sNo: parseInt(sNo, 10) || candidates.length + 1,
            rollNo,
            rank,
            candidateName,
            gender: gender.toUpperCase().startsWith('F') ? 'F' : 'M',
            category,
            region: region || "OU",
            seatCategory
          });
        }
      }
    });

    console.log(`[TSCHE Scraper] Successfully scraped ${candidates.length} official candidates for ${cCode} - ${bCode}`);

    if (candidates.length === 0) {
      return {
        isOfficialLiveScraped: true,
        available: false,
        reason: `No allotment records returned for ${cCode} - ${bCode}.`,
        availableBranches,
        candidates: []
      };
    }

    // Sort by rank ascending
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
      available: true,
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
    console.error(`[TSCHE Scraper] Error scraping ${cCode} - ${bCode}:`, err.message);
    return null;
  }
}
