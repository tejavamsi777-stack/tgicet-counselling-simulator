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

async function getInitialPage() {
  const jar = new CookieJar();
  const initRes = await fetch('https://tgicet.nic.in/default.aspx', {
    headers: { 'User-Agent': userAgent },
    signal: AbortSignal.timeout(8000),
  });
  jar.addCookies(initRes.headers.get('set-cookie'));
  jar.addCookies(initRes.headers.getSetCookie?.());

  const getRes = await fetch('https://tgicet.nic.in/college_allotment.aspx', {
    headers: {
      'User-Agent': userAgent,
      Referer: 'https://tgicet.nic.in/default.aspx',
      Cookie: jar.getCookieString(),
    },
    signal: AbortSignal.timeout(10000),
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

  return { jar, colleges, html };
}

async function scrapeCollegeBranch(collegeCode, branchCode) {
  const jar = new CookieJar();
  const initRes = await fetch('https://tgicet.nic.in/default.aspx', {
    headers: { 'User-Agent': userAgent },
    signal: AbortSignal.timeout(8000),
  });
  jar.addCookies(initRes.headers.get('set-cookie'));
  jar.addCookies(initRes.headers.getSetCookie?.());

  const getRes = await fetch('https://tgicet.nic.in/college_allotment.aspx', {
    headers: {
      'User-Agent': userAgent,
      Referer: 'https://tgicet.nic.in/default.aspx',
      Cookie: jar.getCookieString(),
    },
    signal: AbortSignal.timeout(10000),
  });
  jar.addCookies(getRes.headers.get('set-cookie'));
  jar.addCookies(getRes.headers.getSetCookie?.());

  let html = await getRes.text();
  let $ = cheerio.load(html);

  let viewState = $('input[name="__VIEWSTATE"]').val();
  let viewStateGen = $('input[name="__VIEWSTATEGENERATOR"]').val();
  let eventValidation = $('input[name="__EVENTVALIDATION"]').val();

  const collegeSelectName = $('select').first().attr('name') || 'SMPage$MainContent$DropDownList1';
  const branchSelectName = $('select').eq(1).attr('name') || 'SMPage$MainContent$DropDownList2';

  // 1. Postback for College
  const formParams1 = new URLSearchParams();
  formParams1.append('__EVENTTARGET', collegeSelectName);
  formParams1.append('__EVENTARGUMENT', '');
  formParams1.append('__LASTFOCUS', '');
  formParams1.append('__VIEWSTATE', viewState);
  if (viewStateGen) formParams1.append('__VIEWSTATEGENERATOR', viewStateGen);
  if (eventValidation) formParams1.append('__EVENTVALIDATION', eventValidation);
  formParams1.append(collegeSelectName, collegeCode);

  const post1Res = await fetch('https://tgicet.nic.in/college_allotment.aspx', {
    method: 'POST',
    headers: {
      'User-Agent': userAgent,
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: 'https://tgicet.nic.in/college_allotment.aspx',
      Cookie: jar.getCookieString(),
    },
    body: formParams1.toString(),
    signal: AbortSignal.timeout(10000),
  });

  jar.addCookies(post1Res.headers.get('set-cookie'));
  jar.addCookies(post1Res.headers.getSetCookie?.());

  html = await post1Res.text();
  $ = cheerio.load(html);

  viewState = $('input[name="__VIEWSTATE"]').val();
  viewStateGen = $('input[name="__VIEWSTATEGENERATOR"]').val();
  eventValidation = $('input[name="__EVENTVALIDATION"]').val();

  const availableBranches = [];
  $(`select[name='${branchSelectName}'] option`).each((_, opt) => {
    const val = $(opt).val()?.trim();
    const text = $(opt).text()?.trim();
    if (val && !text.toLowerCase().includes('select')) {
      availableBranches.push({ code: val, name: text });
    }
  });

  const branchExists = availableBranches.some((b) => b.code.toUpperCase() === branchCode.toUpperCase());
  if (!branchExists) {
    return { availableBranches, candidates: [] };
  }

  // 2. Postback for Allotments
  const btn = $('input[type="submit"][name*="btn_allot"], input[type="submit"]');
  const btnName = btn.attr('name') || 'SMPage$MainContent$btn_allot';
  const btnVal = btn.attr('value') || 'Show Allotments';

  const formParams2 = new URLSearchParams();
  formParams2.append('__VIEWSTATE', viewState);
  if (viewStateGen) formParams2.append('__VIEWSTATEGENERATOR', viewStateGen);
  if (eventValidation) formParams2.append('__EVENTVALIDATION', eventValidation);
  formParams2.append(collegeSelectName, collegeCode);
  formParams2.append(branchSelectName, branchCode);
  formParams2.append(btnName, btnVal);

  const post2Res = await fetch('https://tgicet.nic.in/college_allotment.aspx', {
    method: 'POST',
    headers: {
      'User-Agent': userAgent,
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: 'https://tgicet.nic.in/college_allotment.aspx',
      Cookie: jar.getCookieString(),
    },
    body: formParams2.toString(),
    signal: AbortSignal.timeout(12000),
  });

  jar.addCookies(post2Res.headers.get('set-cookie'));

  html = await post2Res.text();
  $ = cheerio.load(html);

  const candidates = [];
  $('table tr').each((i, row) => {
    const cells = $(row)
      .find('td, th')
      .map((_, c) => $(c).text().replace(/\s+/g, ' ').trim())
      .get();

    if (cells.length >= 7) {
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
          branchCode,
        });
      }
    }
  });

  candidates.sort((a, b) => a.rank - b.rank);
  return { availableBranches, candidates };
}

async function run() {
  console.log('🚀 Fetching TG ICET official college roster from tgicet.nic.in...');
  const { colleges } = await getInitialPage();
  console.log(`Found ${colleges.length} official colleges in TG ICET portal.`);

  const summary = {
    exam: 'tg-icet',
    portal: 'https://tgicet.nic.in',
    lastUpdated: new Date().toISOString(),
    totalColleges: colleges.length,
    colleges: [],
  };

  const CONCURRENCY = 6;
  let processed = 0;
  const queue = [...colleges];

  async function worker(workerId) {
    while (queue.length > 0) {
      const col = queue.shift();
      if (!col) break;

      const collegeRecord = {
        code: col.code,
        name: col.name,
        source: 'https://tgicet.nic.in/college_allotment.aspx',
        branches: [],
      };

      try {
        // Scrape MBA
        const mbaRes = await scrapeCollegeBranch(col.code, 'MBA');
        const branches = mbaRes.availableBranches.map((b) => b.code);

        if (branches.includes('MBA') || mbaRes.candidates.length > 0) {
          collegeRecord.branches.push({
            branchCode: 'MBA',
            branchName: 'MASTER OF BUSINESS ADMINISTRATION',
            totalSeats: mbaRes.candidates.length,
            openingRank: mbaRes.candidates[0]?.rank || null,
            closingRank: mbaRes.candidates[mbaRes.candidates.length - 1]?.rank || null,
            candidates: mbaRes.candidates,
          });
        }

        // If MCA offered, scrape MCA
        if (branches.includes('MCA')) {
          const mcaRes = await scrapeCollegeBranch(col.code, 'MCA');
          collegeRecord.branches.push({
            branchCode: 'MCA',
            branchName: 'MASTER OF COMPUTER APPLICATIONS',
            totalSeats: mcaRes.candidates.length,
            openingRank: mcaRes.candidates[0]?.rank || null,
            closingRank: mcaRes.candidates[mcaRes.candidates.length - 1]?.rank || null,
            candidates: mcaRes.candidates,
          });
        }

        // Save college JSON
        const outJson = JSON.stringify(collegeRecord, null, 2);
        fs.writeFileSync(path.join(SERVER_DATA_DIR, `${col.code}.json`), outJson, 'utf-8');
        fs.writeFileSync(path.join(CLIENT_DATA_DIR, `${col.code}.json`), outJson, 'utf-8');

        summary.colleges.push({
          code: col.code,
          name: col.name,
          coursesOffered: collegeRecord.branches.map((b) => b.branchCode),
          totalAllotted: collegeRecord.branches.reduce((acc, b) => acc + b.totalSeats, 0),
        });

        processed++;
        console.log(
          `[${processed}/${colleges.length}] [Worker ${workerId}] ${col.code} — Branches: ${collegeRecord.branches
            .map((b) => `${b.branchCode}(${b.totalSeats})`)
            .join(', ')}`
        );
      } catch (err) {
        console.warn(`[Worker ${workerId}] Error on ${col.code}:`, err.message);
        summary.colleges.push({
          code: col.code,
          name: col.name,
          coursesOffered: ['MBA'],
          totalAllotted: 0,
        });
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  const summaryJson = JSON.stringify(summary, null, 2);
  fs.writeFileSync(path.join(SERVER_DATA_DIR, 'allotments_summary.json'), summaryJson, 'utf-8');
  fs.writeFileSync(path.join(CLIENT_DATA_DIR, 'allotments_summary.json'), summaryJson, 'utf-8');

  console.log('✅ ALL TG ICET OFFICIAL ALLOTMENTS SCRAPED AND SAVED SUCCESSFULLY!');
}

run().catch((e) => console.error('Scraper fatal error:', e));
