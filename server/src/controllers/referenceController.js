import { referenceService } from "../services/referenceService.js";

export const referenceController = {
  async districts(req, res, next) {
    try {
      res.json(await referenceService.getDistricts());
    } catch (err) {
      next(err);
    }
  },
  async courses(req, res, next) {
    try {
      res.json(await referenceService.getCourses());
    } catch (err) {
      next(err);
    }
  },
  async categories(req, res, next) {
    try {
      res.json(await referenceService.getCategories());
    } catch (err) {
      next(err);
    }
  },
  async years(req, res, next) {
    try {
      res.json(await referenceService.getYears());
    } catch (err) {
      next(err);
    }
  },
};