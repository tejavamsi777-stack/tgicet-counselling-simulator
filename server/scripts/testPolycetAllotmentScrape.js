import fs from 'fs';

async function testPostback() {
  // Step 1: GET college_allotment.aspx to get VIEWSTATE
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

  const viewState = vsMatch ? vsMatch[1] : '';
  const eventValidation = evMatch ? evMatch[1] : '';
  const viewStateGenerator = vsgMatch ? vsgMatch[1] : '';

  console.log('Got ViewState length:', viewState.length);

  // Step 2: Postback to select college "ADBP" to load its branches
  const params1 = new URLSearchParams({
    '__EVENTTARGET': 'SMPage$MainContent$DropDownList1',
    '__EVENTARGUMENT': '',
    '__LASTFOCUS': '',
    '__VIEWSTATE': viewState,
    '__VIEWSTATEGENERATOR': viewStateGenerator,
    '__EVENTVALIDATION': eventValidation,
    'SMPage$MainContent$DropDownList1': 'ADBP'
  });

  console.log('Sending postback for college ADBP...');
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
  console.log('Postback 1 status:', post1.status, 'HTML length:', html1.length);
  fs.writeFileSync('server/src/data/tgpolycet_branches_sample.html', html1);

  const branches = html1.match(/<option value=["']([^"']+)["']>([^<]+)<\/option>/gi) || [];
  console.log(`Found ${branches.length} options in response:`);
  console.log(branches.filter(b => !b.includes('ADBP')));

  // Step 3: Select branch and click btn_allot
  const vsMatch2 = html1.match(/id="__VIEWSTATE"\s+value="([^"]+)"/);
  const evMatch2 = html1.match(/id="__EVENTVALIDATION"\s+value="([^"]+)"/);
  const vsgMatch2 = html1.match(/id="__VIEWSTATEGENERATOR"\s+value="([^"]+)"/);

  const branchMatch = html1.match(/<select[^>]+name="SMPage\$MainContent\$DropDownList2"[^>]*>([\s\S]*?)<\/select>/i);
  let branchCode = '';
  if (branchMatch) {
    const opts = branchMatch[1].match(/value="([^"]+)"/gi);
    if (opts && opts.length > 0) {
      branchCode = opts[0].replace('value="', '').replace('"', '');
    }
  }

  console.log('Selected branch code:', branchCode);

  const params2 = new URLSearchParams({
    '__EVENTTARGET': '',
    '__EVENTARGUMENT': '',
    '__LASTFOCUS': '',
    '__VIEWSTATE': vsMatch2 ? vsMatch2[1] : '',
    '__VIEWSTATEGENERATOR': vsgMatch2 ? vsgMatch2[1] : '',
    '__EVENTVALIDATION': evMatch2 ? evMatch2[1] : '',
    'SMPage$MainContent$DropDownList1': 'ADBP',
    'SMPage$MainContent$DropDownList2': branchCode || 'CME',
    'SMPage$MainContent$btn_allot': 'Show Allotments'
  });

  console.log('Submitting for allotments...');
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
  console.log('Allotments table status:', post2.status, 'HTML length:', html2.length);
  fs.writeFileSync('server/src/data/tgpolycet_allotments_sample.html', html2);

  const rows = html2.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  console.log(`Found ${rows.length} table rows in allotments! Sample 3 rows:`);
  rows.slice(0, 3).forEach(r => console.log(r.replace(/\s+/g, ' ').slice(0, 150)));
}

testPostback();
