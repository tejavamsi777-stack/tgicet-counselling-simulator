import https from 'https';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function fetchPage(path) {
  return new Promise((resolve, reject) => {
    const req = https.request(`https://tgicet.nic.in/${path}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://tgicet.nic.in/default.aspx'
      },
      rejectUnauthorized: false
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  const html = fs.readFileSync('server/src/data/raw_institute_profile.html', 'utf8');
  const $ = cheerio.load(html);

  const links = [];
  $('table tr').each((i, tr) => {
    const a = $(tr).find('td:nth-child(2) a, td:nth-child(3) a');
    if (a.length > 0) {
      links.push({ text: a.text().trim(), href: a.attr('href') });
    }
  });

  console.log('Sample institute code links:', links.slice(0, 10));

  // Let's also check Courses_list.aspx
  console.log('Fetching Courses_list.aspx...');
  try {
    const courseHtml = await fetchPage('Courses_list.aspx');
    fs.writeFileSync('server/src/data/raw_courses_list.html', courseHtml);
    const $c = cheerio.load(courseHtml);
    console.log('Courses list tables found:', $c('table').length);
    $c('table tr').slice(0, 5).each((i, tr) => {
      const row = [];
      $c(tr).find('th, td').each((j, td) => row.push($c(td).text().trim().replace(/\s+/g, ' ')));
      console.log(`Course row ${i}:`, JSON.stringify(row));
    });
  } catch (err) {
    console.error('Courses_list fetch error:', err.message);
  }

  // Let's test fetching one of the college detail links if available
  if (links.length > 0 && links[0].href) {
    console.log('Fetching sample college detail:', links[0].href);
    const sampleHtml = await fetchPage(links[0].href);
    fs.writeFileSync('server/src/data/raw_sample_college.html', sampleHtml);
    const $s = cheerio.load(sampleHtml);
    $s('table tr').each((i, tr) => {
      const row = [];
      $s(tr).find('th, td').each((j, td) => row.push($s(td).text().trim().replace(/\s+/g, ' ')));
      console.log(`College detail row ${i}:`, JSON.stringify(row));
    });
  }
}

run().catch(console.error);
