const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function postForm(url, data) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams(data).toString();
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0'
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

async function scrapeAll() {
  console.log('Fetching college options from official TG PGECET portal...');
  const mainHtml = await fetchUrl('https://pgecetadm.tgche.ac.in/Allot26/info/allotmentlist');
  const selectMatch = mainHtml.match(/<select[^>]*id="collcode"[^>]*>([\s\S]*?)<\/select>/i);
  if (!selectMatch) {
    console.error('Could not find collcode select element');
    return;
  }

  const options = [...selectMatch[1].matchAll(/<option[^>]*value=["']([^"']+)["'][^>]*>([\s\S]*?)<\/option>/gi)]
    .map(m => ({ value: m[1], text: decodeHtml(m[2]) }))
    .filter(o => o.value && o.value !== '-Select-');

  console.log(`Found ${options.length} college+course streams to scrape.`);

  const allRecords = [];
  const institutionsMap = {};
  const branchesSet = new Set();

  const BATCH_SIZE = 10;
  for (let i = 0; i < options.length; i += BATCH_SIZE) {
    const batch = options.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${i + 1} to ${Math.min(i + BATCH_SIZE, options.length)} of ${options.length}...`);

    await Promise.all(batch.map(async (opt) => {
      try {
        const fullText = opt.text;
        // Parse format: "COLLEGE NAME LOCATION - COURSE NAME - TYPE"
        const parts = fullText.split(' - ').map(s => s.trim());
        const collFullName = parts[0] || '';
        const branchName = parts[1] || '';
        const regType = parts[2] || 'REG';

        // Extract college code from value (first 4-6 chars or standard prefix)
        // e.g. "AITH1JHCSEGREG" -> Code: AITH, Course code: CSEG, Uni: JH
        const val = opt.value;
        let collCode = val.slice(0, 4);
        let courseCode = val.slice(4);

        if (!institutionsMap[collCode]) {
          institutionsMap[collCode] = {
            code: collCode,
            name: collFullName,
            courses: []
          };
        }
        if (!institutionsMap[collCode].courses.includes(branchName)) {
          institutionsMap[collCode].courses.push(branchName);
        }
        branchesSet.add(branchName);

        const html = await postForm('https://pgecetadm.tgche.ac.in/Allot26/info/allotmentlist', {
          collcode: opt.value
        });

        const tableMatch = html.match(/<table[\s\S]*?<\/table>/gi);
        if (tableMatch && tableMatch[1]) {
          const rows = [...tableMatch[1].matchAll(/<tr>([\s\S]*?)<\/tr>/gi)];
          for (let r = 1; r < rows.length; r++) { // skip header
            const cols = [...rows[r][1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => decodeHtml(m[1]));
            if (cols.length >= 7) {
              const rawRank = cols[1] || '';
              // Format: "83.9055 (1444)" or just "(1444)"
              const rankMatch = rawRank.match(/\((\d+)\)/);
              const rank = rankMatch ? parseInt(rankMatch[1], 10) : null;
              const percentileMatch = rawRank.match(/^([\d.]+)/);
              const percentile = percentileMatch ? parseFloat(percentileMatch[1]) : null;

              const name = cols[2] || '';
              const category = cols[3] || '';
              const gender = cols[4] || '';
              const region = cols[5] || '';
              const allottedCategory = cols[6] || '';
              const phase = cols[7] || 'Phase I';

              if (rank) {
                allRecords.push({
                  college_code: collCode,
                  college_name: collFullName,
                  course_code: opt.value,
                  branch_name: branchName,
                  reg_type: regType,
                  rank,
                  percentile,
                  name,
                  category,
                  gender,
                  region,
                  allotted_category: allottedCategory,
                  phase
                });
              }
            }
          }
        }
      } catch (err) {
        console.error(`Error scraping ${opt.value}:`, err.message);
      }
    }));

    // Polite delay between batches
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`Scraping complete! Total student allotment records scraped: ${allRecords.length}`);

  const outputDir = path.join(__dirname, '..', 'client', 'src', 'data', 'pgecet_allotments');
  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(path.join(outputDir, 'institutions.json'), JSON.stringify(Object.values(institutionsMap), null, 2));
  fs.writeFileSync(path.join(outputDir, 'branches.json'), JSON.stringify([...branchesSet].sort(), null, 2));
  fs.writeFileSync(path.join(outputDir, 'allotments.json'), JSON.stringify(allRecords, null, 2));

  // Also build summary / cutoffs per college + branch + category
  const cutoffs = {};
  for (const rec of allRecords) {
    const key = `${rec.college_code}__${rec.branch_name}__${rec.allotted_category}`;
    if (!cutoffs[key]) {
      cutoffs[key] = {
        college_code: rec.college_code,
        college_name: rec.college_name,
        branch_name: rec.branch_name,
        allotted_category: rec.allotted_category,
        min_rank: rec.rank,
        max_rank: rec.rank,
        total_allotted: 0,
        ranks: []
      };
    }
    cutoffs[key].min_rank = Math.min(cutoffs[key].min_rank, rec.rank);
    cutoffs[key].max_rank = Math.max(cutoffs[key].max_rank, rec.rank);
    cutoffs[key].total_allotted++;
    cutoffs[key].ranks.push(rec.rank);
  }

  fs.writeFileSync(path.join(outputDir, 'allotments_summary.json'), JSON.stringify(Object.values(cutoffs), null, 2));
  console.log('Saved all JSON datasets to client/src/data/pgecet_allotments/');
}

scrapeAll().catch(console.error);
