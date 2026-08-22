import { PGECET_INSTITUTIONS, PGECET_BRANCHES } from '../data/pgecetInstitutions';
import allotmentsSummary from '../data/pgecet_allotments/allotments_summary.json';

let cachedAllotments = null;
async function getAllotmentRecords() {
  if (!cachedAllotments) {
    const mod = await import('../data/pgecet_allotments/allotments.json');
    cachedAllotments = mod.default || mod;
  }
  return cachedAllotments;
}

function getCanonicalBranch(rawName) {
  if (!rawName) return "";
  const s = rawName.toUpperCase().trim();
  if (s.includes("COMPUTER SCIENCE") || s.includes("CSE")) return "Computer Science & Engineering (CSE)";
  if (s.includes("ARTIFICIAL INTELLIGENCE") && (s.includes("DATA") || s.includes("DATA SCIENCE"))) return "AI & Data Science (AIDS)";
  if (s.includes("ARTIFICIAL INTELLIGENCE") && (s.includes("MACHINE") || s.includes("AIML"))) return "AI & Machine Learning (AIML)";
  if (s.includes("ARTIFICIAL INTELLIGENCE") || s.includes("ROBOTICS")) return "AI & Robotics";
  if (s.includes("DATA SCIENCE")) return "Data Science";
  if (s.includes("CYBER")) return "Cyber Security";
  if (s.includes("SOFTWARE")) return "Software Engineering";
  if (s.includes("VLSI") && (s.includes("EMBEDDED") || s.includes("EMBEDED"))) return "VLSI & Embedded Systems";
  if (s.includes("VLSI")) return "VLSI System Design";
  if (s.includes("EMBEDDED") || s.includes("EMBEDED")) return "Embedded Systems";
  if (s.includes("POWER") && s.includes("ELECTRONIC")) return "Power Electronics & Drives";
  if (s.includes("POWER")) return "Power Systems Engineering";
  if (s.includes("STRUCTURAL")) return "Structural Engineering";
  if (s.includes("TRANSPORT") || s.includes("HIGHWAY")) return "Transportation / Highway Engg";
  if (s.includes("GEO-TECHNICAL") || s.includes("GEOTECHNICAL")) return "Geo-Technical Engineering";
  if (s.includes("CAD") || s.includes("CAM")) return "CAD / CAM";
  if (s.includes("THERMAL")) return "Thermal Engineering";
  if (s.includes("MACHINE DESIGN") || s.includes("ENGINEERING DESIGN") || s.includes("DESIGN ENGINEERING")) return "Machine Design";
  if (s.includes("ADVANCED MANUFACTURING") || s.includes("PRODUCTION")) return "Manufacturing / Production Engg";
  if (s.includes("DIGITAL SYSTEMS") || s.includes("DIGITAL ELECTRONICS")) return "Digital Systems";
  if (s.includes("COMMUNICATION") || s.includes("MICROWAVE") || s.includes("RADAR")) return "Communication Engineering";
  if (s.includes("SIGNAL PROCESSING")) return "Signal Processing";
  if (s.includes("ENVIRONMENTAL")) return "Environmental Management";
  if (s.includes("BIO-TECHNOLOGY") || s.includes("BIOTECHNOLOGY")) return "Bio-Technology";
  if (s.includes("BIO-MEDICAL") || s.includes("BIOMEDICAL")) return "Bio-Medical Electronics";
  if (s.includes("CHEMICAL")) return "Chemical Engineering";
  if (s.includes("AEROSPACE")) return "Aerospace Engineering";
  return rawName;
}

export const pgecetApi = {
  getInstitutions: () => Promise.resolve({ data: PGECET_INSTITUTIONS }),
  getBranches: () => Promise.resolve({ data: PGECET_BRANCHES }),
  getAllotmentsSummary: () => Promise.resolve({ data: allotmentsSummary }),
  getCollegeAllotments: async (collegeCode, branchName = '') => {
    const allAllotments = await getAllotmentRecords();
    const records = allAllotments.filter((rec) => {
      const matchCode = rec.college_code.toUpperCase() === collegeCode.toUpperCase();
      if (!matchCode) return false;
      if (branchName) {
        return rec.branch_name.toUpperCase() === branchName.toUpperCase();
      }
      return true;
    });
    return { data: { candidates: records, total: records.length } };
  },
  predict: (rankOrScore, isGate = false, category = 'OC', gender = 'M', branch = '') => {
    const numericVal = Number(rankOrScore);
    if (!numericVal || numericVal <= 0) return Promise.resolve({ data: [] });

    const matches = allotmentsSummary.filter((item) => {
      if (branch) {
        const itemCanon = getCanonicalBranch(item.branch_name);
        const searchCanon = getCanonicalBranch(branch);
        if (itemCanon !== searchCanon) return false;
      }
      const quota = item.allotted_category.toUpperCase();
      const matchCategory = quota.includes(category.toUpperCase()) || quota.includes('OPEN') || quota.includes('OC');
      const matchGender = gender === 'F' ? true : !quota.includes('FEMALE');
      
      if (!matchCategory || !matchGender) return false;

      if (isGate) {
        return item.gate_scores && item.gate_scores.length > 0;
      } else {
        return item.ranks && item.ranks.length > 0;
      }
    });

    const results = matches.map((item) => {
      let chance = 'Low';
      let probability = 30;

      if (isGate) {
        const scores = item.gate_scores.map(Number).filter(Boolean);
        const minGate = Math.min(...scores);
        const maxGate = Math.max(...scores);

        if (numericVal >= maxGate) {
          chance = 'High (Very Safe)';
          probability = 95;
        } else if (numericVal >= minGate) {
          chance = 'Good (Safe)';
          probability = 75;
        } else if (numericVal >= minGate - 50) {
          chance = 'Moderate (Borderline)';
          probability = 50;
        }

        return {
          college_code: item.college_code,
          college_name: item.college_name,
          branch_name: item.branch_name,
          allotted_category: item.allotted_category,
          min_val: minGate,
          max_val: maxGate,
          chance,
          probability,
          isGate: true
        };
      } else {
        const closing = item.max_rank;
        const opening = item.min_rank;

        if (numericVal <= opening) {
          chance = 'High (Very Safe)';
          probability = 95;
        } else if (numericVal <= closing) {
          chance = 'Good (Safe)';
          probability = 75;
        } else if (numericVal <= closing * 1.25) {
          chance = 'Moderate (Borderline)';
          probability = 50;
        }

        return {
          college_code: item.college_code,
          college_name: item.college_name,
          branch_name: item.branch_name,
          allotted_category: item.allotted_category,
          min_val: opening,
          max_val: closing,
          chance,
          probability,
          isGate: false
        };
      }
    });

    results.sort((a, b) => {
      if (b.probability !== a.probability) {
        return b.probability - a.probability;
      }
      if (isGate) {
        return b.min_val - a.min_val;
      } else {
        return a.max_val - b.max_val;
      }
    });

    return Promise.resolve({ data: results });
  },
};
