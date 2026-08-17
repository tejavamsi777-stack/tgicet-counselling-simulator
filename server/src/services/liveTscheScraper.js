import * as cheerio from "cheerio";

export async function testLiveScrape(collegeCode = "CBIT", branchCode = "CIV") {
  console.log(`[Live TSCHE Scraper] Testing exact browser emulation for ${collegeCode} - ${branchCode}...`);

  const headers = {
    "Host": "tgeapcet.nic.in",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1"
  };

  // 1. Initial GET on Default.aspx
  const defaultRes = await fetch("https://tgeapcet.nic.in/Default.aspx", { headers });
  const setCookies = defaultRes.headers.getSetCookie ? defaultRes.headers.getSetCookie() : [defaultRes.headers.get("set-cookie") || ""];
  let cookieMap = {};
  setCookies.forEach(c => {
    const [k, v] = c.split(";")[0].split("=");
    if (k && v) cookieMap[k.trim()] = v.trim();
  });
  const cookieStr = Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join("; ");
  console.log("Session Cookies:", cookieStr);

  // 2. Initial GET on college_allotment.aspx
  const getRes = await fetch("https://tgeapcet.nic.in/college_allotment.aspx", {
    headers: { ...headers, "Referer": "https://tgeapcet.nic.in/Default.aspx", "Cookie": cookieStr }
  });
  let html = await getRes.text();
  let $ = cheerio.load(html);

  const viewState = $('input[name="__VIEWSTATE"]').val();
  const viewStateGen = $('input[name="__VIEWSTATEGENERATOR"]').val();
  const eventValidation = $('input[name="__EVENTVALIDATION"]').val();
  const ddl1 = $('select').first().attr('name');
  const ddl2 = $('select').eq(1).attr('name');

  console.log("GET Form:", { ddl1, ddl2, vsLen: viewState?.length, evLen: eventValidation?.length });

  // 3. POST 1: Select College
  const body1 = new URLSearchParams();
  body1.append('__EVENTTARGET', ddl1);
  body1.append('__EVENTARGUMENT', '');
  body1.append('__LASTFOCUS', '');
  body1.append('__VIEWSTATE', viewState);
  if (viewStateGen) body1.append('__VIEWSTATEGENERATOR', viewStateGen);
  if (eventValidation) body1.append('__EVENTVALIDATION', eventValidation);
  body1.append(ddl1, collegeCode);
  body1.append(ddl2, '');

  const post1 = await fetch("https://tgeapcet.nic.in/college_allotment.aspx", {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/x-www-form-urlencoded",
      "Origin": "https://tgeapcet.nic.in",
      "Referer": "https://tgeapcet.nic.in/college_allotment.aspx",
      "Cookie": cookieStr
    },
    body: body1.toString()
  });

  html = await post1.text();
  console.log("POST 1 Status:", post1.status, "HTML Length:", html.length);
  if (html.includes("ErrorPage.aspx")) {
    console.log("Error URL:", post1.url);
  }
}
