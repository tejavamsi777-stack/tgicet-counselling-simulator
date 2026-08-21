// Maps district codes (as stored in the database) to full district names.
// Includes Telangana (33 districts) and Andhra Pradesh (16 districts).

export const DISTRICT_NAMES = {
  // ── Telangana ──────────────────────────────────────────────────────────────
  ADB: "Adilabad",
  BDR: "Bhadradri Kothagudem",
  GDL: "Jogulamba Gadwal",
  HNK: "Hanamkonda",
  HYD: "Hyderabad",
  JBP: "Jayashankar Bhupalpally",
  JGN: "Jangaon",
  JTL: "Jagtial",
  KAB: "Kumuram Bheem Asifabad",
  KGM: "Bhadradri Kothagudem",
  KHM: "Khammam",
  KMR: "Kamareddy",
  KRM: "Karimnagar",
  MBN: "Mahabubnagar",
  MDL: "Medchal-Malkajgiri",
  MED: "Medak",
  MHB: "Mahabubabad",
  MNC: "Mancherial",
  MUL: "Mulugu",
  NKL: "Nagarkurnool",
  NLG: "Nalgonda",
  NPT: "Narayanpet",
  NRM: "Nirmal",
  NZB: "Nizamabad",
  PDL: "Peddapalli",
  RR: "Rangareddy",
  SDP: "Siddipet",
  SRC: "Rajanna Sircilla",
  SRD: "Sangareddy",
  SRP: "Suryapet",
  VKB: "Vikarabad",
  WGL: "Warangal",
  WNP: "Wanaparthy",
  YBG: "Yadadri Bhuvanagiri",

  // ── Andhra Pradesh ─────────────────────────────────────────────────────────
  ANN: "Annamayya",
  ATP: "Anantapur",
  CTR: "Chittoor",
  EG:  "East Godavari",
  GTR: "Guntur",
  KDP: "YSR Kadapa",
  KNL: "Kurnool",
  KRI: "Krishna",
  NLR: "SPSR Nellore",
  NTR: "NTR",
  PKS: "Prakasam",
  PLN: "Palnadu",
  SKL: "Srikakulam",
  VSP: "Visakhapatnam",
  VZM: "Vizianagaram",
  WG:  "West Godavari",
};

export function getDistrictName(code) {
  if (!code) return "";
  const trimmed = code.toString().trim().toUpperCase();
  return DISTRICT_NAMES[trimmed] || code;
}