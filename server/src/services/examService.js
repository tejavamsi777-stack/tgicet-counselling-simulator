import { DEFAULT_EXAM_SLUG } from "../config/exams.js";
import { examRepository } from "../repositories/examRepository.js";

export const examService = {
  list: () => examRepository.list(),

  async resolve(slugOrObj) {
    const rawSlug = typeof slugOrObj === 'object' && slugOrObj !== null
      ? (slugOrObj.exam || slugOrObj.slug || DEFAULT_EXAM_SLUG)
      : (slugOrObj || DEFAULT_EXAM_SLUG);
    const exam = await examRepository.findBySlug(rawSlug);
    if (!exam) {
      const error = new Error("Unknown exam");
      error.status = 404;
      throw error;
    }
    return exam;
  },
};
