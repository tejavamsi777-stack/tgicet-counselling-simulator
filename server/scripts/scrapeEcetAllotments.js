import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

function cleanText(str) {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

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

async function scrapeAllEcetAllotments() {
  console.log('🚀 Starting TG ECET Official College-Wise Allotment Crawler...');

  const outputDir = path.resolve('server/src/data/ecet_allotments');
  const clientDir = path.resolve('client/src/data/ecet_allotments');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  if (!fs.existsSync(clientDir)) fs.mkdirSync(clientDir, { recursive: true });

  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
  const jar = new CookieJar();

  // Step 1: Initial GET to obtain session cookie from Default.aspx
  const initRes = await fetch('https://tgecet.nic.in/default.aspx', {
    headers: { 'User-Agent': userAgent }
  });
  jar.addCookies(initRes.headers.get('set-cookie'));
  jar.addCookies(initRes.headers.getSetCookie?.());

  // Step 2: GET college_allotment.aspx
  const getRes = await fetch('https://tgecet.nic.in/college_allotment.aspx', {
    headers: {
      'User-Agent': userAgent,
      Referer: 'https://tgecet.nic.in/default.aspx',
      Cookie: jar.getCookieString()
    }
  });
  jar.addCookies(getRes.headers.get('set-cookie'));
  jar.addCookies(getRes.headers.getSetCookie?.());

  const getHtml = await getRes.text();
  let $ = cheerio.load(getHtml);

  // Extract all official colleges from DropDownList1
  const institutions = [];
  $('select[name*="DropDownList1"] option, #MainContent_DropDownList1 option').each((_, opt) => {
    const code = $(opt).val()?.trim();
    const name = cleanText($(opt).text());
    if (code && !name.toLowerCase().includes('select')) {
      institutions.push({ code, name });
    }
  });

  console.log(`Loaded ${institutions.length} official institutions to crawl.`);

  // Save the full institution list
  fs.writeFileSync(path.join(outputDir, 'official_institutions.json'), JSON.stringify(institutions, null, 2), 'utf8');
  fs.writeFileSync(path.join(clientDir, 'official_institutions.json'), JSON.stringify(institutions, null, 2), 'utf8');

  let vs = $('#__VIEWSTATE').val();
  let vsg = $('#__VIEWSTATEGENERATOR').val();
  let ev = $('#__EVENTVALIDATION').val();

  const collegeSummaries = [];
  let totalCandidatesAllotted = 0;

  for (let i = 0; i < institutions.length; i++) {
    const inst = institutions[i];
    const collegeCode = inst.code;
    console.log(`[${i + 1}/${institutions.length}] Fetching branches for ${collegeCode} (${inst.name})...`);

    try {
      // Postback to select college & retrieve branches
      const params1 = new URLSearchParams({
        '__EVENTTARGET': 'SMPage$MainContent$DropDownList1',
        '__EVENTARGUMENT': '',
        '__LASTFOCUS': '',
        '__VIEWSTATE': vs,
        '__VIEWSTATEGENERATOR': vsg || '',
        '__EVENTVALIDATION': ev || '',
        'SMPage$MainContent$DropDownList1': collegeCode
      });

      const post1 = await fetch('https://tgecet.nic.in/college_allotment.aspx', {
        method: 'POST',
        headers: {
          'User-Agent': userAgent,
          Referer: 'https://tgecet.nic.in/college_allotment.aspx',
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: jar.getCookieString()
        },
        body: params1.toString()
      });
      jar.addCookies(post1.headers.get('set-cookie'));
      jar.addCookies(post1.headers.getSetCookie?.());

      const html1 = await post1.text();
      const $1 = cheerio.load(html1);

      const vs2 = $1('#__VIEWSTATE').val() || vs;
      const vsg2 = $1('#__VIEWSTATEGENERATOR').val() || vsg;
      const ev2 = $1('#__EVENTVALIDATION').val() || ev;

      // Extract branch options
      const branches = [];
      $1('select[name*="DropDownList2"] option, #MainContent_DropDownList2 option').each((_, opt) => {
        const val = $1(opt).val()?.trim();
        const text = cleanText($1(opt).text());
        if (val && val !== '0' && !text.toLowerCase().includes('select')) {
          branches.push({ code: val, name: text });
        }
      });

      console.log(`   Found ${branches.length} branches for ${collegeCode}`);

      const collegeData = {
        code: collegeCode,
        name: inst.name,
        totalAllotted: 0,
        branches: []
      };

      for (const branch of branches) {
        try {
          const params2 = new URLSearchParams({
            '__VIEWSTATE': vs2,
            '__VIEWSTATEGENERATOR': vsg2 || '',
            '__EVENTVALIDATION': ev2 || '',
            'SMPage$MainContent$DropDownList1': collegeCode,
            'SMPage$MainContent$DropDownList2': branch.code,
            'SMPage$MainContent$btn_allot': 'Show Allotments'
          });

          const post2 = await fetch('https://tgecet.nic.in/college_allotment.aspx', {
            method: 'POST',
            headers: {
              'User-Agent': userAgent,
              Referer: 'https://tgecet.nic.in/college_allotment.aspx',
              'Content-Type': 'application/x-www-form-urlencoded',
              Cookie: jar.getCookieString()
            },
            body: params2.toString()
          });

          const html2 = await post2.text();
          const $2 = cheerio.load(html2);

          const candidates = [];
          $2('table tr').each((_, row) => {
            const cells = $2(row).find('td, th').map((_, c) => cleanText($2(c).text())).get();
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
                  branchCode: branch.code
                });
              }
            }
          });

          if (candidates.length > 0) {
            candidates.sort((a, b) => a.rank - b.rank);
            const branchResult = {
              code: branch.code,
              name: branch.name,
              totalAllotted: candidates.length,
              openingRank: candidates[0]?.rank,
              closingRank: candidates[candidates.length - 1]?.rank,
              candidates
            };
            collegeData.branches.push(branchResult);
            collegeData.totalAllotted += candidates.length;
            totalCandidatesAllotted += candidates.length;
            console.log(`      ✓ ${branch.code}: ${candidates.length} candidates (Ranks ${branchResult.openingRank} - ${branchResult.closingRank})`);
          }
        } catch (err) {
          console.warn(`      ✗ Error for ${collegeCode} ${branch.code}:`, err.message);
        }
      }

      // Save college JSON file
      const collegeJsonPath = path.join(outputDir, `${collegeCode}.json`);
      const clientCollegeJsonPath = path.join(clientDir, `${collegeCode}.json`);
      fs.writeFileSync(collegeJsonPath, JSON.stringify(collegeData, null, 2), 'utf8');
      fs.writeFileSync(clientCollegeJsonPath, JSON.stringify(collegeData, null, 2), 'utf8');

      collegeSummaries.push({
        code: collegeCode,
        name: inst.name,
        totalAllotted: collegeData.totalAllotted,
        branchesCount: collegeData.branches.length
      });

    } catch (err) {
      console.error(`Error processing college ${collegeCode}:`, err.message);
    }
  }

  const summaryData = {
    totalColleges: collegeSummaries.length,
    totalCandidates: totalCandidatesAllotted,
    lastScraped: new Date().toISOString(),
    colleges: collegeSummaries
  };

  fs.writeFileSync(path.join(outputDir, 'allotments_summary.json'), JSON.stringify(summaryData, null, 2), 'utf8');
  fs.writeFileSync(path.join(clientDir, 'allotments_summary.json'), JSON.stringify(summaryData, null, 2), 'utf8');
  console.log(`\n🎉 DONE! Successfully scraped ${totalCandidatesAllotted} official candidates across ${collegeSummaries.length} colleges!`);
}

scrapeAllEcetAllotments().catch(console.error);
