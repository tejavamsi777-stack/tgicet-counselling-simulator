import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const SERVER_DATA_DIR = path.resolve(__dirname, '../src/data/icet_allotments');
const CLIENT_DATA_DIR = path.resolve(__dirname, '../../client/src/data/icet_allotments');

fs.mkdirSync(SERVER_DATA_DIR, { recursive: true });
fs.mkdirSync(CLIENT_DATA_DIR, { recursive: true });

const userAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }
  addCookies(setCookieHeader) {
    if (!setCookieHeader) return;
    const items = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    items.forEach((header) => {
      header.split(',').forEach((part) => {
        const first = part.split(';')[0].trim();
        if (first && first.includes('=')) {
          const [k, v] = first.split('=');
          this.cookies.set(k.trim(), v.trim());
        }
      });
    });
  }
  getCookieString() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }
}

async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(options.timeout || 12000),
      });
      return res;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 600 * attempt));
    }
  }
}

async function getInitialPage() {
  const jar = new CookieJar();
  const initRes = await fetchWithRetry('https://tgicet.nic.in/default.aspx', {
    headers: { 'User-Agent': userAgent },
  });
  jar.addCookies(initRes.headers.get('set-cookie'));
  jar.addCookies(initRes.headers.getSetCookie?.());

  const getRes = await fetchWithRetry('https://tgicet.nic.in/college_allotment.aspx', {
    headers: {
      'User-Agent': userAgent,
      Referer: 'https://tgicet.nic.in/default.aspx',
      Cookie: jar.getCookieString(),
    },
  });
  jar.addCookies(getRes.headers.get('set-cookie'));
  jar.addCookies(getRes.headers.getSetCookie?.());

  const html = await getRes.text();
  const $ = cheerio.load(html);

  const colleges = [];
  $("select[name*='DropDownList1'] option, #MainContent_DropDownList1 option").each((_, opt) => {
    const code = $(opt).val()?.trim();
    const name = $(opt).text()?.trim();
    if (code && !name.toLowerCase().includes('select')) {
      colleges.push({ code, name });
    }
  });

  return { colleges, html };
}

async function scrapeCollegeData(collegeCode, collegeName) {
  const jar = new CookieJar();

  // 1. Initial Page Load for session & viewstate
  const initRes = await fetchWithRetry('https://tgicet.nic.in/default.aspx', {
    headers: { 'User-Agent': userAgent },
  });
  jar.addCookies(initRes.headers.get('set-cookie'));
  jar.addCookies(initRes.headers.getSetCookie?.());

  const getRes = await fetchWithRetry('https://tgicet.nic.in/college_allotment.aspx', {
    headers: {
      'User-Agent': userAgent,
      Referer: 'https://tgicet.nic.in/default.aspx',
      Cookie: jar.getCookieString(),
    },
  });
  jar.addCookies(getRes.headers.get('set-cookie'));
  jar.addCookies(getRes.headers.getSetCookie?.());

  let html = await getRes.text();
  let $ = cheerio.load(html);

  let viewState = $('input[name="__VIEWSTATE"]').val() || '';
  let viewStateGen = $('input[name="__VIEWSTATEGENERATOR"]').val() || '';
  let eventValidation = $('input[name="__EVENTVALIDATION"]').val() || '';

  const collegeSelectName = $('select').first().attr('name') || 'SMPage$MainContent$DropDownList1';
  const branchSelectName = $('select').eq(1).attr('name') || 'SMPage$MainContent$DropDownList2';

  // 2. Postback to select College and get its available branches
  const formParams1 = new URLSearchParams();
  formParams1.append('__EVENTTARGET', collegeSelectName);
  formParams1.append('__EVENTARGUMENT', '');
  formParams1.append('__LASTFOCUS', '');
  formParams1.append('__VIEWSTATE', viewState);
  if (viewStateGen) formParams1.append('__VIEWSTATEGENERATOR', viewStateGen);
  if (eventValidation) formParams1.append('__EVENTVALIDATION', eventValidation);
  formParams1.append(collegeSelectName, collegeCode);

  const post1Res = await fetchWithRetry('https://tgicet.nic.in/college_allotment.aspx', {
    method: 'POST',
    headers: {
      'User-Agent': userAgent,
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: 'https://tgicet.nic.in/college_allotment.aspx',
      Cookie: jar.getCookieString(),
    },
    body: formParams1.toString(),
  });

  jar.addCookies(post1Res.headers.get('set-cookie'));
  jar.addCookies(post1Res.headers.getSetCookie?.());

  html = await post1Res.text();
  $ = cheerio.load(html);

  viewState = $('input[name="__VIEWSTATE"]').val() || '';
  viewStateGen = $('input[name="__VIEWSTATEGENERATOR"]').val() || '';
  eventValidation = $('input[name="__EVENTVALIDATION"]').val() || '';

  const branches = [];
  $(`select[name='${branchSelectName}'] option`).each((_, opt) => {
    const val = $(opt).val()?.trim();
    const text = $(opt).text()?.trim();
    if (val && !text.toLowerCase().includes('select')) {
      branches.push({ code: val, name: text });
    }
  });

  const collegeRecord = {
    code: collegeCode,
    name: collegeName,
    source: 'https://tgicet.nic.in/college_allotment.aspx',
    lastUpdated: new Date().toISOString(),
    branches: [],
  };

  // 3. For each available branch, submit postback and parse allotment table
  for (const branch of branches) {
    const btnName = 'SMPage$MainContent$btn_allot';
    const btnVal = 'Show Allotments';

    const formParams2 = new URLSearchParams();
    formParams2.append('__VIEWSTATE', viewState);
    if (viewStateGen) formParams2.append('__VIEWSTATEGENERATOR', viewStateGen);
    if (eventValidation) formParams2.append('__EVENTVALIDATION', eventValidation);
    formParams2.append(collegeSelectName, collegeCode);
    formParams2.append(branchSelectName, branch.code);
    formParams2.append(btnName, btnVal);

    const post2Res = await fetchWithRetry('https://tgicet.nic.in/college_allotment.aspx', {
      method: 'POST',
      headers: {
        'User-Agent': userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
        Referer: 'https://tgicet.nic.in/college_allotment.aspx',
        Cookie: jar.getCookieString(),
      },
      body: formParams2.toString(),
    });

    const branchHtml = await post2Res.text();
    const $$ = cheerio.load(branchHtml);

    const candidates = [];
    $$('table tr').each((_, row) => {
      const cells = $$(row)
        .find('td, th')
        .map((__, c) => $$(c).text().replace(/\s+/g, ' ').trim())
        .get();

      if (cells.length >= 7) {
        // [SNO, HKT_NO, RANK, NAME, SEX, CASTE, REGION, SEAT_CATEGORY]
        const [sno, htk, rnk, name, sx, cat, reg, seatCat] = cells;
        const parsedRank = parseFloat(rnk);

        if (!isNaN(parsedRank) && parsedRank > 0 && htk && !htk.toLowerCase().includes('ticket')) {
          candidates.push({
            rank: parsedRank,
            hallTicket: htk,
            name: name || `Candidate ${parsedRank}`,
            gender: sx?.toLowerCase().startsWith('f') ? 'Female' : 'Male',
            caste: cat || 'OC',
            region: reg || 'OU',
            seatCategory: seatCat || `${cat}_GEN_OU`,
            branchCode: branch.code,
          });
        }
      }
    });

    candidates.sort((a, b) => a.rank - b.rank);

    collegeRecord.branches.push({
      branchCode: branch.code,
      branchName: branch.name,
      totalSeats: candidates.length,
      openingRank: candidates.length > 0 ? candidates[0].rank : null,
      closingRank: candidates.length > 0 ? candidates[candidates.length - 1].rank : null,
      candidates,
    });
  }

  return collegeRecord;
}

async function run() {
  console.log('🚀 Connecting to official TG ICET portal (https://tgicet.nic.in)...');
  const { colleges } = await getInitialPage();
  console.log(`📋 Found ${colleges.length} official institutions listed on tgicet.nic.in.`);

  const summary = {
    exam: 'tg-icet',
    portal: 'https://tgicet.nic.in',
    lastUpdated: new Date().toISOString(),
    totalColleges: colleges.length,
    colleges: [],
  };

  const CONCURRENCY = 8;
  let completed = 0;
  let totalCandidatesAllotted = 0;
  const queue = [...colleges];

  async function worker(workerId) {
    while (queue.length > 0) {
      const col = queue.shift();
      if (!col) break;

      try {
        const collegeData = await scrapeCollegeData(col.code, col.name);

        const collegeTotalAllotted = collegeData.branches.reduce((sum, b) => sum + b.totalSeats, 0);
        totalCandidatesAllotted += collegeTotalAllotted;

        // Save JSON to both server and client data folders
        const outJson = JSON.stringify(collegeData, null, 2);
        fs.writeFileSync(path.join(SERVER_DATA_DIR, `${col.code}.json`), outJson, 'utf-8');
        fs.writeFileSync(path.join(CLIENT_DATA_DIR, `${col.code}.json`), outJson, 'utf-8');

        summary.colleges.push({
          code: col.code,
          name: col.name,
          coursesOffered: collegeData.branches.map((b) => b.branchCode),
          totalAllotted: collegeTotalAllotted,
          branchesSummary: collegeData.branches.map((b) => ({
            code: b.branchCode,
            name: b.branchName,
            totalSeats: b.totalSeats,
            openingRank: b.openingRank,
            closingRank: b.closingRank,
          })),
        });

        completed++;
        const branchSummaryStr = collegeData.branches
          .map((b) => `${b.branchCode}: ${b.totalSeats} seats (Ranks #${b.openingRank || 'N/A'}-#${b.closingRank || 'N/A'})`)
          .join(' | ');

        console.log(`[${completed}/${colleges.length}] [W${workerId}] ${col.code} (${col.name.substring(0, 35)}...) -> ${branchSummaryStr || 'No branches/seats'}`);
      } catch (err) {
        console.error(`❌ [W${workerId}] Failed to scrape ${col.code}:`, err.message);

        // Record minimal summary
        summary.colleges.push({
          code: col.code,
          name: col.name,
          coursesOffered: ['MBA'],
          totalAllotted: 0,
          branchesSummary: [],
        });
      }
    }
  }

  console.log(`⚡ Starting live parallel scrape with ${CONCURRENCY} workers...`);
  const startTime = Date.now();
  const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  // Sort summary by college name / code
  summary.colleges.sort((a, b) => a.code.localeCompare(b.code));

  const summaryJson = JSON.stringify(summary, null, 2);
  fs.writeFileSync(path.join(SERVER_DATA_DIR, 'allotments_summary.json'), summaryJson, 'utf-8');
  fs.writeFileSync(path.join(CLIENT_DATA_DIR, 'allotments_summary.json'), summaryJson, 'utf-8');

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 SCRAPING COMPLETE in ${durationSec}s!`);
  console.log(`📊 Summary: ${completed}/${colleges.length} colleges scraped.`);
  console.log(`👥 Total Candidates Allotted across all colleges: ${totalCandidatesAllotted.toLocaleString()}`);
  console.log(`📁 Files updated in:`);
  console.log(`   - ${SERVER_DATA_DIR}`);
  console.log(`   - ${CLIENT_DATA_DIR}`);
}

run().catch((err) => {
  console.error('Fatal scrape error:', err);
  process.exit(1);
});
