import fs from 'fs';

async function fetchWithReferer(url) {
  return await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://tgpolycet.nic.in/default.aspx',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });
}

async function run() {
  // 1. Fetch Institute Profile
  console.log('Fetching institute_profile.aspx...');
  const resInst = await fetchWithReferer('https://tgpolycet.nic.in/institute_profile.aspx');
  const htmlInst = await resInst.text();
  fs.writeFileSync('server/src/data/tgpolycet_institute_profile.html', htmlInst);
  console.log('institute_profile status:', resInst.status, 'Length:', htmlInst.length);

  // 2. Fetch College Allotment
  console.log('Fetching college_allotment.aspx...');
  const resAllot = await fetchWithReferer('https://tgpolycet.nic.in/college_allotment.aspx');
  const htmlAllot = await resAllot.text();
  fs.writeFileSync('server/src/data/tgpolycet_college_allotment.html', htmlAllot);
  console.log('college_allotment status:', resAllot.status, 'Length:', htmlAllot.length);

  // 3. Extract college links/dropdowns from both
  const matchInstCodes = htmlInst.match(/institute_details\.aspx\?iCode=([A-Za-z0-9_]+)/gi) || [];
  console.log(`Found ${matchInstCodes.length} institute links in institute_profile.aspx`);
  console.log('Sample institute links:', matchInstCodes.slice(0, 10));

  const matchOptions = htmlAllot.match(/<option value=["']([^"']+)["']>([^<]+)<\/option>/gi) || [];
  console.log(`Found ${matchOptions.length} options in college_allotment.aspx dropdown`);
  console.log('Sample options:', matchOptions.slice(0, 10));
}

run();
