import https from "https";
import querystring from "querystring";
import * as cheerio from "cheerio";
import { allotmentRepository } from "../src/repositories/allotmentRepository.js";
import { ALL_TSCHE_COLLEGES } from "../src/data/allTscheInstitutions.js";

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

export async function crawlOfficialCollegeBranch(collegeCode, branchCode, admissionYear = 2026, phase = "final") {
  // 1. Initial GET on default.aspx for cookies
  const res1 = await makeRequest("https://tgeapcet.nic.in/default.aspx", {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });

  const setCookies = res1.headers["set-cookie"] || [];
  const cookieStr = setCookies.map((c) => c.split(";")[0]).join("; ");

  // 2. GET college_allotment.aspx
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
  const collegeSelectName = $("select").eq(0).attr("name") || "SMPage$MainContent$DropDownList1";
  const branchSelectName = $("select").eq(1).attr("name") || "SMPage$MainContent$DropDownList2";

  let viewState = $("#__VIEWSTATE").val();
  let eventValidation = $("#__EVENTVALIDATION").val();
  let viewStateGen = $("#__VIEWSTATEGENERATOR").val();

  // 3. Postback to select College
  const postData1 = querystring.stringify({
    "__EVENTTARGET": collegeSelectName,
    "__EVENTARGUMENT": "",
    "__LASTFOCUS": "",
    "__VIEWSTATE": viewState,
    "__VIEWSTATEGENERATOR": viewStateGen,
    "__EVENTVALIDATION": eventValidation,
    [collegeSelectName]: collegeCode
  });

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

  const targetBranch = branches.find(b => b.value.toUpperCase() === branchCode.toUpperCase() || b.text.toUpperCase().includes(branchCode.toUpperCase()));
  if (!targetBranch) {
    return { collegeCode, branchCode, candidates: [], error: "Branch not available in institution" };
  }

  const submitBtnName = $("input[type='submit']").attr("name") || "SMPage$MainContent$btnSubmit";

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

  const collegeObj = ALL_TSCHE_COLLEGES.find(c => c.code === collegeCode) || { code: collegeCode, name: `${collegeCode} Engineering College` };
  const records = [];

  $("table tr").each((_, row) => {
    const cols = $(row).find("td");
    if (cols.length >= 7) {
      const colTexts = cols.map((_, c) => $(c).text().trim()).get();
      // Column Mapping:
      // 0: S.No (e.g. 1)
      // 1: Hall Ticket No (e.g. 2621A01006)
      // 2: Rank (e.g. 10006.00)
      // 3: Candidate Name (e.g. KARTHIK SABEESH)
      // 4: Sex (M/F)
      // 5: Caste (OC, SC_III, etc.)
      // 6: Region (OU, NL)
      // 7: Seat Category (OC_GEN_OU, etc.)
      const rollNo = colTexts[1];
      const rankNum = Math.round(parseFloat(colTexts[2]));
      const candidateName = colTexts[3];
      const gender = colTexts[4];
      const caste = colTexts[5];
      const region = colTexts[6];
      const seatCategory = colTexts[7] || `${caste}_GEN_${region}`;

      if (rollNo && rollNo.length >= 6 && !isNaN(rankNum) && rankNum > 0 && candidateName) {
        records.push({
          examId: "tg-eapcet",
          historicalExamName: "TG EAPCET",
          admissionYear,
          phase,
          collegeCode: collegeCode.toUpperCase(),
          collegeName: collegeObj.name,
          branchCode: branchCode.toUpperCase(),
          branchName: targetBranch.text,
          rank: rankNum,
          rollNo,
          candidateName,
          gender,
          region: region || "OU",
          caste: caste || "OC",
          seatCategory
        });
      }
    }
  });

  // Batch insert into Supabase PostgreSQL
  if (records.length > 0) {
    const { inserted, duplicates } = await allotmentRepository.insertBatchAllotments(records);
    return { collegeCode, branchCode, totalScraped: records.length, inserted, duplicates };
  }

  return { collegeCode, branchCode, totalScraped: 0, inserted: 0, duplicates: 0 };
}

// Test Run for Top Institutions
async function runCrawl() {
  console.log("=== Crawling Official TG EAPCET 2026 Final Phase Data from tgeapcet.nic.in ===");
  const targetColleges = ["CBIT", "JNTH", "OUCE", "VNRV", "VASV", "GRET", "KMIT", "MGIT", "CVRH", "AARM"];
  const targetBranches = ["CIV", "CSE", "CSM", "AID", "ECE", "INF"];

  for (const college of targetColleges) {
    for (const branch of targetBranches) {
      try {
        const res = await crawlOfficialCollegeBranch(college, branch, 2026, "final");
        console.log(`[Extracted] ${college} - ${branch}: ${res.totalScraped || 0} candidates (Inserted: ${res.inserted || 0}, Existing: ${res.duplicates || 0})`);
      } catch (err) {
        console.error(`[Error] ${college} - ${branch}:`, err.message);
      }
    }
  }
  process.exit(0);
}

runCrawl().catch(console.error);
