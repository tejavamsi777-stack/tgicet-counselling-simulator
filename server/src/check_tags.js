import * as cheerio from 'cheerio';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

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

async function check() {
  const jar = new CookieJar();
  const initRes = await fetch("https://tgicet.nic.in/default.aspx", {
    headers: { "User-Agent": userAgent },
  });
  jar.addCookies(initRes.headers.get("set-cookie"));
  jar.addCookies(initRes.headers.getSetCookie?.());
  console.log('Session Cookies from default.aspx:', jar.getCookieString());

  const res = await fetch('https://tgicet.nic.in/college_allotment.aspx', {
    headers: { 
      'User-Agent': userAgent,
      'Referer': 'https://tgicet.nic.in/default.aspx',
      'Cookie': jar.getCookieString()
    }
  });
  jar.addCookies(res.headers.get("set-cookie"));
  jar.addCookies(res.headers.getSetCookie?.());

  const html = await res.text();
  console.log('HTML length with session:', html.length);
  const $ = cheerio.load(html);

  $('select').each((i, s) => {
    console.log('Select tag name:', $(s).attr('name'), 'id:', $(s).attr('id'), 'options count:', $(s).find('option').length);
  });
  $('input').each((i, b) => {
    console.log('Input tag:', $(b).attr('name'), $(b).attr('id'), $(b).attr('type'), $(b).attr('value')?.slice(0, 30));
  });
}
check();
