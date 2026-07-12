import { collegeService } from "../services/collegeService.js";

export const collegeController = {
  async list(req, res, next) {
    try {
      const { course, district } = req.query;
      const colleges = await collegeService.getColleges({ course, district });
      res.json(colleges);
    } catch (err) {
      next(err);
    }
  },
};