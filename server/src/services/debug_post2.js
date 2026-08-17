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

async function debugPost2(collegeCode = "CBIT", branchCode = "CSE") {
  const jar = new CookieJar();
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  console.log("Step 1: Init default.aspx...");
  const initRes = await fetch("https://tgecet.nic.in/default.aspx", {
    headers: { "User-Agent": userAgent }
  });
  jar.addCookies(initRes.headers.get("set-cookie"));
  jar.addCookies(initRes.headers.getSetCookie?.());

  console.log("Step 2: GET college_allotment.aspx...");
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

  console.log("Step 3: Postback for College:", collegeCode);
  const form1 = new URLSearchParams();
  form1.append("__EVENTTARGET", "SMPage$MainContent$DropDownList1");
  form1.append("__EVENTARGUMENT", "");
  form1.append("__LASTFOCUS", "");
  form1.append("__VIEWSTATE", viewState);
  if (viewStateGen) form1.append("__VIEWSTATEGENERATOR", viewStateGen);
  if (eventValidation) form1.append("__EVENTVALIDATION", eventValidation);
  form1.append("SMPage$MainContent$DropDownList1", collegeCode);

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

  html = await post1.text();
  $ = cheerio.load(html);

  viewState = $('#__VIEWSTATE').val();
  viewStateGen = $('#__VIEWSTATEGENERATOR').val();
  eventValidation = $('#__EVENTVALIDATION').val();

  console.log("Step 4: Submitting for Allotments with btn_allot:", collegeCode, branchCode);
  const form2 = new URLSearchParams();
  form2.append("__VIEWSTATE", viewState);
  if (viewStateGen) form2.append("__VIEWSTATEGENERATOR", viewStateGen);
  if (eventValidation) form2.append("__EVENTVALIDATION", eventValidation);
  form2.append("SMPage$MainContent$DropDownList1", collegeCode);
  form2.append("SMPage$MainContent$DropDownList2", branchCode);
  form2.append("SMPage$MainContent$btn_allot", "Show Allotments");

  const post2 = await fetch("https://tgecet.nic.in/college_allotment.aspx", {
    method: "POST",
    headers: {
      "User-Agent": userAgent,
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": "https://tgecet.nic.in/college_allotment.aspx",
      "Cookie": jar.getCookieString()
    },
    body: form2.toString()
  });

  html = await post2.text();
  fs.writeFileSync("./src/data/post2_allotments_live.html", html, "utf-8");

  $ = cheerio.load(html);
  const tables = [];
  $("table").each((i, tbl) => {
    const rows = [];
    $(tbl).find("tr").each((_, row) => {
      const cells = $(row).find("td, th").map((_, c) => $(c).text().replace(/\s+/g, " ").trim()).get();
      if (cells.length > 0) {
        rows.push(cells);
      }
    });
    if (rows.length > 0) {
      tables.push({ index: i, rows });
    }
  });

  console.log(`Tables found: ${tables.length}`);
  tables.forEach((t) => {
    console.log(`Table #${t.index} rows count: ${t.rows.length}`);
    if (t.rows.length > 0) {
      console.log("First 3 rows:", t.rows.slice(0, 3));
    }
  });
}

debugPost2("CBIT", "CSE").catch(console.error);
