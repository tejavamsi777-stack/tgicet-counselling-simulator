import fs from 'fs';

async function testPostbackCollege(collegeCode = 'MASB') {
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
  fs.writeFileSync('server/src/data/tgpolycet_branches_masb.html', html1);

  const select2Match = html1.match(/<select[^>]+name="SMPage\$MainContent\$DropDownList2"[^>]*>([\s\S]*?)<\/select>/i);
  console.log('Select 2 content:', select2Match ? select2Match[1] : 'NOT FOUND');

  const branchOpts = (select2Match ? select2Match[1].match(/<option value="([^"]+)">([^<]+)<\/option>/gi) : []) || [];
  console.log(`Found ${branchOpts.length} branches for ${collegeCode}:`, branchOpts);

  if (branchOpts.length > 0) {
    const firstBranch = branchOpts[0].match(/value="([^"]+)"/)[1];
    console.log('Testing Show Allotments for branch:', firstBranch);

    const vs2 = html1.match(/id="__VIEWSTATE"\s+value="([^"]+)"/)[1];
    const ev2 = html1.match(/id="__EVENTVALIDATION"\s+value="([^"]+)"/)[1];
    const vsg2 = html1.match(/id="__VIEWSTATEGENERATOR"\s+value="([^"]+)"/)[1];

    const params2 = new URLSearchParams({
      '__EVENTTARGET': '',
      '__EVENTARGUMENT': '',
      '__LASTFOCUS': '',
      '__VIEWSTATE': vs2,
      '__VIEWSTATEGENERATOR': vsg2,
      '__EVENTVALIDATION': ev2,
      'SMPage$MainContent$DropDownList1': collegeCode,
      'SMPage$MainContent$DropDownList2': firstBranch,
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
    fs.writeFileSync('server/src/data/tgpolycet_allotments_masb.html', html2);

    const rows = html2.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
    console.log(`Allotments table rows count: ${rows.length}`);
    console.log('Sample row headers and first candidate:');
    rows.slice(3, 7).forEach(r => console.log(r.replace(/\s+/g, ' ').slice(0, 150)));
  }
}

testPostbackCollege('MASB');
