import * as cheerio from "cheerio";

async function test() {
  try {
    const res = await fetch("https://tgeapcet.nic.in/default.aspx", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    console.log("Status:", res.status);
    const html = await res.text();
    console.log("HTML length:", html.length);
    const $ = cheerio.load(html);
    
    // Find all links
    const links = [];
    $("a").each((i, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr("href");
      if (text || href) {
        links.push({ text, href });
      }
    });
    console.log("Found links count:", links.length);
    console.log("Sample links:", links.slice(0, 10));

    // Find tables
    console.log("Found tables count:", $("table").length);
    $("table").each((i, el) => {
      console.log(`Table ${i} text snippet:`, $(el).text().replace(/\s+/g, " ").trim().slice(0, 150));
    });
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}

test();
