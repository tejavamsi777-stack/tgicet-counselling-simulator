import { pool } from "../src/config/database.js";

const CANONICAL_DISTRICTS = [
  { code: "ADB", name: "Adilabad" },
  { code: "KGM", name: "Bhadradri Kothagudem" },
  { code: "GDL", name: "Jogulamba Gadwal" },
  { code: "HNK", name: "Hanamkonda" },
  { code: "HYD", name: "Hyderabad" },
  { code: "JBP", name: "Jayashankar Bhupalpally" },
  { code: "JGN", name: "Jangaon" },
  { code: "JTL", name: "Jagtial" },
  { code: "KAB", name: "Kumuram Bheem Asifabad" },
  { code: "KHM", name: "Khammam" },
  { code: "KMR", name: "Kamareddy" },
  { code: "KRM", name: "Karimnagar" },
  { code: "MBN", name: "Mahabubnagar" },
  { code: "MDL", name: "Medchal-Malkajgiri" },
  { code: "MED", name: "Medak" },
  { code: "MHB", name: "Mahabubabad" },
  { code: "MNC", name: "Mancherial" },
  { code: "MUL", name: "Mulugu" },
  { code: "NKL", name: "Nagarkurnool" },
  { code: "NLG", name: "Nalgonda" },
  { code: "NPT", name: "Narayanpet" },
  { code: "NRM", name: "Nirmal" },
  { code: "NZB", name: "Nizamabad" },
  { code: "PDL", name: "Peddapalli" },
  { code: "RR",  name: "Rangareddy" },
  { code: "SDP", name: "Siddipet" },
  { code: "SRC", name: "Rajanna Sircilla" },
  { code: "SRD", name: "Sangareddy" },
  { code: "SRP", name: "Suryapet" },
  { code: "VKB", name: "Vikarabad" },
  { code: "WGL", name: "Warangal" },
  { code: "WNP", name: "Wanaparthy" },
  { code: "YBG", name: "Yadadri Bhuvanagiri" },
];

const ALIAS_MAP = {
  "ADILABAD": "ADB",
  "ADB": "ADB",
  "BHADRADRI KOTHAGUDEM": "KGM",
  "KOTHAGUDEM": "KGM",
  "KGM": "KGM",
  "BDR": "KGM",
  "PALONCHA": "KGM",
  "JOGULAMBA GADWAL": "GDL",
  "GADWAL": "GDL",
  "GDL": "GDL",
  "HANAMKONDA": "HNK",
  "HANMAKONDA": "HNK",
  "HANUMAKONDA": "HNK",
  "HASANPARTHY": "HNK",
  "KAZIPET": "HNK",
  "HNK": "HNK",
  "HYDERABAD": "HYD",
  "HYD": "HYD",
  "SECUNDERABAD": "HYD",
  "SHAIKPET": "HYD",
  "MASABTANK": "HYD",
  "ABIDS": "HYD",
  "SAIDABAD": "HYD",
  "NARAYANAGUD A": "HYD",
  "JAYASHANKAR BHUPALPALLY": "JBP",
  "BHUPALPALLY": "JBP",
  "JBP": "JBP",
  "JANGAON": "JGN",
  "JGN": "JGN",
  "JAGTIAL": "JTL",
  "JAGITIAL": "JTL",
  "JTL": "JTL",
  "KUMURAM BHEEM ASIFABAD": "KAB",
  "ASIFABAD": "KAB",
  "KAB": "KAB",
  "KHAMMAM": "KHM",
  "KHM": "KHM",
  "SATHUPALLY": "KHM",
  "PALAIR": "KHM",
  "KAMAREDDY": "KMR",
  "KMR": "KMR",
  "KARIMNAGAR": "KRM",
  "KRM": "KRM",
  "HUZURABAD": "KRM",
  "MAHABUBNAGAR": "MBN",
  "MAHABUBNAGA R": "MBN",
  "MBN": "MBN",
  "KOSGI": "MBN",
  "MEDCHAL-MALKAJGIRI": "MDL",
  "MEDCHAL": "MDL",
  "MDL": "MDL",
  "BACHUPALLY": "MDL",
  "BOWRAMPET": "MDL",
  "DHULAPALLY": "MDL",
  "DUNDIGAL": "MDL",
  "GHATKESAR": "MDL",
  "KANDLAKOYA": "MDL",
  "KEESARA": "MDL",
  "KUKATPALLY": "MDL",
  "MAISAMMAGUD A": "MDL",
  "MYSAMMAGUD A": "MDL",
  "UPPAL": "MDL",
  "MEDAK": "MED",
  "MED": "MED",
  "NARSAPUR": "MED",
  "MAHABUBABAD": "MHB",
  "MHB": "MHB",
  "MANCHERIAL": "MNC",
  "MNC": "MNC",
  "MULUGU": "MUL",
  "MUL": "MUL",
  "NAGARKURNOOL": "NKL",
  "NKL": "NKL",
  "NALGONDA": "NLG",
  "NLG": "NLG",
  "MIRYALAGUDA": "NLG",
  "CHOUTUPPAL": "YBG",
  "NARAYANPET": "NPT",
  "NPT": "NPT",
  "NIRMAL": "NRM",
  "NRM": "NRM",
  "NIZAMABAD": "NZB",
  "NZB": "NZB",
  "ARMOOR": "NZB",
  "RUDRUR": "NZB",
  "PEDDAPALLI": "PDL",
  "PEDDAPALLY": "PDL",
  "PDL": "PDL",
  "MANTHANI": "PDL",
  "RANGAREDDY": "RR",
  "RANGA REDDY": "RR",
  "RR": "RR",
  "BANDLAGUDA": "RR",
  "BATASINGARAM": "RR",
  "CHILKUR": "RR",
  "GANDIPET": "RR",
  "HAYATHNAGAR": "RR",
  "IBRAHIMPATAN": "RR",
  "IBRAHIMPATNA M": "RR",
  "KACHIVANI SINGARAM": "RR",
  "KACHWANISING ARAM": "RR",
  "KUNTLOOR": "RR",
  "MEERPET": "RR",
  "MIRPET": "RR",
  "MOINABAD": "RR",
  "NADERGUL": "RR",
  "NAGOLE": "RR",
  "SHAMSHABAD": "RR",
  "YENKAPALLY": "RR",
  "SIDDIPET": "SDP",
  "SDP": "SDP",
  "HUSNABAD": "SDP",
  "RAJANNA SIRCILLA": "SRC",
  "SIRCILLA": "SRC",
  "SRC": "SRC",
  "AGRAHARAM RAJANNA": "SRC",
  "SAIGRRCAILHLAARAM RAJANNA": "SRC",
  "SIRCILLA SULTANPUR": "SRC",
  "SANGAREDDY": "SRD",
  "SRD": "SRD",
  "PATANCHERU": "SRD",
  "SULTANPUR": "SRD",
  "SURYAPET": "SRP",
  "SURYAPETA": "SRP",
  "SRP": "SRP",
  "KODAD": "SRP",
  "KODADA": "SRP",
  "VIKARABAD": "VKB",
  "VKB": "VKB",
  "WARANGAL": "WGL",
  "WGL": "WGL",
  "NARSAMPET": "WGL",
  "WANAPARTHY": "WNP",
  "WNP": "WNP",
  "YADADRI BHUVANAGIRI": "YBG",
  "BHONGIR": "YBG",
  "YBG": "YBG",
  "DESHMUKHI": "YBG",
  "NARSINGAYAPAL LY VILLAGE": "YBG",
};

async function clean() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Ensure canonical district records exist and have canonical codes and names
    const canonicalIdMap = {};
    for (const cd of CANONICAL_DISTRICTS) {
      const existing = await client.query(
        "SELECT id FROM districts WHERE UPPER(code) = $1",
        [cd.code.toUpperCase()]
      );
      if (existing.rows.length > 0) {
        canonicalIdMap[cd.code] = existing.rows[0].id;
        await client.query(
          "UPDATE districts SET code = $1, name = $2 WHERE id = $3",
          [cd.code, cd.name, existing.rows[0].id]
        );
      } else {
        const inserted = await client.query(
          "INSERT INTO districts (code, name) VALUES ($1, $2) RETURNING id",
          [cd.code, cd.name]
        );
        canonicalIdMap[cd.code] = inserted.rows[0].id;
      }
    }

    // 2. Fetch all districts in table
    const { rows: allDistricts } = await client.query("SELECT id, code, name FROM districts");

    // 3. For every district that maps to a canonical code, update colleges to point to the canonical ID
    let updatedCollegesCount = 0;
    for (const d of allDistricts) {
      const rawCode = (d.code || "").toString().trim().toUpperCase();
      const rawName = (d.name || "").toString().trim().toUpperCase();
      const targetCanonicalCode = ALIAS_MAP[rawCode] || ALIAS_MAP[rawName];

      if (targetCanonicalCode && canonicalIdMap[targetCanonicalCode]) {
        const targetId = canonicalIdMap[targetCanonicalCode];
        if (targetId !== d.id) {
          const res = await client.query(
            "UPDATE colleges SET district_id = $1 WHERE district_id = $2",
            [targetId, d.id]
          );
          updatedCollegesCount += res.rowCount;
        }
      }
    }
    console.log(`Updated ${updatedCollegesCount} colleges to canonical district IDs.`);

    // 4. Delete orphan non-canonical district rows
    const canonicalIds = Object.values(canonicalIdMap);
    const delRes = await client.query(
      "DELETE FROM districts WHERE id != ALL($1::int[]) AND id NOT IN (SELECT DISTINCT district_id FROM colleges WHERE district_id IS NOT NULL)",
      [canonicalIds]
    );
    console.log(`Deleted ${delRes.rowCount} orphan district rows.`);

    await client.query("COMMIT");
    console.log("Districts clean migration completed successfully!");
    process.exit(0);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Clean migration error:", err);
    process.exit(1);
  } finally {
    client.release();
  }
}

clean();
