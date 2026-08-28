import { api } from './api';
import localSummary from '../data/icet_allotments/allotments_summary.json';

// Glob import all local JSON files so Vite bundles them as code-split JSON chunks for instant zero-latency loading
const localAllotments = import.meta.glob(['../data/icet_allotments/*.json', '!../data/icet_allotments/allotments_summary.json']);

export const icetApi = {
  getCounsellingData: () => api.get('/icet/counselling-data'),
  getNotifications: () => api.get('/icet/notifications'),
  getColleges: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/icet/colleges${query ? `?${query}` : ''}`);
  },
  getCollegeByCode: (code) => api.get(`/icet/colleges/${code}`),
  getCollegeBranches: (code) => api.get(`/icet/colleges/${code}/branches`),

  getAllotmentMeta: async () => {
    // Return local metadata instantly with 0ms delay (no waiting for sleeping backend)
    return {
      data: {
        years: [{ id: '2026-final', label: '2026 Final Phase (Official Live)', isLive: true }],
        branches: [
          { code: 'MBA', name: 'Master of Business Administration (MBA)' },
          { code: 'MCA', name: 'Master of Computer Applications (MCA)' },
        ],
        categories: ['OC', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST', 'EWS'],
        colleges: (localSummary.colleges || []).map((c) => ({
          code: c.code,
          name: c.name,
          coursesOffered: c.coursesOffered?.length > 0 ? c.coursesOffered : ['MBA'],
          totalAllotted: c.totalAllotted || 0,
        })),
        totalColleges: (localSummary.colleges || []).length,
      },
    };
  },

  getAllotments: async (params = {}) => {
    const rawCode = (params.college || '').trim().toUpperCase();
    const branchCode = (params.branch || 'MBA').trim().toUpperCase();

    if (!rawCode) {
      return {
        data: {
          collegeCode: '',
          branchCode,
          totalSeats: 0,
          totalRecords: 0,
          openingRank: 0,
          closingRank: 0,
          candidates: [],
          availableBranches: [{ code: 'MBA', name: 'MASTER OF BUSINESS ADMINISTRATION' }],
          college: null,
          branch: { code: branchCode, name: branchCode },
          year: params.year || '2026-final',
        },
      };
    }

    try {
      const filePath = `../data/icet_allotments/${rawCode}.json`;
      const loader = localAllotments[filePath];

      if (loader) {
        const mod = await loader();
        const raw = mod.default || mod;

        const availableBranches = (raw.branches || []).map((b) => ({
          code: b.branchCode,
          name: b.branchName || b.branchCode,
        }));

        const targetBranch = (raw.branches || []).find(
          (b) => b.branchCode.toUpperCase() === branchCode
        );

        let candidates = (targetBranch?.candidates || []).map((c) => ({
          ...c,
          branchCode,
        }));

        // Search filtering
        if (params.search && params.search.trim()) {
          const s = params.search.toLowerCase().trim();
          candidates = candidates.filter(
            (c) =>
              (c.name && c.name.toLowerCase().includes(s)) ||
              (c.hallTicket && c.hallTicket.toLowerCase().includes(s)) ||
              (c.rank && String(c.rank).includes(s)) ||
              (c.seatCategory && c.seatCategory.toLowerCase().includes(s)) ||
              (c.caste && c.caste.toLowerCase().includes(s))
          );
        }

        // Category filtering
        if (params.category && params.category.toUpperCase() !== 'ALL') {
          const cat = params.category.toUpperCase().replace(/[-_\s]/g, '');
          candidates = candidates.filter((c) => {
            const casteNorm = String(c.caste || '').toUpperCase().replace(/[-_\s]/g, '');
            const seatNorm = String(c.seatCategory || '').toUpperCase().replace(/[-_\s]/g, '');
            if (cat === 'OC') return casteNorm === 'OC';
            if (cat.startsWith('BC')) return casteNorm.startsWith(cat);
            if (cat === 'SC') return casteNorm.startsWith('SC');
            if (cat === 'ST') return casteNorm.startsWith('ST');
            if (cat === 'EWS') return casteNorm === 'EWS' || seatNorm.includes('EWS');
            return casteNorm === cat || seatNorm.includes(cat);
          });
        }

        // Gender filtering
        if (params.gender && params.gender.toUpperCase() !== 'ALL') {
          const g = params.gender.toUpperCase();
          candidates = candidates.filter((c) => {
            const candG = (c.gender || '').toUpperCase();
            if (g === 'M' || g === 'MALE') return candG.startsWith('M');
            if (g === 'F' || g === 'FEMALE') return candG.startsWith('F');
            return true;
          });
        }

        const totalRecords = candidates.length;
        const p = Math.max(1, parseInt(params.page, 10) || 1);
        const l = Math.max(1, parseInt(params.limit, 10) || 1000);
        const paginated = candidates.slice((p - 1) * l, p * l);

        return {
          data: {
            collegeCode: rawCode,
            branchCode,
            totalSeats: targetBranch?.totalSeats || totalRecords,
            totalRecords,
            openingRank: targetBranch?.openingRank || (candidates[0]?.rank || 0),
            closingRank: targetBranch?.closingRank || (candidates[candidates.length - 1]?.rank || 0),
            candidates: paginated,
            availableBranches,
            page: p,
            totalPages: Math.ceil(totalRecords / l) || 1,
            college: {
              code: raw.code,
              name: raw.name,
              coursesOffered: (raw.branches || []).map((b) => b.branchCode),
            },
            branch: {
              code: branchCode,
              name: targetBranch?.branchName || (branchCode === 'MBA' ? 'MASTER OF BUSINESS ADMINISTRATION' : 'MASTER OF COMPUTER APPLICATIONS'),
            },
            year: params.year || '2026-final',
          },
        };
      }
    } catch (localErr) {
      console.warn('Local allotment load error:', localErr);
    }

    // Fallback to API if local loader not found
    const query = new URLSearchParams(params).toString();
    return api.get(`/icet/allotments${query ? `?${query}` : ''}`);
  },

  compare: (c1, c2, program = 'MBA') =>
    api.get(`/icet/compare?c1=${c1}&c2=${c2}&program=${program}`),
};
