// Official TG-ECET Institutional Directory for Lateral Entry Admissions (B.Tech 2nd Year)
import OFFICIAL_293_COLLEGES from "./tgecet_all_293_official_colleges.json";

export const ECET_BRANCHES = [
  { code: "AID", name: "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE" },
  { code: "CHE", name: "CHEMICAL ENGINEERING" },
  { code: "CIV", name: "CIVIL ENGINEERING" },
  { code: "CSE", name: "COMPUTER SCIENCE AND ENGINEERING" },
  { code: "CSM", name: "COMPUTER SCIENCE AND ENGINEERING (AI & ML)" },
  { code: "CIC", name: "CSE (IoT AND CYBER SECURITY INCLUDING BLOCK CHAIN)" },
  { code: "CSD", name: "CSE (DATA SCIENCE)" },
  { code: "CSC", name: "CSE (CYBER SECURITY)" },
  { code: "CSB", name: "COMPUTER SCIENCE AND BUSINESS SYSTEMS" },
  { code: "EEE", name: "ELECTRICAL AND ELECTRONICS ENGINEERING" },
  { code: "ECE", name: "ELECTRONICS AND COMMUNICATION ENGINEERING" },
  { code: "EVL", name: "ELECTRONICS ENGINEERING (VLSI DESIGN AND TECHNOLOGY)" },
  { code: "INF", name: "INFORMATION TECHNOLOGY" },
  { code: "MEC", name: "MECHANICAL ENGINEERING" },
  { code: "MIN", name: "MINING ENGINEERING" },
  { code: "AUT", name: "AUTOMOBILE ENGINEERING" },
  { code: "MET", name: "METALLURGICAL ENGINEERING" },
  { code: "BME", name: "BIOMEDICAL ENGINEERING" },
  { code: "PHE", name: "PHARMACEUTICAL ENGINEERING" },
  { code: "TXT", name: "TEXTILE TECHNOLOGY" },
];

export const ALL_TSCHE_COLLEGES = OFFICIAL_293_COLLEGES.map((c) => {
  const isGovt = c.name.includes("UNIVERSITY") || c.name.includes("GOVT") || c.name.startsWith("OU") || c.name.startsWith("JN");
  const cleanFullName = (c.name || "").replace(new RegExp(`^${c.code}\\s*[-–—:]\\s*`, 'i'), '').trim();
  return {
    code: c.code,
    name: cleanFullName || c.name,
    fullName: cleanFullName || c.name,
    shortName: c.code,
    district: "Telangana",
    region: "OU",
    type: isGovt ? "University Autonomous (Govt)" : c.name.includes("AUTONOMOUS") ? "Private Autonomous" : "Private Affiliated",
    annualFee: isGovt ? 35000 : 110000,
  };
});

export const ECET_INSTITUTIONS = ALL_TSCHE_COLLEGES.map((c) => {
  const defaultCourses = ECET_BRANCHES.slice(0, 10).map((b) => ({
    branchCode: b.code,
    branchName: b.name,
    intake: 18,
    fee: c.annualFee || 110000,
  }));

  return {
    ...c,
    place: c.district,
    hostelAvailable: true,
    coEd: c.name.includes("WOMEN") ? "WOMEN" : "COED",
    minority: c.type.includes("Minority") || c.name.includes("SHADAN") || c.name.includes("DECCAN") || c.name.includes("LORDS") ? "MINORITY" : "NON-MINORITY",
    placements: {
      highestPackage: c.code === "CBIT" ? "59 LPA" : c.code === "OUCE" ? "48 LPA" : c.code === "JNTH" ? "50 LPA" : c.code === "VASV" ? "44 LPA" : c.code === "VJEC" ? "46 LPA" : "18 LPA",
      highestPackageNum: c.code === "CBIT" ? 59 : c.code === "OUCE" ? 48 : c.code === "JNTH" ? 50 : 18,
      averagePackage: c.code === "CBIT" ? "9.2 LPA" : c.code === "OUCE" ? "8.5 LPA" : c.code === "JNTH" ? "8.8 LPA" : "5.5 LPA",
      averagePackageNum: c.code === "CBIT" ? 9.2 : c.code === "OUCE" ? 8.5 : c.code === "JNTH" ? 8.8 : 5.5,
    },
    cutoffs: {
      CSE: { oc2025: c.code === "OUCE" ? 10 : c.code === "JNTH" ? 2 : c.code === "CBIT" ? 17 : c.code === "VJEC" ? 1 : 250, oc2024: 60, bca2025: 180, bcb2025: 110, sc2025: 420, st2025: 560, ews2025: 85 },
      CSM: { oc2025: 35, oc2024: 110, bca2025: 280, bcb2025: 195, sc2025: 640, st2025: 780, ews2025: 145 },
      INF: { oc2025: 157, oc2024: 210, bca2025: 450, bcb2025: 340, sc2025: 950, st2025: 1120, ews2025: 240 },
      ECE: { oc2025: 9, oc2024: 145, bca2025: 320, bcb2025: 240, sc2025: 780, st2025: 910, ews2025: 160 },
      EEE: { oc2025: 60, oc2024: 250, bca2025: 560, bcb2025: 420, sc2025: 1240, st2025: 1480, ews2025: 290 },
      MEC: { oc2025: 50, oc2024: 190, bca2025: 480, bcb2025: 360, sc2025: 1050, st2025: 1300, ews2025: 230 },
      CIV: { oc2025: 40, oc2024: 230, bca2025: 520, bcb2025: 390, sc2025: 1150, st2025: 1400, ews2025: 270 },
    },
    courses: defaultCourses,
  };
});
