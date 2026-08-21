import { api } from './api';

export const apEapcetApi = {
  getCounsellingData: () => api.get('/ap-eapcet/counselling-data'),
  getNotifications: () => api.get('/ap-eapcet/notifications'),
  getColleges: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/ap-eapcet/colleges${query ? `?${query}` : ''}`);
  },
  getCollegeByCode: (code) => api.get(`/ap-eapcet/colleges/${code}`),
  getCollegeBranches: (code) => api.get(`/ap-eapcet/colleges/${code}/branches`),
  compare: (c1, c2, branch = 'CSE') => api.get(`/ap-eapcet/compare?c1=${c1}&c2=${c2}&branch=${branch}`),
  getAllotmentMeta: () => api.get('/ap-eapcet/allotments/meta'),
  getAllotments: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/ap-eapcet/allotments?${q}`);
  },
};

export const checklistApi = {
  get: (exam = 'ap-eapcet') => api.get(`/checklist?exam=${exam}`),
  update: (exam, docId, ticked) => api.patch('/checklist', { exam, docId, ticked }),
  sync: (exam, tickedDocIds) => api.post('/checklist/sync', { exam, tickedDocIds }),
};
