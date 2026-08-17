import { api } from './api';

export const eapcetApi = {
  getCounsellingData: () => api.get('/eapcet/counselling-data'),
  getNotifications: () => api.get('/eapcet/notifications'),
  getColleges: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/eapcet/colleges${query ? `?${query}` : ''}`);
  },
  getCollegeByCode: (code) => api.get(`/eapcet/colleges/${code}`),
  compare: (c1, c2, branch = 'CSE') => api.get(`/eapcet/compare?c1=${c1}&c2=${c2}&branch=${branch}`),
  getAllotmentMeta: () => api.get('/eapcet/allotments/meta'),
  getAllotments: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/eapcet/allotments?${q}`);
  },
};

export const checklistApi = {
  get: (exam = 'tg-eapcet') => api.get(`/checklist?exam=${exam}`),
  update: (exam, docId, ticked) => api.patch('/checklist', { exam, docId, ticked }),
  sync: (exam, tickedDocIds) => api.post('/checklist/sync', { exam, tickedDocIds }),
};
