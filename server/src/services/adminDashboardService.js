import { adminDashboardRepository } from "../repositories/adminDashboardRepository.js";

export const adminDashboardService = {
  async getStats() {
    const [counts, recentActivity] = await Promise.all([
      adminDashboardRepository.getCounts(),
      adminDashboardRepository.getRecentActivity(10),
    ]);

    return { ...counts, recentActivity };
  },
};