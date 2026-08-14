import { collegeRepository } from "../repositories/collegeRepository.js";
import { examService } from "./examService.js";

export const collegeService = {
  async getColleges({ exam: examSlug, ...filters }) {
    const exam = await examService.resolve(examSlug);
    return collegeRepository.getColleges({ ...filters, examId: exam.id });
  },
};
