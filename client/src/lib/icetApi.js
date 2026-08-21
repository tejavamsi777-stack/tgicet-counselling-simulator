import { api } from './api';

export const icetApi = {
  getCounsellingData: () => api.get('/icet/counselling-data'),
  getNotifications: () => api.get('/icet/notifications'),
  getColleges: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/icet/colleges${query ? `?${query}` : ''}`);
  },
  getCollegeByCode: (code) => api.get(`/icet/colleges/${code}`),
  getCollegeBranches: (code) => api.get(`/icet/colleges/${code}/branches`),
  getAllotmentMeta: () => api.get('/icet/allotments/meta'),
  getAllotments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/icet/allotments${query ? `?${query}` : ''}`);
  },
  compare: (c1, c2, program = 'MBA') => api.get(`/icet/compare?c1=${c1}&c2=${c2}&program=${program}`),
};

