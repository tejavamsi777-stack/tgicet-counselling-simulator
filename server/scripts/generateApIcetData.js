const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/tgicet_db'
});

const AP_ICET_COLLEGES = [
  { code: "AUCA", name: "Andhra University College of Arts & Commerce, Visakhapatnam", district: "Visakhapatnam", type: "University", mbaMin: 50, mbaMax: 2800, mcaMin: 60, mcaMax: 2400 },
  { code: "SVUC", name: "Sri Venkateswara University College, Tirupati", district: "Tirupati", type: "University", mbaMin: 120, mbaMax: 3500, mcaMin: 150, mcaMax: 3200 },
  { code: "JNTK", name: "JNTU College of Engineering - School of Management, Kakinada", district: "Kakinada", type: "University", mbaMin: 180, mbaMax: 4200, mcaMin: 200, mcaMax: 3800 },
  { code: "JNTA", name: "JNTU College of Engineering, Anantapur", district: "Anantapur", type: "University", mbaMin: 250, mbaMax: 5100, mcaMin: 280, mcaMax: 4600 },
  { code: "ANUC", name: "Acharya Nagarjuna University College, Guntur", district: "Guntur", type: "University", mbaMin: 320, mbaMax: 6500, mcaMin: 350, mcaMax: 5900 },
  { code: "SKUC", name: "Sri Krishnadevaraya University College, Anantapur", district: "Anantapur", type: "University", mbaMin: 450, mbaMax: 7800, mcaMin: 400, mcaMax: 7200 },
  { code: "AKNU", name: "Adikavi Nannaya University College, Rajahmundry", district: "East Godavari", type: "University", mbaMin: 500, mbaMax: 8500, mcaMin: 520, mcaMax: 8100 },
  { code: "YVUC", name: "Yogi Vemana University College, Kadapa", district: "Kadapa", type: "University", mbaMin: 600, mbaMax: 9200, mcaMin: 580, mcaMax: 8800 },
  { code: "KRUC", name: "Krishna University College, Machilipatnam", district: "Krishna", type: "University", mbaMin: 650, mbaMax: 9800, mcaMin: 620, mcaMax: 9400 },
  { code: "RAYU", name: "Rayalaseema University College, Kurnool", district: "Kurnool", type: "University", mbaMin: 700, mbaMax: 10500, mcaMin: 680, mcaMax: 10200 },
  
  { code: "GVPV", name: "Gayatri Vidya Parishad College of Engineering, Visakhapatnam", district: "Visakhapatnam", type: "Private", mbaMin: 800, mbaMax: 12500, mcaMin: 750, mcaMax: 11800 },
  { code: "VRSE", name: "Velagapudi Ramakrishna Siddhartha Engineering College, Vijayawada", district: "NTR", type: "Private", mbaMin: 850, mbaMax: 13200, mcaMin: 800, mcaMax: 12400 },
  { code: "RVRJ", name: "RVR & JC College of Engineering, Guntur", district: "Guntur", type: "Private", mbaMin: 900, mbaMax: 14500, mcaMin: 850, mcaMax: 13800 },
  { code: "SRKR", name: "SRKR Engineering College, Bhimavaram", district: "West Godavari", type: "Private", mbaMin: 1100, mbaMax: 16000, mcaMin: 1000, mcaMax: 15200 },
  { code: "SVCE", name: "Sri Venkateswara College of Engineering, Tirupati", district: "Tirupati", type: "Private", mbaMin: 1200, mbaMax: 17500, mcaMin: 1150, mcaMax: 16800 },
  { code: "MITS", name: "Madanapalle Institute of Technology & Science, Madanapalle", district: "Annamayya", type: "Private", mbaMin: 1400, mbaMax: 19000, mcaMin: 1300, mcaMax: 18200 },
  { code: "PVPV", name: "Prasad V Potluri Siddhartha Institute of Technology, Vijayawada", district: "NTR", type: "Private", mbaMin: 1500, mbaMax: 20500, mcaMin: 1400, mcaMax: 19500 },
  { code: "ALIS", name: "Andhra Loyola Institute of Engineering & Technology, Vijayawada", district: "NTR", type: "Private", mbaMin: 1600, mbaMax: 22000, mcaMin: 1500, mcaMax: 21000 },
  { code: "NBKR", name: "NBKR Institute of Science & Technology, Vidyanagar", district: "Nellore", type: "Private", mbaMin: 1800, mbaMax: 24000, mcaMin: 1700, mcaMax: 23000 },
  { code: "ADTP", name: "Aditya Engineering College, Surampalem", district: "East Godavari", type: "Private", mbaMin: 1900, mbaMax: 25500, mcaMin: 1800, mcaMax: 24500 },
  { code: "LBRC", name: "Lakireddy Bali Reddy College of Engineering, Mylavaram", district: "NTR", type: "Private", mbaMin: 2000, mbaMax: 27000, mcaMin: 1900, mcaMax: 26000 },
  { code: "VIGN", name: "Vignan's Institute of Information Technology, Visakhapatnam", district: "Visakhapatnam", type: "Private", mbaMin: 2100, mbaMax: 28500, mcaMin: 2000, mcaMax: 27500 },
  { code: "GTEC", name: "Gates Institute of Technology, Gooty", district: "Anantapur", type: "Private", mbaMin: 2300, mbaMax: 31000, mcaMin: 2200, mcaMax: 30000 },
  { code: "GIET", name: "Godavari Institute of Engineering & Technology, Rajahmundry", district: "East Godavari", type: "Private", mbaMin: 2500, mbaMax: 33000, mcaMin: 2400, mcaMax: 32000 },
  { code: "ANIL", name: "Anil Neerukonda Institute of Technology & Sciences, Visakhapatnam", district: "Visakhapatnam", type: "Private", mbaMin: 1300, mbaMax: 18000, mcaMin: 1200, mcaMax: 17000 }
];

const CATEGORIES = ["OC", "BC_A", "BC_B", "BC_C", "BC_D", "BC_E", "SC", "ST", "EWS"];
const REGIONS = ["AU", "SVU", "OU", "NL"];

async function main() {
  console.log("Generating AP ICET Allotments Data...");

  const summaryColleges = [];
  const recordsToInsert = [];

  let rankCounter = 101;

  for (const c of AP_ICET_COLLEGES) {
    const branchesSummary = [
      {
        code: "MBA",
        name: "MASTER OF BUSINESS ADMINISTRATION",
        totalSeats: 120,
        openingRank: c.mbaMin,
        closingRank: c.mbaMax
      },
      {
        code: "MCA",
        name: "MASTER OF COMPUTER APPLICATIONS",
        totalSeats: 60,
        openingRank: c.mcaMin,
        closingRank: c.mcaMax
      }
    ];

    summaryColleges.push({
      code: c.code,
      name: `${c.code} - ${c.name}`,
      district: c.district,
      type: c.type,
      coursesOffered: ["MBA", "MCA"],
      totalAllotted: 180,
      branchesSummary
    });

    // Generate 40 allotment records per college for database
    for (let i = 0; i < 40; i++) {
      const isMba = i % 2 === 0;
      const branchCode = isMba ? "MBA" : "MCA";
      const branchName = isMba ? "MASTER OF BUSINESS ADMINISTRATION" : "MASTER OF COMPUTER APPLICATIONS";
      const minR = isMba ? c.mbaMin : c.mcaMin;
      const maxR = isMba ? c.mbaMax : c.mcaMax;
      const rank = Math.floor(minR + (i / 40) * (maxR - minR) + Math.random() * 50);

      const cat = CATEGORIES[i % CATEGORIES.length];
      const gender = i % 3 === 0 ? "F" : "M";
      const seatCategory = `${cat}_${gender === "F" ? "GIRLS" : "GEN"}_${i % 2 === 0 ? "AU" : "SVU"}`;

      recordsToInsert.push({
        exam_id: "ap-icet",
        college_code: c.code,
        college_name: c.name,
        branch_code: branchCode,
        branch_name: branchName,
        hall_ticket_no: `25${c.code}900${i + 10}`,
        candidate_name: `AP ICET CANDIDATE ${c.code} ${i + 1}`,
        gender,
        caste_category: cat,
        seat_category: seatCategory,
        allotment_rank: rank,
        phase: "Phase-1",
        year: 2025
      });
    }
  }

  const summaryObj = {
    exam: "ap-icet",
    portal: "https://cets.apsche.ap.gov.in/ICET",
    lastUpdated: new Date().toISOString(),
    totalColleges: summaryColleges.length,
    colleges: summaryColleges
  };

  // Write client summary
  const clientDir = path.join(__dirname, '../../client/src/data/ap_icet_allotments');
  fs.mkdirSync(clientDir, { recursive: true });
  fs.writeFileSync(path.join(clientDir, 'allotments_summary.json'), JSON.stringify(summaryObj, null, 2));

  // Write server summary
  const serverDir = path.join(__dirname, '../src/data/ap_icet_allotments');
  fs.mkdirSync(serverDir, { recursive: true });
  fs.writeFileSync(path.join(serverDir, 'allotments_summary.json'), JSON.stringify(summaryObj, null, 2));

  console.log(`Summary files written to client & server! Total Colleges: ${summaryColleges.length}`);

  // Seed DB if table exists
  try {
    const client = await pool.connect();
    console.log("Seeding PostgreSQL eapcet_allotment_records with AP ICET data...");

    // Remove existing ap-icet records
    await client.query("DELETE FROM eapcet_allotment_records WHERE exam_id = 'ap-icet'");

    for (const r of recordsToInsert) {
      await client.query(`
        INSERT INTO eapcet_allotment_records 
        (exam_id, college_code, college_name, branch_code, branch_name, hall_ticket_no, candidate_name, gender, caste_category, seat_category, allotment_rank, phase, year)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [r.exam_id, r.college_code, r.college_name, r.branch_code, r.branch_name, r.hall_ticket_no, r.candidate_name, r.gender, r.caste_category, r.seat_category, r.allotment_rank, r.phase, r.year]);
    }

    client.release();
    console.log(`Successfully seeded ${recordsToInsert.length} AP ICET records into PostgreSQL database!`);
  } catch (err) {
    console.warn("Database seed skipped or failed (will fallback to JSON backup):", err.message);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
