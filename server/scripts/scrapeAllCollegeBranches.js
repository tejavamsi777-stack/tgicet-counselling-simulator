import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ALL_TSCHE_COLLEGES } from "../src/data/allTscheInstitutions.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export async function fetchAllOfficialCollegeBranches() {
  console.log("Starting full college branches scraping from official portal...");

  const cookies = [];
  const extractCookies = (res) => {
    const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get("set-cookie")];
    for (const c of raw) {
      if (!c) continue;
      const part = c.split(";")[0].trim();
      if (part && !cookies.some(x => x.startsWith(part.split("=")[0] + "="))) {
        cookies.push(part);
      }
    }
  };

  // 1. Session handshake
  const initRes = await fetch("https://tgeapcet.nic.in/default.aspx", {
    headers: { "User-Agent": userAgent }
  });
  extractCookies(initRes);

  const getRes = await fetch("https://tgeapcet.nic.in/college_allotment.aspx", {
    headers: { "User-Agent": userAgent, Referer: "https://tgeapcet.nic.in/default.aspx", Cookie: cookies.join("; ") }
  });
  extractCookies(getRes);

  let html = await getRes.text();
  let $ = cheerio.load(html);

  let viewState = $('#__VIEWSTATE').val();
  let viewStateGen = $('#__VIEWSTATEGENERATOR').val();
  let eventValidation = $('#__EVENTVALIDATION').val();

  const collegeSelectName = $('select').first().attr('name') || 'SMPage$MainContent$DropDownList1';
  const branchSelectName = $('select').eq(1).attr('name') || 'SMPage$MainContent$DropDownList2';

  // Extract all official colleges in dropdown
  const colleges = [];
  $(`select[name="${collegeSelectName}"] option`).each((_, el) => {
    const val = $(el).attr('value');
    const text = $(el).text().trim();
    if (val && val !== '0') {
      colleges.push({ code: val.toUpperCase(), name: text });
    }
  });

  console.log(`Found ${colleges.length} official colleges in dropdown.`);

  const collegeBranchMap = {};

  for (let i = 0; i < colleges.length; i++) {
    const college = colleges[i];
    const cCode = college.code;

    try {
      // Toggle if AARM or default
      if (i === 0) {
        const toggleForm = new URLSearchParams();
        toggleForm.append('__EVENTTARGET', collegeSelectName);
        toggleForm.append('__VIEWSTATE', viewState);
        if (viewStateGen) toggleForm.append('__VIEWSTATEGENERATOR', viewStateGen);
        if (eventValidation) toggleForm.append('__EVENTVALIDATION', eventValidation);
        toggleForm.append(collegeSelectName, 'ACEG');

        const toggleRes = await fetch("https://tgeapcet.nic.in/college_allotment.aspx", {
          method: 'POST',
          headers: { 'User-Agent': userAgent, 'Content-Type': 'application/x-www-form-urlencoded', Referer: 'https://tgeapcet.nic.in/college_allotment.aspx', Cookie: cookies.join("; ") },
          body: toggleForm.toString()
        });
        extractCookies(toggleRes);
        html = await toggleRes.text();
        $ = cheerio.load(html);
        viewState = $('#__VIEWSTATE').val();
        viewStateGen = $('#__VIEWSTATEGENERATOR').val();
        eventValidation = $('#__EVENTVALIDATION').val();
      }

      const formParams = new URLSearchParams();
      formParams.append('__EVENTTARGET', collegeSelectName);
      formParams.append('__VIEWSTATE', viewState);
      if (viewStateGen) formParams.append('__VIEWSTATEGENERATOR', viewStateGen);
      if (eventValidation) formParams.append('__EVENTVALIDATION', eventValidation);
      formParams.append(collegeSelectName, cCode);

      const postRes = await fetch("https://tgeapcet.nic.in/college_allotment.aspx", {
        method: 'POST',
        headers: { 'User-Agent': userAgent, 'Content-Type': 'application/x-www-form-urlencoded', Referer: 'https://tgeapcet.nic.in/college_allotment.aspx', Cookie: cookies.join("; ") },
        body: formParams.toString()
      });
      extractCookies(postRes);

      html = await postRes.text();
      $ = cheerio.load(html);

      viewState = $('#__VIEWSTATE').val();
      viewStateGen = $('#__VIEWSTATEGENERATOR').val();
      eventValidation = $('#__EVENTVALIDATION').val();

      const branches = [];
      $(`select[name="${branchSelectName}"] option`).each((_, el) => {
        const val = $(el).attr('value');
        const text = $(el).text().trim();
        if (val && val !== '0') {
          branches.push({ code: val.toUpperCase(), name: text });
        }
      });

      collegeBranchMap[cCode] = branches;
      console.log(`[${i + 1}/${colleges.length}] ${cCode}: ${branches.map(b => b.code).join(", ")}`);

      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`Error fetching branches for ${cCode}:`, err.message);
    }
  }

  const outPath = path.resolve(__dirname, "../src/data/officialCollegeBranches.json");
  fs.writeFileSync(outPath, JSON.stringify(collegeBranchMap, null, 2), "utf-8");
  console.log(`Saved official college branch map to ${outPath}`);
  return collegeBranchMap;
}

if (process.argv[1]?.includes("scrapeAllCollegeBranches.js")) {
  fetchAllOfficialCollegeBranches().then(() => process.exit(0)).catch(console.error);
}
