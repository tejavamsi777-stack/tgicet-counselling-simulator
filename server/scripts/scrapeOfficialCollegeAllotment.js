import https from "https";
import querystring from "querystring";
import * as cheerio from "cheerio";

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function scrapeOfficialCollegeAllotment(collegeCode = "CBIT", branchCode = "CIV") {
  console.log(`[NIC Scraper] Starting live extraction for ${collegeCode} - ${branchCode}...`);

  // 1. Initial GET on default.aspx to acquire authentic session cookies
  const res1 = await makeRequest("https://tgeapcet.nic.in/default.aspx", {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });

  const setCookies = res1.headers["set-cookie"] || [];
  const cookieStr = setCookies.map((c) => c.split(";")[0]).join("; ");

  // 2. GET college_allotment.aspx to get initial VIEWSTATE & dropdowns
  const res2 = await makeRequest("https://tgeapcet.nic.in/college_allotment.aspx", {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Referer": "https://tgeapcet.nic.in/default.aspx",
      "Cookie": cookieStr
    }
  });

  let $ = cheerio.load(res2.body);

  // Find form field names
  const collegeSelectName = $("select").eq(0).attr("name");
  const branchSelectName = $("select").eq(1).attr("name");
  console.log("College select name:", collegeSelectName);
  console.log("Branch select name:", branchSelectName);

  let viewState = $("#__VIEWSTATE").val();
  let eventValidation = $("#__EVENTVALIDATION").val();
  let viewStateGen = $("#__VIEWSTATEGENERATOR").val();

  // 3. Postback to select College and get Branch options
  const postData1 = querystring.stringify({
    "__EVENTTARGET": collegeSelectName,
    "__EVENTARGUMENT": "",
    "__LASTFOCUS": "",
    "__VIEWSTATE": viewState,
    "__VIEWSTATEGENERATOR": viewStateGen,
    "__EVENTVALIDATION": eventValidation,
    [collegeSelectName]: collegeCode
  });

  console.log(`\n[NIC Scraper] Posting selected college ${collegeCode}...`);
  const res3 = await makeRequest("https://tgeapcet.nic.in/college_allotment.aspx", {
    method: "POST",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData1),
      "Referer": "https://tgeapcet.nic.in/college_allotment.aspx",
      "Cookie": cookieStr
    },
    body: postData1
  });

  $ = cheerio.load(res3.body);
  viewState = $("#__VIEWSTATE").val();
  eventValidation = $("#__EVENTVALIDATION").val();
  viewStateGen = $("#__VIEWSTATEGENERATOR").val();

  const branches = [];
  $(`select[name='${branchSelectName}'] option`).each((_, el) => {
    const val = $(el).attr("value");
    const txt = $(el).text().trim();
    if (val && val !== "0" && val !== "") {
      branches.push({ value: val, text: txt });
    }
  });

  console.log(`Available branches for ${collegeCode}:`, branches);

  // Find target branch
  const targetBranch = branches.find(b => b.value.toUpperCase() === branchCode.toUpperCase() || b.text.toUpperCase().includes(branchCode.toUpperCase())) || branches[0];
  if (!targetBranch) {
    console.log("No branches found!");
    return;
  }

  console.log(`\n[NIC Scraper] Selected branch: ${targetBranch.value} - ${targetBranch.text}`);

  // Find Submit button name
  const submitBtnName = $("input[type='submit']").attr("name") || $("button[type='submit']").attr("name") || "ctl00$ContentPlaceHolder1$btnSubmit";

  // 4. Submit to fetch candidates allotment table
  const postData2 = querystring.stringify({
    "__EVENTTARGET": "",
    "__EVENTARGUMENT": "",
    "__VIEWSTATE": viewState,
    "__VIEWSTATEGENERATOR": viewStateGen,
    "__EVENTVALIDATION": eventValidation,
    [collegeSelectName]: collegeCode,
    [branchSelectName]: targetBranch.value,
    [submitBtnName]: "Show Allotments"
  });

  console.log(`[NIC Scraper] Submitting Show Allotments...`);
  const res4 = await makeRequest("https://tgeapcet.nic.in/college_allotment.aspx", {
    method: "POST",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData2),
      "Referer": "https://tgeapcet.nic.in/college_allotment.aspx",
      "Cookie": cookieStr
    },
    body: postData2
  });

  $ = cheerio.load(res4.body);

  const candidates = [];
  $("table tr").each((i, row) => {
    const cols = $(row).find("td");
    if (cols.length >= 6) {
      const colTexts = cols.map((_, c) => $(c).text().trim()).get();
      // Check if rank column is numeric
      const rankVal = parseInt(colTexts[1] || colTexts[2], 10);
      if (!isNaN(rankVal) && rankVal > 0) {
        candidates.push({
          rollNo: colTexts[0],
          rank: rankVal,
          name: colTexts[2] || colTexts[1],
          gender: colTexts[3],
          caste: colTexts[4],
          region: colTexts[5],
          seatCategory: colTexts[6] || colTexts[5]
        });
      }
    }
  });

  console.log(`\n Extracted ${candidates.length} official candidates for ${collegeCode} - ${branchCode}:`);
  console.log("Sample candidates:", candidates.slice(0, 5));
}

scrapeOfficialCollegeAllotment("CBIT", "CIV").catch(console.error);
