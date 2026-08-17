import https from "https";
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

async function run() {
  console.log("1. Visiting default.aspx...");
  const res1 = await makeRequest("https://tgeapcet.nic.in/default.aspx", {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });

  const setCookies = res1.headers["set-cookie"] || [];
  const cookieStr = setCookies.map((c) => c.split(";")[0]).join("; ");

  console.log("\n2. Visiting college_allotment.aspx...");
  const res2 = await makeRequest("https://tgeapcet.nic.in/college_allotment.aspx", {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Referer": "https://tgeapcet.nic.in/default.aspx",
      "Cookie": cookieStr
    }
  });

  const $ = cheerio.load(res2.body);

  const viewState = $("#__VIEWSTATE").val();
  const eventValidation = $("#__EVENTVALIDATION").val();
  const viewStateGen = $("#__VIEWSTATEGENERATOR").val();

  console.log("VIEWSTATE found:", !!viewState, "Length:", viewState?.length);
  console.log("EVENTVALIDATION found:", !!eventValidation, "Length:", eventValidation?.length);

  // Colleges dropdown
  const colleges = [];
  $("select option").each((_, el) => {
    const val = $(el).attr("value");
    const txt = $(el).text().trim();
    if (val && val !== "0" && val !== "") {
      colleges.push({ value: val, text: txt });
    }
  });

  console.log(`\nFound ${colleges.length} options in dropdowns.`);
  console.log("First 10 options:", colleges.slice(0, 10));

  // Find CBIT or other colleges in the list
  const cbit = colleges.find(c => c.text.includes("CBIT") || c.value.includes("CBIT"));
  console.log("CBIT option:", cbit);
}

run().catch(console.error);
