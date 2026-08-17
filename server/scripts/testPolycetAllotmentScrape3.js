import fs from 'fs';

async function testCandidateAllotments(collegeCode = 'MASB', branchCode = 'CS') {
  // Step 1: Initial GET
  const getRes = await fetch('https://tgpolycet.nic.in/college_allotment.aspx', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://tgpolycet.nic.in/default.aspx'
    }
  });

  const getHtml = await getRes.text();
  const vsMatch = getHtml.match(/id="__VIEWSTATE"\s+value="([^"]+)"/);
  const evMatch = getHtml.match(/id="__EVENTVALIDATION"\s+value="([^"]+)"/);
  const vsgMatch = getHtml.match(/id="__VIEWSTATEGENERATOR"\s+value="([^"]+)"/);

  // Step 2: Postback for college selection
  const params1 = new URLSearchParams({
    '__EVENTTARGET': 'SMPage$MainContent$DropDownList1',
    '__EVENTARGUMENT': '',
    '__LASTFOCUS': '',
    '__VIEWSTATE': vsMatch[1],
    '__VIEWSTATEGENERATOR': vsgMatch[1],
    '__EVENTVALIDATION': evMatch[1],
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
  const vs2 = html1.match(/id="__VIEWSTATE"\s+value="([^"]+)"/)[1];
  const ev2 = html1.match(/id="__EVENTVALIDATION"\s+value="([^"]+)"/)[1];
  const vsg2 = html1.match(/id="__VIEWSTATEGENERATOR"\s+value="([^"]+)"/)[1];

  console.log(`Submitting Show Allotments for ${collegeCode} - ${branchCode}...`);
  const params2 = new URLSearchParams({
    '__EVENTTARGET': '',
    '__EVENTARGUMENT': '',
    '__LASTFOCUS': '',
    '__VIEWSTATE': vs2,
    '__VIEWSTATEGENERATOR': vsg2,
    '__EVENTVALIDATION': ev2,
    'SMPage$MainContent$DropDownList1': collegeCode,
    'SMPage$MainContent$DropDownList2': branchCode,
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
  fs.writeFileSync('server/src/data/tgpolycet_allotments_masb_cs.html', html2);

  const rows = html2.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  console.log(`Found ${rows.length} rows in allotments response!`);

  // Extract table headers and first 5 candidates
  rows.forEach((r, idx) => {
    const text = r.replace(/<[^>]+>/g, ' | ').replace(/\s+/g, ' ').trim();
    if (idx < 10) {
      console.log(`Row #${idx}: ${text}`);
    }
  });
}

testCandidateAllotments('MASB', 'CS');
