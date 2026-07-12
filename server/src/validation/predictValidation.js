const VALID_COURSES = ["MBA", "MCA", "MBT", "MTM"];
const VALID_GENDERS = ["Male", "Female"];

export function validatePredictInput(body) {
  const errors = [];
  const { rank, category, gender, course, year } = body;

  if (!rank || isNaN(Number(rank)) || Number(rank) <= 0) {
    errors.push("rank must be a positive number");
  }
  if (!category || typeof category !== "string") {
    errors.push("category is required");
  }
  if (!gender || !VALID_GENDERS.includes(gender)) {
    errors.push(`gender must be one of: ${VALID_GENDERS.join(", ")}`);
  }
  if (!course || !VALID_COURSES.includes(course)) {
    errors.push(`course must be one of: ${VALID_COURSES.join(", ")}`);
  }
  if (!year || isNaN(Number(year))) {
    errors.push("year is required and must be a number");
  }

  return errors;
}