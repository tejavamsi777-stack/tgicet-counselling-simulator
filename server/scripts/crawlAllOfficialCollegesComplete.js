import https from "https";
import querystring from "querystring";
import * as cheerio from "cheerio";
import { allotmentRepository } from "../src/repositories/allotmentRepository.js";

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

// Sleep helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getAuthenticatedSession() {
  const res = await makeRequest("https://tgeapcet.nic.in/default.aspx", {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });

  const setCookies = res.headers["set-cookie"] || [];
  return setCookies.map((c) => c.split(";")[0]).join("; ");
}

async function scrapeAllCollegesFullPipeline() {
  console.log("==========================================================================");
  console.log("Starting Full Scrape of ALL Colleges from https://tgeapcet.nic.in/");
  console.log("==========================================================================\n");

  let cookieStr = await getAuthenticatedSession();
  console.log("[Auth] Session cookie acquired successfully.");

  // Fetch initial page
  const resInit = await makeRequest("https://tgeapcet.nic.in/college_allotment.aspx", {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Referer": "https://tgeapcet.nic.in/default.aspx",
      "Cookie": cookieStr
    }
  });

  let $ = cheerio.load(resInit.body);
  const collegeSelectName = $("select").eq(0).attr("name") || "SMPage$MainContent$DropDownList1";
  const branchSelectName = $("select").eq(1).attr("name") || "SMPage$MainContent$DropDownList2";
  const submitBtnName = $("input[type='submit']").attr("name") || "SMPage$MainContent$btnSubmit";

  // Collect all official colleges from dropdown
  const allColleges = [];
  $(`select[name='${collegeSelectName}'] option`).each((_, el) => {
    const val = $(el).attr("value");
    const txt = $(el).text().trim();
    if (val && val !== "0" && val !== "") {
      allColleges.push({ code: val.toUpperCase(), name: txt });
    }
  });

  console.log(`[Discovery] Found ${allColleges.length} participating Telangana institutions on official portal.\n`);

  let grandTotalScraped = 0;
  let grandTotalInserted = 0;
  let grandTotalExisting = 0;

  for (let idx = 0; idx < allColleges.length; idx++) {
    const college = allColleges[idx];
    console.log(`\n[${idx + 1}/${allColleges.length}] Processing College: ${college.code} — ${college.name}`);

    try {
      // Refresh session if needed
      if (idx % 15 === 0 && idx > 0) {
        cookieStr = await getAuthenticatedSession();
      }

      // Step 1: GET page for fresh ViewState
      const pageRes = await makeRequest("https://tgeapcet.nic.in/college_allotment.aspx", {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Referer": "https://tgeapcet.nic.in/default.aspx",
          "Cookie": cookieStr
        }
      });

      $ = cheerio.load(pageRes.body);
      let viewState = $("#__VIEWSTATE").val();
      let eventValidation = $("#__EVENTVALIDATION").val();
      let viewStateGen = $("#__VIEWSTATEGENERATOR").val();

      // Step 2: Postback to select College and get its specific branches
      const postData1 = querystring.stringify({
        "__EVENTTARGET": collegeSelectName,
        "__EVENTARGUMENT": "",
        "__LASTFOCUS": "",
        "__VIEWSTATE": viewState,
        "__VIEWSTATEGENERATOR": viewStateGen,
        "__EVENTVALIDATION": eventValidation,
        [collegeSelectName]: college.code
      });

      const branchRes = await makeRequest("https://tgeapcet.nic.in/college_allotment.aspx", {
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

      $ = cheerio.load(branchRes.body);
      viewState = $("#__VIEWSTATE").val();
      eventValidation = $("#__EVENTVALIDATION").val();
      viewStateGen = $("#__VIEWSTATEGENERATOR").val();

      const branches = [];
      $(`select[name='${branchSelectName}'] option`).each((_, el) => {
        const val = $(el).attr("value");
        const txt = $(el).text().trim();
        if (val && val !== "0" && val !== "") {
          branches.push({ code: val.toUpperCase(), name: txt });
        }
      });

      console.log(`   ↳ Found ${branches.length} branches for ${college.code}`);

      // Step 3: Loop through all branches for this college
      for (const branch of branches) {
        try {
          const postData2 = querystring.stringify({
            "__EVENTTARGET": "",
            "__EVENTARGUMENT": "",
            "__VIEWSTATE": viewState,
            "__VIEWSTATEGENERATOR": viewStateGen,
            "__EVENTVALIDATION": eventValidation,
            [collegeSelectName]: college.code,
            [branchSelectName]: branch.code,
            [submitBtnName]: "Show Allotments"
          });

          const tableRes = await makeRequest("https://tgeapcet.nic.in/college_allotment.aspx", {
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

          const $tbl = cheerio.load(tableRes.body);
          const records = [];

          $tbl("table tr").each((_, row) => {
            const cols = $tbl(row).find("td");
            if (cols.length >= 7) {
              const colTexts = cols.map((_, c) => $tbl(c).text().trim()).get();
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
                  admissionYear: 2026,
                  phase: "final",
                  collegeCode: college.code,
                  collegeName: college.name,
                  branchCode: branch.code,
                  branchName: branch.name,
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

          if (records.length > 0) {
            const { inserted, duplicates } = await allotmentRepository.insertBatchAllotments(records);
            grandTotalScraped += records.length;
            grandTotalInserted += inserted;
            grandTotalExisting += duplicates;
            console.log(`     ✓ [${branch.code}] Extracted: ${records.length} candidates | New: ${inserted}, Existing: ${duplicates}`);
          }

          await sleep(150); // Be respectful to TSCHE servers
        } catch (branchErr) {
          console.warn(`     ✗ Error scraping branch ${branch.code}:`, branchErr.message);
        }
      }
    } catch (collegeErr) {
      console.error(`   ✗ Error processing college ${college.code}:`, collegeErr.message);
      // Wait slightly on error
      await sleep(1000);
      cookieStr = await getAuthenticatedSession();
    }
  }

  const finalDbCount = await allotmentRepository.getTotalDatabaseRecordsCount();
  console.log("\n==========================================================================");
  console.log(" FULL SCRAPE COMPLETE FOR ALL TSCHE COLLEGES");
  console.log(` Total Candidates Scraped: ${grandTotalScraped}`);
  console.log(` New Records Inserted:    ${grandTotalInserted}`);
  console.log(` Duplicate Records Skipped: ${grandTotalExisting}`);
  console.log(` Total Records Live in Supabase: ${finalDbCount}`);
  console.log("==========================================================================");
  process.exit(0);
}

scrapeAllCollegesFullPipeline().catch(console.error);
