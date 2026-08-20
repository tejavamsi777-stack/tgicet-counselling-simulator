import { PGECET_INSTITUTIONS, PGECET_BRANCHES } from '../data/pgecetInstitutions';
import allotmentsSummary from '../data/pgecet_allotments/allotments_summary.json';
import allAllotments from '../data/pgecet_allotments/allotments.json';

export const pgecetApi = {
  getInstitutions: () => Promise.resolve({ data: PGECET_INSTITUTIONS }),
  getBranches: () => Promise.resolve({ data: PGECET_BRANCHES }),
  getAllotmentsSummary: () => Promise.resolve({ data: allotmentsSummary }),
  getCollegeAllotments: (collegeCode, branchName = '') => {
    const records = allAllotments.filter((rec) => {
      const matchCode = rec.college_code.toUpperCase() === collegeCode.toUpperCase();
      if (!matchCode) return false;
      if (branchName) {
        return rec.branch_name.toUpperCase() === branchName.toUpperCase();
      }
      return true;
    });
    return Promise.resolve({ data: { candidates: records, total: records.length } });
  },
  predict: (rank, category = 'OC', gender = 'M', branch = '') => {
    const numericRank = Number(rank);
    if (!numericRank || numericRank <= 0) return Promise.resolve({ data: [] });

    const matches = allotmentsSummary.filter((item) => {
      if (branch && !item.branch_name.toUpperCase().includes(branch.toUpperCase())) {
        return false;
      }
      const quota = item.allotted_category.toUpperCase();
      const matchCategory = quota.includes(category.toUpperCase()) || quota.includes('OPEN') || quota.includes('OC');
      const matchGender = gender === 'F' ? true : !quota.includes('FEMALE');
      return matchCategory && matchGender;
    });

    const results = matches.map((item) => {
      const closing = item.max_rank;
      const opening = item.min_rank;
      let chance = 'Low';
      let probability = 30;

      if (numericRank <= opening) {
        chance = 'High (Very Safe)';
        probability = 95;
      } else if (numericRank <= closing) {
        chance = 'Good (Safe)';
        probability = 75;
      } else if (numericRank <= closing * 1.25) {
        chance = 'Moderate (Borderline)';
        probability = 50;
      }

      return {
        college_code: item.college_code,
        college_name: item.college_name,
        branch_name: item.branch_name,
        allotted_category: item.allotted_category,
        min_rank: item.min_rank,
        max_rank: item.max_rank,
        chance,
        probability,
      };
    });

    // Sort by closing rank
    results.sort((a, b) => b.probability - a.probability || a.max_rank - b.max_rank);

    return Promise.resolve({ data: results });
  },
};
