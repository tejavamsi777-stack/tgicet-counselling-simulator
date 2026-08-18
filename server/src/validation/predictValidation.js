const VALID_GENDERS = ["Male", "Female"];

export function validatePredictInput(body) {
  const errors = [];
  const { rank, category, gender, course, courses, district, districts, year, years } = body;

  if (!rank || isNaN(Number(rank)) || Number(rank) <= 0) {
    errors.push("rank must be a positive number");
  }
  if (!category || typeof category !== "string") {
    errors.push("category is required");
  }
  if (!gender || !VALID_GENDERS.includes(gender)) {
    errors.push(`gender must be one of: ${VALID_GENDERS.join(", ")}`);
  }
  
  const hasCourse = Boolean(course && typeof course === "string");
  const hasCourses = Array.isArray(courses);
  if (!hasCourse && !hasCourses && (course !== undefined || courses !== undefined)) {
    errors.push("course must be a string or array of strings");
  }

  const hasDistrict = Boolean(district && typeof district === "string");
  const hasDistricts = Array.isArray(districts);
  if (!hasDistrict && !hasDistricts && (district !== undefined || districts !== undefined)) {
    errors.push("district must be a string or array of strings");
  }

  const hasYear = Boolean(year && !isNaN(Number(year)));
  const hasYears = Array.isArray(years);
  if (!hasYear && !hasYears && (year !== undefined || years !== undefined)) {
    errors.push("year must be a number or array of numbers");
  }

  return errors;
}
