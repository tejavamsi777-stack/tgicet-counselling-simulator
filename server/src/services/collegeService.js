import { collegeRepository } from "../repositories/collegeRepository.js";

export const collegeService = {
  getColleges: (filters) => collegeRepository.getColleges(filters),
};