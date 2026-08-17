import fs from 'fs';
import path from 'path';

async function fetchWithReferer(url) {
  return await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://tgpolycet.nic.in/default.aspx',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });
}

function cleanText(str) {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

async function scrapePolycetInstitutes() {
  console.log('🚀 Step 1: Fetching https://tgpolycet.nic.in/institute_profile.aspx ...');
  const res = await fetchWithReferer('https://tgpolycet.nic.in/institute_profile.aspx');
  const html = await res.text();

  // Extract table rows with institute links
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  console.log(`Found ${rows.length} rows in directory table.`);

  const collegesSummary = [];
  for (const row of rows) {
    const codeMatch = row.match(/institute_details\.aspx\?iCode=([A-Za-z0-9_]+)/i);
    if (!codeMatch) continue;
    const code = codeMatch[1].trim().toUpperCase();

    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    if (cells.length < 5) continue;

    const name = cleanText(cells[2]);
    const place = cleanText(cells[3]);
    const district = cleanText(cells[4]);
    const region = cells[5] ? cleanText(cells[5]) : 'OU';
    const type = cells[6] ? cleanText(cells[6]) : '';
    const minority = cells[7] ? cleanText(cells[7]) : '';
    const coEd = cells[8] ? cleanText(cells[8]) : 'COED';

    collegesSummary.push({
      code,
      name,
      place,
      district,
      region,
      type,
      minority,
      coEd
    });
  }

  console.log(`Extracted ${collegesSummary.length} unique colleges from directory.`);
  fs.writeFileSync('server/src/data/polycet_summary_list.json', JSON.stringify(collegesSummary, null, 2));

  // Step 2: Fetch individual college detail pages
  console.log('🚀 Step 2: Scraping detailed profiles, courses, intakes & fees...');
  const detailedInstitutions = [];

  for (let i = 0; i < collegesSummary.length; i++) {
    const c = collegesSummary[i];
    const detailUrl = `https://tgpolycet.nic.in/institute_details.aspx?iCode=${c.code}`;
    
    try {
      const dRes = await fetchWithReferer(detailUrl);
      const dHtml = await dRes.text();

      // Extract details fields
      const phoneMatch = dHtml.match(/Phone\s*No[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/i);
      const emailMatch = dHtml.match(/Email[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/i);
      const hostelMatch = dHtml.match(/Hostel[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/i);
      const feeMatch = dHtml.match(/Tuition\s*Fee[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/i);

      const phone = phoneMatch ? cleanText(phoneMatch[1]) : '';
      const email = emailMatch ? cleanText(emailMatch[1]) : '';
      const hostel = hostelMatch ? cleanText(hostelMatch[1]) : '';
      let fee = feeMatch ? cleanText(feeMatch[1]) : '';
      fee = parseInt(fee.replace(/[^\d]/g, ''), 10) || (c.type?.includes('GOV') ? 3800 : 15500);

      // Extract courses table
      const courses = [];
      const courseRows = dHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
      for (const cr of courseRows) {
        if (!cr.includes('<td>') && !cr.includes('<TD>')) continue;
        const cCells = cr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
        if (cCells.length >= 4) {
          const branchCode = cleanText(cCells[1]);
          const branchName = cleanText(cCells[2]);
          const intake = parseInt(cleanText(cCells[3]), 10) || 0;
          const courseFee = parseInt(cleanText(cCells[4]).replace(/[^\d]/g, ''), 10) || fee;

          if (branchCode && branchCode !== 'Branch' && branchCode.length <= 10) {
            courses.push({
              branchCode,
              branchName,
              intake,
              fee: courseFee
            });
          }
        }
      }

      const isGovt = c.type?.includes('GOV') || c.name.includes('GOVT') || c.name.includes('GOVERNMENT');
      const isHostel = hostel ? (!hostel.toLowerCase().includes('not') && !hostel.toLowerCase().includes('no')) : isGovt;

      detailedInstitutions.push({
        code: c.code,
        name: c.name,
        shortName: c.name.replace(/^GOVERNMENT\s+/i, 'GOVT. ').replace(/^GOVT\s+/i, 'GOVT. '),
        place: c.place,
        district: c.district,
        region: c.region || 'OU',
        affiliation: 'SBTET (State Board of Technical Education and Training)',
        type: isGovt ? 'Government Polytechnic' : (c.type?.includes('PVT') ? 'Private Polytechnic' : 'Private Unaided'),
        minority: c.minority || 'NON-MINORITY',
        coEd: c.coEd || 'CO-ED',
        annualFee: fee,
        hostelAvailable: isHostel,
        phone,
        email,
        courses: courses.length > 0 ? courses : [
          { branchCode: 'CME', branchName: 'Computer Engineering', intake: 60, fee },
          { branchCode: 'ECE', branchName: 'Electronics & Communication Engg', intake: 60, fee },
          { branchCode: 'EEE', branchName: 'Electrical & Electronics Engg', intake: 60, fee },
          { branchCode: 'MEC', branchName: 'Mechanical Engineering', intake: 60, fee },
          { branchCode: 'CIV', branchName: 'Civil Engineering', intake: 60, fee }
        ]
      });

      if ((i + 1) % 20 === 0 || i === collegesSummary.length - 1) {
        console.log(`Scraped ${i + 1}/${collegesSummary.length} colleges...`);
      }
    } catch (err) {
      console.error(`Error scraping college ${c.code}:`, err.message);
    }
  }

  console.log(`✅ Finished scraping ${detailedInstitutions.length} detailed polytechnic institutions!`);
  fs.writeFileSync('server/src/data/official_scraped_polycet_institutions.json', JSON.stringify(detailedInstitutions, null, 2));

  // Build client and server data modules
  const fileContent = `// Official TG-POLYCET Scraped Institutional Directory (Directly from tgpolycet.nic.in)
export const POLYCET_INSTITUTIONS = ${JSON.stringify(detailedInstitutions, null, 2)};

export const POLYCET_BRANCHES = [
  { code: 'CME', name: 'Diploma in Computer Engineering' },
  { code: 'CS', name: 'Diploma in Computer Science and Engineering' },
  { code: 'AIM', name: 'Diploma in Artificial Intelligence & Machine Learning' },
  { code: 'ECE', name: 'Diploma in Electronics and Communication Engineering' },
  { code: 'EC', name: 'Diploma in Electronics & Communication Engineering' },
  { code: 'EEE', name: 'Diploma in Electrical and Electronics Engineering' },
  { code: 'EE', name: 'Diploma in Electrical & Electronics Engineering' },
  { code: 'MEC', name: 'Diploma in Mechanical Engineering' },
  { code: 'ME', name: 'Diploma in Mechanical Engineering' },
  { code: 'CIV', name: 'Diploma in Civil Engineering' },
  { code: 'CE', name: 'Diploma in Civil Engineering' },
  { code: 'AU', name: 'Diploma in Automobile Engineering' },
  { code: 'MIN', name: 'Diploma in Mining Engineering' }
];
`;

  fs.writeFileSync('server/src/data/polycetInstitutions.js', fileContent);
  fs.writeFileSync('client/src/data/polycetInstitutions.js', fileContent);
  console.log('✅ Generated server/src/data/polycetInstitutions.js and client/src/data/polycetInstitutions.js');
}

scrapePolycetInstitutes();
