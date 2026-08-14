import { examService } from "../services/examService.js";

export const examController = {
  async list(req, res, next) {
    try {
      res.json(await examService.list());
    } catch (error) {
      next(error);
    }
  },
};
