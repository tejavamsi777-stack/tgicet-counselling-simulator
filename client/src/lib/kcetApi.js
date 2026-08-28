import { api } from './api';

export const kcetApi = {
  getAllotmentMeta: () => api.get('/kcet/allotments/meta'),
  getAllotments: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/kcet/allotments?${q}`);
  },
};
