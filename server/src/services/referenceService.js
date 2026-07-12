import { referenceRepository } from "../repositories/referenceRepository.js";

export const referenceService = {
  getDistricts: () => referenceRepository.getDistricts(),
  getCourses: () => referenceRepository.getCourses(),
  getCategories: () => referenceRepository.getCategories(),
  getYears: () => referenceRepository.getYears(),
};