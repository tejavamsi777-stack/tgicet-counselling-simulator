import { DEFAULT_EXAM_SLUG } from "../config/exams.js";
import { examRepository } from "../repositories/examRepository.js";

export const examService = {
  list: () => examRepository.list(),

  async resolve(slug) {
    const exam = await examRepository.findBySlug(slug || DEFAULT_EXAM_SLUG);
    if (!exam) {
      const error = new Error("Unknown exam");
      error.status = 404;
      throw error;
    }
    return exam;
  },
};
