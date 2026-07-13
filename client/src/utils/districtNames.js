// Maps district codes (as stored in the database) to full district names.
// Based on standard official Telangana district abbreviations — please verify
// against your actual data, since the database itself only stores codes.
export const DISTRICT_NAMES = {
  GDL: "Jogulamba Gadwal",
  HNK: "Hanamkonda",
  HYD: "Hyderabad",
  KGM: "Kamareddy",
  KHM: "Khammam",
  KRM: "Karimnagar",
  MBN: "Mahabubnagar",
  MDL: "Medchal-Malkajgiri",
  MED: "Medak",
  NKL: "Nagarkurnool",
  NLG: "Nalgonda",
  NZB: "Nizamabad",
  PDL: "Peddapalli",
  RR: "Rangareddy",
  SDP: "Siddipet",
  SRD: "Rajanna Sircilla",
  SRP: "Suryapet",
  VKB: "Vikarabad",
  WGL: "Warangal",
  WNP: "Wanaparthy",
  YBG: "Yadadri Bhuvanagiri",
};

export function getDistrictName(code) {
  return DISTRICT_NAMES[code] ?? code; // fall back to the raw code if unmapped
}