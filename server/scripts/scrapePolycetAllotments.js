import fs from 'fs';
import path from 'path';

function cleanText(str) {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

async function scrapeAllotments() {
  console.log('🚀 Starting POLYCET College-Wise Allotment Scraping...');

  const outputDir = path.resolve('server/src/data/polycet_allotments');
  const clientDir = path.resolve('client/src/data/polycet_allotments');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  if (!fs.existsSync(clientDir)) fs.mkdirSync(clientDir, { recursive: true });

  // Load scraped institutions list
  const institutions = JSON.parse(fs.readFileSync('server/src/data/official_scraped_polycet_institutions.json', 'utf8'));
  console.log(`Loaded ${institutions.length} institutions to scrape allotments for.`);

  // Step 1: Initial GET to obtain fresh session viewstate
  const getRes = await fetch('https://tgpolycet.nic.in/college_allotment.aspx', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://tgpolycet.nic.in/default.aspx'
    }
  });

  const getHtml = await getRes.text();
  let vs = getHtml.match(/id="__VIEWSTATE"\s+value="([^"]+)"/)[1];
  let ev = getHtml.match(/id="__EVENTVALIDATION"\s+value="([^"]+)"/)[1];
  let vsg = getHtml.match(/id="__VIEWSTATEGENERATOR"\s+value="([^"]+)"/)[1];

  const collegeSummaries = [];
  let totalCandidatesAllotted = 0;

  for (let i = 0; i < institutions.length; i++) {
    const inst = institutions[i];
    const collegeCode = inst.code;
    console.log(`[${i + 1}/${institutions.length}] Processing ${collegeCode} - ${inst.name}...`);

    try {
      // Postback to select college
      const params1 = new URLSearchParams({
        '__EVENTTARGET': 'SMPage$MainContent$DropDownList1',
        '__EVENTARGUMENT': '',
        '__LASTFOCUS': '',
        '__VIEWSTATE': vs,
        '__VIEWSTATEGENERATOR': vsg,
        '__EVENTVALIDATION': ev,
        'SMPage$MainContent$DropDownList1': collegeCode
      });

      const post1 = await fetch('https://tgpolycet.nic.in/college_allotment.aspx', {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://tgpolycet.nic.in/college_allotment.aspx',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params1.toString()
      });

      const html1 = await post1.text();
      const vsMatch2 = html1.match(/id="__VIEWSTATE"\s+value="([^"]+)"/);
      const evMatch2 = html1.match(/id="__EVENTVALIDATION"\s+value="([^"]+)"/);
      const vsgMatch2 = html1.match(/id="__VIEWSTATEGENERATOR"\s+value="([^"]+)"/);

      if (!vsMatch2) {
        console.warn(`Could not get viewstate for ${collegeCode}`);
        continue;
      }

      const vs2 = vsMatch2[1];
      const ev2 = evMatch2[1];
      const vsg2 = vsgMatch2[1];

      // Extract branch options
      const select2Match = html1.match(/<select[^>]+name="SMPage\$MainContent\$DropDownList2"[^>]*>([\s\S]*?)<\/select>/i);
      const branchOptions = [];
      if (select2Match) {
        const regex = /<option value="([^"]+)">([^<]+)<\/option>/gi;
        let bMatch;
        while ((bMatch = regex.exec(select2Match[1])) !== null) {
          if (bMatch[1] !== '0') {
            branchOptions.push({ code: bMatch[1].trim(), name: cleanText(bMatch[2]) });
          }
        }
      }

      const collegeBranchesData = [];
      let collegeTotalStudents = 0;

      for (const branch of branchOptions) {
        try {
          const params2 = new URLSearchParams({
            '__EVENTTARGET': '',
            '__EVENTARGUMENT': '',
            '__LASTFOCUS': '',
            '__VIEWSTATE': vs2,
            '__VIEWSTATEGENERATOR': vsg2,
            '__EVENTVALIDATION': ev2,
            'SMPage$MainContent$DropDownList1': collegeCode,
            'SMPage$MainContent$DropDownList2': branch.code,
            'SMPage$MainContent$btn_allot': 'Show Allotments'
          });

          const post2 = await fetch('https://tgpolycet.nic.in/college_allotment.aspx', {
            method: 'POST',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Referer': 'https://tgpolycet.nic.in/college_allotment.aspx',
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params2.toString()
          });

          const html2 = await post2.text();
          const rows = html2.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];

          const candidates = [];
          for (let rIdx = 0; rIdx < rows.length; rIdx++) {
            const row = rows[rIdx];
            if (!row.includes('<td>') && !row.includes('<TD>')) continue;
            const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
            if (cells.length >= 8) {
              const sno = parseInt(cleanText(cells[0]), 10);
              if (isNaN(sno)) continue;

              const hallTicket = cleanText(cells[1]);
              const rank = parseInt(cleanText(cells[2]), 10) || 0;
              const name = cleanText(cells[3]);
              const gender = cleanText(cells[4]);
              const caste = cleanText(cells[5]);
              const region = cleanText(cells[6]);
              const seatCategory = cleanText(cells[7]);

              candidates.push({
                sno,
                hallTicket,
                rank,
                name,
                gender: gender === 'M' ? 'Male' : (gender === 'F' ? 'Female' : gender),
                caste,
                region,
                seatCategory
              });
            }
          }

          candidates.sort((a, b) => a.rank - b.rank);
          const minRank = candidates.length > 0 ? candidates[0].rank : null;
          const maxRank = candidates.length > 0 ? candidates[candidates.length - 1].rank : null;

          collegeBranchesData.push({
            branchCode: branch.code,
            branchName: branch.name,
            totalAllotted: candidates.length,
            openingRank: minRank,
            closingRank: maxRank,
            candidates
          });

          collegeTotalStudents += candidates.length;
          totalCandidatesAllotted += candidates.length;
        } catch (bErr) {
          console.error(`Error scraping branch ${branch.code} for ${collegeCode}:`, bErr.message);
        }
      }

      const collegeRecord = {
        code: inst.code,
        name: inst.name,
        district: inst.district,
        place: inst.place,
        type: inst.type,
        annualFee: inst.annualFee,
        totalAllotted: collegeTotalStudents,
        branchesCount: collegeBranchesData.length,
        branches: collegeBranchesData
      };

      // Save individual college file
      fs.writeFileSync(path.join(outputDir, `${collegeCode}.json`), JSON.stringify(collegeRecord, null, 2));
      fs.writeFileSync(path.join(clientDir, `${collegeCode}.json`), JSON.stringify(collegeRecord, null, 2));

      collegeSummaries.push({
        code: inst.code,
        name: inst.name,
        district: inst.district,
        place: inst.place,
        type: inst.type,
        annualFee: inst.annualFee,
        totalAllotted: collegeTotalStudents,
        branches: collegeBranchesData.map(b => ({
          branchCode: b.branchCode,
          branchName: b.branchName,
          totalAllotted: b.totalAllotted,
          openingRank: b.openingRank,
          closingRank: b.closingRank
        }))
      });

      console.log(`  -> ${collegeCode}: Scraped ${collegeBranchesData.length} branches, ${collegeTotalStudents} total students allotted.`);
    } catch (cErr) {
      console.error(`Error scraping ${collegeCode}:`, cErr.message);
    }
  }

  // Save master summary index
  fs.writeFileSync(path.join(outputDir, 'allotments_summary.json'), JSON.stringify(collegeSummaries, null, 2));
  fs.writeFileSync(path.join(clientDir, 'allotments_summary.json'), JSON.stringify(collegeSummaries, null, 2));

  console.log(`🎉 COMPLETED ALLOTMENTS SCRAPE!`);
  console.log(`Total Colleges: ${collegeSummaries.length}`);
  console.log(`Total Candidates Scraped: ${totalCandidatesAllotted}`);
}

scrapeAllotments();
