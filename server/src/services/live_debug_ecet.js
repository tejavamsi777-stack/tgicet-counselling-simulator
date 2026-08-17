import * as cheerio from "cheerio";
import fs from "fs";

async function run() {
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
  
  console.log("1. Fetching https://tgecet.nic.in/default.aspx ...");
  const r1 = await fetch("https://tgecet.nic.in/default.aspx", {
    headers: { "User-Agent": userAgent }
  });
  const cookie = r1.headers.get("set-cookie") || "";
  const html1 = await r1.text();
  console.log("default.aspx length:", html1.length);
  
  const $1 = cheerio.load(html1);
  $1("a").each((i, el) => {
    const txt = $1(el).text().trim();
    const href = $1(el).attr("href");
    if (txt.toLowerCase().includes("allotment") || (href && href.includes("allotment"))) {
      console.log(`Matched Link: text="${txt}" href="${href}"`);
    }
  });

  console.log("\n2. Fetching https://tgecet.nic.in/college_allotment.aspx with cookie & referer...");
  const r2 = await fetch("https://tgecet.nic.in/college_allotment.aspx", {
    headers: {
      "User-Agent": userAgent,
      "Referer": "https://tgecet.nic.in/default.aspx",
      "Cookie": cookie
    }
  });
  console.log("Status:", r2.status);
  const html2 = await r2.text();
  console.log("college_allotment.aspx length:", html2.length);
  
  const $2 = cheerio.load(html2);
  console.log("Title:", $2("title").text());
  
  const selects = [];
  $2("select").each((i, el) => {
    const id = $2(el).attr("id") || $2(el).attr("name");
    const opts = [];
    $2(el).find("option").each((j, opt) => {
      opts.push({ val: $2(opt).val(), text: $2(opt).text() });
    });
    selects.push({ id, count: opts.length, options: opts });
    console.log(`Select #${i + 1} (${id}): ${opts.length} options`);
    if (opts.length > 0) {
      console.log("First 10 options:", opts.slice(0, 10));
    }
  });

  // Save the full HTML to inspection file
  fs.writeFileSync("./src/data/tgecet_college_allotment_live.html", html2, "utf-8");
  console.log("Saved raw HTML to ./src/data/tgecet_college_allotment_live.html");
}

run().catch(console.error);
