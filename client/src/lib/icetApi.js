import { api } from './api';

export const icetApi = {
  getCounsellingData: () => api.get('/icet/counselling-data'),
  getNotifications: () => api.get('/icet/notifications'),
  getColleges: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/icet/colleges${query ? `?${query}` : ''}`);
  },
  getCollegeByCode: (code) => api.get(`/icet/colleges/${code}`),
  compare: (c1, c2, program = 'MBA') => api.get(`/icet/compare?c1=${c1}&c2=${c2}&program=${program}`),
};
