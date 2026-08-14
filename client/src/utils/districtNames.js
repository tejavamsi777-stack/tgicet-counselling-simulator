// Maps district codes (as stored in the database) to full district names.
// Complete 33 district mappings for Telangana State.

export const DISTRICT_NAMES = {
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
};

export function getDistrictName(code) {
  if (!code) return "";
  const trimmed = code.toString().trim().toUpperCase();
  return DISTRICT_NAMES[trimmed] || code;
}