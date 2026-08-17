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

async function scrapeCollege(collegeCode = "CBIT") {
  const jar = new CookieJar();
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  console.log(`\n=== Testing live scrape for ${collegeCode} ===`);
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

  // Extract all 293 colleges from the initial dropdown
  const allColleges = [];
  $("#MainContent_DropDownList1 option, select[name*='DropDownList1'] option").each((_, opt) => {
    const val = $(opt).val()?.trim();
    const txt = $(opt).text()?.trim();
    if (val && !txt.toLowerCase().includes("select")) {
      allColleges.push({ code: val, name: txt });
    }
  });
  console.log(`Extracted total colleges from official portal: ${allColleges.length}`);

  // Save all 293 official colleges into a json file
  fs.writeFileSync("./src/data/tgecet_all_293_official_colleges.json", JSON.stringify(allColleges, null, 2), "utf-8");

  let viewState = $('input[name="__VIEWSTATE"]').val();
  let viewStateGen = $('input[name="__VIEWSTATEGENERATOR"]').val();
  let eventValidation = $('input[name="__EVENTVALIDATION"]').val();

  const collegeSelectName = $("select").first().attr("name") || "ctl00$MainContent$DropDownList1";
  const branchSelectName = $("select").eq(1).attr("name") || "ctl00$MainContent$DropDownList2";

  console.log("Select names:", collegeSelectName, branchSelectName);

  // POST 1: Trigger postback for college
  const form1 = new URLSearchParams();
  form1.append("__EVENTTARGET", collegeSelectName);
  form1.append("__EVENTARGUMENT", "");
  form1.append("__LASTFOCUS", "");
  form1.append("__VIEWSTATE", viewState);
  if (viewStateGen) form1.append("__VIEWSTATEGENERATOR", viewStateGen);
  if (eventValidation) form1.append("__EVENTVALIDATION", eventValidation);
  form1.append(collegeSelectName, collegeCode);
  form1.append(branchSelectName, "");

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

  const branches = [];
  $(`select[name*='DropDownList2'] option, #${branchSelectName.replace(/\$/g, '_')} option`).each((_, opt) => {
    const val = $(opt).val()?.trim();
    const txt = $(opt).text()?.trim();
    if (val && !txt.toLowerCase().includes("select")) {
      branches.push({ code: val, name: txt });
    }
  });
  console.log(`Branches loaded for ${collegeCode}:`, branches);

  if (branches.length > 0) {
    const selectedBranch = branches[0].code;
    console.log(`\nPOST 2: Fetching candidate allotments for ${collegeCode} -> ${selectedBranch}...`);

    viewState = $('input[name="__VIEWSTATE"]').val();
    viewStateGen = $('input[name="__VIEWSTATEGENERATOR"]').val();
    eventValidation = $('input[name="__EVENTVALIDATION"]').val();

    const btn = $('input[type="submit"]').first();
    const btnName = btn.attr("name") || "ctl00$MainContent$btnSubmit";
    const btnVal = btn.attr("value") || "Show Allotments";

    const form2 = new URLSearchParams();
    form2.append("__VIEWSTATE", viewState);
    if (viewStateGen) form2.append("__VIEWSTATEGENERATOR", viewStateGen);
    if (eventValidation) form2.append("__EVENTVALIDATION", eventValidation);
    form2.append(collegeSelectName, collegeCode);
    form2.append(branchSelectName, selectedBranch);
    form2.append(btnName, btnVal);

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
    $ = cheerio.load(html);

    fs.writeFileSync("./src/data/tgecet_sample_allotment_result.html", html, "utf-8");

    const rows = [];
    $("table tr").each((i, row) => {
      const cells = $(row).find("td, th").map((_, c) => $(c).text().replace(/\s+/g, " ").trim()).get();
      if (cells.length >= 6) {
        rows.push(cells);
      }
    });

    console.log(`Parsed table rows count: ${rows.length}`);
    if (rows.length > 0) {
      console.log("Header:", rows[0]);
      console.log("First 3 candidate records:", rows.slice(1, 4));
    }
  }
}

scrapeCollege("CBIT").catch(console.error);
