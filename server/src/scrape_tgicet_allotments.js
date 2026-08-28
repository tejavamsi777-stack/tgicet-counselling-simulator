import * as cheerio from 'cheerio';

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

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

async function testCollegePostback(collegeCode) {
  const jar = new CookieJar();

  // 1. Initial GET
  const getRes = await fetch('https://tgicet.nic.in/college_allotment.aspx', {
    headers: { 'User-Agent': userAgent },
    signal: AbortSignal.timeout(10000)
  });
  jar.addCookies(getRes.headers.get("set-cookie"));
  jar.addCookies(getRes.headers.getSetCookie?.());

  const getHtml = await getRes.text();
  let $ = cheerio.load(getHtml);

  const viewState = $("input[name='__VIEWSTATE']").val();
  const viewStateGen = $("input[name='__VIEWSTATEGENERATOR']").val();
  const eventValidation = $("input[name='__EVENTVALIDATION']").val();
  const ddl1Name = $("select[name*='DropDownList1']").attr('name');
  const ddl2Name = $("select[name*='DropDownList2']").attr('name') || 'SMPage$MainContent$DropDownList2';
  const btnName = $("input[type='submit'][value*='Allotment'], input[type='submit'][value*='Show']").attr('name') || 'SMPage$MainContent$Button1';

  console.log(`Dropdown1: ${ddl1Name}, Dropdown2: ${ddl2Name}, Button: ${btnName}`);

  // 2. POSTBACK to select College & populate Branches
  const body1 = new URLSearchParams();
  body1.set('__EVENTTARGET', ddl1Name);
  body1.set('__EVENTARGUMENT', '');
  body1.set('__LASTFOCUS', '');
  body1.set('__VIEWSTATE', viewState);
  if (viewStateGen) body1.set('__VIEWSTATEGENERATOR', viewStateGen);
  if (eventValidation) body1.set('__EVENTVALIDATION', eventValidation);
  body1.set(ddl1Name, collegeCode);
  body1.set(ddl2Name, '');

  const postRes1 = await fetch('https://tgicet.nic.in/college_allotment.aspx', {
    method: 'POST',
    headers: {
      'User-Agent': userAgent,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://tgicet.nic.in/college_allotment.aspx',
      'Cookie': jar.getCookieString()
    },
    body: body1.toString(),
    signal: AbortSignal.timeout(12000)
  });
  jar.addCookies(postRes1.headers.get("set-cookie"));
  jar.addCookies(postRes1.headers.getSetCookie?.());

  const html2 = await postRes1.text();
  $ = cheerio.load(html2);

  const viewState2 = $("input[name='__VIEWSTATE']").val();
  const eventValidation2 = $("input[name='__EVENTVALIDATION']").val();

  const branches = [];
  $(`select[name='${ddl2Name}'] option`).each((_, opt) => {
    const val = $(opt).val()?.trim();
    const text = $(opt).text()?.trim();
    if (val && !text.toLowerCase().includes('select')) {
      branches.push({ code: val, name: text });
    }
  });

  console.log(`Col ${collegeCode} has ${branches.length} branches:`, branches);

  if (branches.length === 0) return;

  const branchCode = branches[0].code;

  // 3. POSTBACK to click "Show Allotments" button
  const body2 = new URLSearchParams();
  body2.set('__EVENTTARGET', '');
  body2.set('__EVENTARGUMENT', '');
  body2.set('__LASTFOCUS', '');
  body2.set('__VIEWSTATE', viewState2);
  if (viewStateGen) body2.set('__VIEWSTATEGENERATOR', viewStateGen);
  if (eventValidation2) body2.set('__EVENTVALIDATION', eventValidation2);
  body2.set(ddl1Name, collegeCode);
  body2.set(ddl2Name, branchCode);
  body2.set(btnName, 'Show Allotments');

  const postRes2 = await fetch('https://tgicet.nic.in/college_allotment.aspx', {
    method: 'POST',
    headers: {
      'User-Agent': userAgent,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://tgicet.nic.in/college_allotment.aspx',
      'Cookie': jar.getCookieString()
    },
    body: body2.toString(),
    signal: AbortSignal.timeout(15000)
  });

  const html3 = await postRes2.text();
  $ = cheerio.load(html3);

  const rows = [];
  $("table tr").each((i, tr) => {
    const cells = $(tr).find('td').map((_, td) => $(td).text().trim()).get();
    if (cells.length >= 5) {
      rows.push(cells);
    }
  });

  console.log(`Col ${collegeCode} - ${branchCode} returned ${rows.length} allotment records!`);
  if (rows.length > 0) {
    console.log('Header/Sample row:', rows.slice(0, 4));
  }
}

async function run() {
  console.log('Testing college ACPN (Aditya)...');
  await testCollegePostback('ACPN');
  console.log('\nTesting college OUCB (Osmania Univ)...');
  await testCollegePostback('OUCB');
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
