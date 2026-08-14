import { referenceService } from "../services/referenceService.js";

export const referenceController = {
  async districts(req, res, next) {
    try {
      res.json(await referenceService.getDistricts(req.query.exam));
    } catch (err) {
      next(err);
    }
  },
  async courses(req, res, next) {
    try {
      res.json(await referenceService.getCourses(req.query.exam));
    } catch (err) {
      next(err);
    }
  },
  async categories(req, res, next) {
    try {
      res.json(await referenceService.getCategories(req.query.exam));
    } catch (err) {
      next(err);
    }
  },
  async years(req, res, next) {
    try {
      res.json(await referenceService.getYears(req.query.exam));
    } catch (err) {
      next(err);
    }
  },
};
