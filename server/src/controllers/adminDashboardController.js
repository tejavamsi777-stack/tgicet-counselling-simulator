import { adminDashboardService } from "../services/adminDashboardService.js";

export const adminDashboardController = {
  async stats(req, res, next) {
    try {
      const result = await adminDashboardService.getStats();
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};