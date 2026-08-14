import { adminYearRepository } from "../repositories/adminYearRepository.js";

export const adminYearController = {
  async list(req, res, next) {
    try {
      const examSlug = req.query.exam;
      const years = await adminYearRepository.list(examSlug);
      res.json(years);
    } catch (err) {
      next(err);
    }
  },

  async setActive(req, res, next) {
    try {
      const { isActive } = req.body;
      const result = await adminYearRepository.setActive(req.params.id, !!isActive);
      if (!result) return res.status(404).json({ error: "Year not found" });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
  async remove(req, res, next) {
    try {
      const result = await adminYearRepository.remove(req.params.id);
      if (!result) return res.status(404).json({ error: "Year not found" });
      res.json({ success: true, deleted: result });
    } catch (err) {
      next(err);
    }
  },
};