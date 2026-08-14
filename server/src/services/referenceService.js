import { referenceRepository } from "../repositories/referenceRepository.js";
import { examService } from "./examService.js";

export const referenceService = {
  async getDistricts(examSlug) {
    const exam = await examService.resolve(examSlug);
    return referenceRepository.getDistricts(exam.id);
  },
  async getCourses(examSlug) {
    const exam = await examService.resolve(examSlug);
    return referenceRepository.getCourses(exam.id);
  },
  async getCategories(examSlug) {
    const exam = await examService.resolve(examSlug);
    return referenceRepository.getCategories(exam.id);
  },
  async getYears(examSlug) {
    const exam = await examService.resolve(examSlug);
    return referenceRepository.getYears(exam.id);
  },
};
