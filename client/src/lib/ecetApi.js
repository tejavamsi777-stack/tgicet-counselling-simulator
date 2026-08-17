import { api } from './api';

export const ecetApi = {
  getCounsellingData: () => api.get('/ecet/counselling-data'),
  getNotifications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/ecet/notifications${query ? `?${query}` : ''}`);
  },
  getLiveNotifications: () => api.get('/ecet/notifications'),
  refreshNotifications: () => api.post('/ecet/refresh', {}),
  getColleges: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/ecet/colleges${query ? `?${query}` : ''}`);
  },
  getCollegeByCode: (code) => api.get(`/ecet/colleges/${code}`),
  compare: (c1, c2, branch = 'CSE') => api.get(`/ecet/compare?c1=${c1}&c2=${c2}&branch=${branch}`),
  compareColleges: (c1, c2, branch = 'CSE') => api.get(`/ecet/compare?c1=${c1}&c2=${c2}&branch=${branch}`),
  getAllotmentMeta: () => api.get('/ecet/allotments/meta'),
  getAllotments: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/ecet/allotments?${q}`);
  },
};
