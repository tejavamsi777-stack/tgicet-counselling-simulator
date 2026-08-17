import fs from 'fs';

async function main() {
  try {
    const res = await fetch('https://tgpolycet.nic.in/default.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    console.log('Homepage response status:', res.status);
    const html = await res.text();
    fs.writeFileSync('server/src/data/tgpolycet_default.html', html);
    console.log('Saved tgpolycet_default.html (Length:', html.length, ')');

    const hrefRegex = /href=["']([^"']+)["']/gi;
    let match;
    const links = [];
    while ((match = hrefRegex.exec(html)) !== null) {
      links.push(match[1]);
    }
    console.log('Links found on default.aspx:\n', links.join('\n'));
  } catch (e) {
    console.error('Error fetching tgpolycet.nic.in:', e);
  }
}

main();
