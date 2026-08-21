import * as cheerio from 'cheerio';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

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

async function scrapeCollege(collegeCode) {
  const jar = new CookieJar();
  const initRes = await fetch("https://tgicet.nic.in/default.aspx", {
    headers: { "User-Agent": userAgent },
  });
  jar.addCookies(initRes.headers.get("set-cookie"));
  jar.addCookies(initRes.headers.getSetCookie?.());

  const getRes = await fetch('https://tgicet.nic.in/college_allotment.aspx', {
    headers: { 
      'User-Agent': userAgent,
      'Referer': 'https://tgicet.nic.in/default.aspx',
      'Cookie': jar.getCookieString()
    }
  });
  jar.addCookies(getRes.headers.get("set-cookie"));
  jar.addCookies(getRes.headers.getSetCookie?.());

  const getHtml = await getRes.text();
  let $ = cheerio.load(getHtml);

  let viewState = $("input[name='__VIEWSTATE']").val();
  let viewStateGen = $("input[name='__VIEWSTATEGENERATOR']").val();
  let eventValidation = $("input[name='__EVENTVALIDATION']").val();

  // 1. PostBack to select College
  const body1 = new URLSearchParams();
  body1.set('__EVENTTARGET', 'SMPage$MainContent$DropDownList1');
  body1.set('__EVENTARGUMENT', '');
  body1.set('__LASTFOCUS', '');
  body1.set('__VIEWSTATE', viewState);
  if (viewStateGen) body1.set('__VIEWSTATEGENERATOR', viewStateGen);
  if (eventValidation) body1.set('__EVENTVALIDATION', eventValidation);
  body1.set('SMPage$MainContent$DropDownList1', collegeCode);

  const postRes1 = await fetch('https://tgicet.nic.in/college_allotment.aspx', {
    method: 'POST',
    headers: {
      'User-Agent': userAgent,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://tgicet.nic.in/college_allotment.aspx',
      'Cookie': jar.getCookieString()
    },
    body: body1.toString()
  });
  jar.addCookies(postRes1.headers.get("set-cookie"));
  jar.addCookies(postRes1.headers.getSetCookie?.());

  const html2 = await postRes1.text();
  $ = cheerio.load(html2);

  viewState = $("input[name='__VIEWSTATE']").val();
  viewStateGen = $("input[name='__VIEWSTATEGENERATOR']").val();
  eventValidation = $("input[name='__EVENTVALIDATION']").val();

  const branches = [];
  $("select[name='SMPage$MainContent$DropDownList2'] option").each((_, opt) => {
    const val = $(opt).val()?.trim();
    const text = $(opt).text()?.trim();
    if (val && !text.toLowerCase().includes('select')) {
      branches.push({ code: val, name: text });
    }
  });

  console.log(`College ${collegeCode} branches:`, branches);

  for (const br of branches) {
    // 2. PostBack to get Allotments
    const body2 = new URLSearchParams();
    body2.set('__EVENTTARGET', '');
    body2.set('__EVENTARGUMENT', '');
    body2.set('__LASTFOCUS', '');
    body2.set('__VIEWSTATE', viewState);
    if (viewStateGen) body2.set('__VIEWSTATEGENERATOR', viewStateGen);
    if (eventValidation) body2.set('__EVENTVALIDATION', eventValidation);
    body2.set('SMPage$MainContent$DropDownList1', collegeCode);
    body2.set('SMPage$MainContent$DropDownList2', br.code);
    body2.set('SMPage$MainContent$btn_allot', 'Show Allotments');

    const postRes2 = await fetch('https://tgicet.nic.in/college_allotment.aspx', {
      method: 'POST',
      headers: {
        'User-Agent': userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://tgicet.nic.in/college_allotment.aspx',
        'Cookie': jar.getCookieString()
      },
      body: body2.toString()
    });

    const html3 = await postRes2.text();
    const $$ = cheerio.load(html3);

    const rows = [];
    $$("table tr").each((i, tr) => {
      const cells = $$(tr).find('td, th').map((_, td) => $$(td).text().trim().replace(/\s+/g, ' ')).get();
      if (cells.length >= 4) {
        rows.push(cells);
      }
    });

    console.log(`>>> ${collegeCode} [${br.code} - ${br.name}]: Scraped ${rows.length} rows!`);
    if (rows.length > 0) {
      console.log('Sample row 0:', rows[0]);
      console.log('Sample row 1:', rows[1]);
    }
  }
}

async function run() {
  await scrapeCollege('ACPN');
  console.log('---');
  await scrapeCollege('OUCB');
}

run();
