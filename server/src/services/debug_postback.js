import * as cheerio from "cheerio";
import fs from "fs";

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }
  addCookies(setCookieHeader) {
    if (!setCookieHeader) return;
    const items = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    items.forEach((header) => {
      header.split(",").forEach((part) => {
        const first = part.split(";")[0].trim();
        if (first && first.includes("=")) {
          const [k, v] = first.split("=");
          this.cookies.set(k.trim(), v.trim());
        }
      });
    });
  }
  getCookieString() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }
}

async function debugPostback(collegeCode = "CBIT") {
  const jar = new CookieJar();
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  const initRes = await fetch("https://tgecet.nic.in/default.aspx", {
    headers: { "User-Agent": userAgent }
  });
  jar.addCookies(initRes.headers.get("set-cookie"));
  jar.addCookies(initRes.headers.getSetCookie?.());

  const getRes = await fetch("https://tgecet.nic.in/college_allotment.aspx", {
    headers: {
      "User-Agent": userAgent,
      "Referer": "https://tgecet.nic.in/default.aspx",
      "Cookie": jar.getCookieString()
    }
  });
  jar.addCookies(getRes.headers.get("set-cookie"));
  jar.addCookies(getRes.headers.getSetCookie?.());

  let html = await getRes.text();
  let $ = cheerio.load(html);

  let viewState = $('#__VIEWSTATE').val();
  let viewStateGen = $('#__VIEWSTATEGENERATOR').val();
  let eventValidation = $('#__EVENTVALIDATION').val();

  console.log("Initial __VIEWSTATE length:", viewState?.length);

  const form1 = new URLSearchParams();
  form1.append("__EVENTTARGET", "SMPage$MainContent$DropDownList1");
  form1.append("__EVENTARGUMENT", "");
  form1.append("__LASTFOCUS", "");
  form1.append("__VIEWSTATE", viewState);
  if (viewStateGen) form1.append("__VIEWSTATEGENERATOR", viewStateGen);
  if (eventValidation) form1.append("__EVENTVALIDATION", eventValidation);
  form1.append("SMPage$MainContent$DropDownList1", collegeCode);

  console.log("Posting PostBack for college:", collegeCode);
  const post1 = await fetch("https://tgecet.nic.in/college_allotment.aspx", {
    method: "POST",
    headers: {
      "User-Agent": userAgent,
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": "https://tgecet.nic.in/college_allotment.aspx",
      "Cookie": jar.getCookieString()
    },
    body: form1.toString()
  });
  jar.addCookies(post1.headers.get("set-cookie"));
  jar.addCookies(post1.headers.getSetCookie?.());

  console.log("Post1 status:", post1.status);
  const post1Html = await post1.text();
  fs.writeFileSync("./src/data/post1_response.html", post1Html, "utf-8");

  $ = cheerio.load(post1Html);
  console.log("Post1 Title:", $("title").text());

  const selects = [];
  $("select").each((i, el) => {
    const id = $(el).attr("id") || $(el).attr("name");
    const opts = [];
    $(el).find("option").each((j, opt) => {
      opts.push({ val: $(opt).val(), text: $(opt).text() });
    });
    selects.push({ id, count: opts.length, options: opts });
    console.log(`Post1 Select #${i + 1} (${id}): ${opts.length} options`);
    if (opts.length > 0) {
      console.log("Options:", opts);
    }
  });
}

debugPostback("CBIT").catch(console.error);
