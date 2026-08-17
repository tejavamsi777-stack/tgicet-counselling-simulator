import { api } from './api';

export const polycetApi = {
  getCounsellingData: () => api.get('/polycet/counselling-data'),
  getNotifications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/polycet/notifications${query ? `?${query}` : ''}`);
  },
  refreshNotifications: () => api.post('/polycet/refresh', {}),
  getColleges: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/polycet/colleges${query ? `?${query}` : ''}`);
  },
  getAllotmentsSummary: () => api.get('/polycet/allotments/summary'),
  getCollegeAllotments: (collegeCode, branch = '') => {
    const query = branch ? `?branch=${branch}` : '';
    return api.get(`/polycet/allotments/${collegeCode}${query}`);
  },
  compare: (c1 = 'MASB', c2 = 'JNGP', branch = 'CME') =>
    api.get(`/polycet/compare?c1=${c1}&c2=${c2}&branch=${branch}`),
};
