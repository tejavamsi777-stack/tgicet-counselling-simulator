import { scrapeOfficialTgEcetAllotment } from "./tgEcetAllotmentScraper.js";

async function testBatch() {
  const tests = [
    { c: "CBIT", b: "CSE" },
    { c: "CBIT", b: "INF" },
    { c: "CBIT", b: "ECE" },
    { c: "OUCE", b: "CSE" },
    { c: "OUCE", b: "ECE" },
    { c: "JNTH", b: "CSE" },
    { c: "VASV", b: "CSE" },
    { c: "VNRV", b: "CSE" },
    { c: "CVRH", b: "CSE" },
    { c: "GRET", b: "CSE" },
  ];

  for (const t of tests) {
    const res = await scrapeOfficialTgEcetAllotment(t.c, t.b);
    if (res) {
      console.log(`[PASS] ${t.c} - ${t.b}: Total seats = ${res.totalSeats}, Opening rank = ${res.openingRank}, Closing rank = ${res.closingRank}`);
      console.log(`       Top 2 candidates:`, res.candidates.slice(0, 2).map(x => `${x.rank}: ${x.name} (${x.seatCategory})`));
    } else {
      console.log(`[FAIL] ${t.c} - ${t.b}: null returned`);
    }
  }
}

testBatch().catch(console.error);
