import { collegeService } from "../services/collegeService.js";

export const collegeController = {
  async list(req, res, next) {
    try {
      const { exam, course, district } = req.query;
      const colleges = await collegeService.getColleges({ exam, course, district });
      res.json(colleges);
    } catch (err) {
      next(err);
    }
  },
};
