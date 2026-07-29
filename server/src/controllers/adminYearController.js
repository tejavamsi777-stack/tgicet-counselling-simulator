import { adminYearRepository } from "../repositories/adminYearRepository.js";

export const adminYearController = {
  async list(req, res, next) {
    try {
      res.json(await adminYearRepository.list());
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
};