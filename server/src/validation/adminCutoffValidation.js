export function validateCutoffInput(body, { isUpdate = false } = {}) {
  const errors = [];

  if (!isUpdate) {
    if (!body.collegeId || Number.isNaN(Number(body.collegeId))) {
      errors.push("collegeId is required");
    }
    if (!body.course || body.course.trim() === "") {
      errors.push("course (code) is required");
    }
    if (!body.category || body.category.trim() === "") {
      errors.push("category (code) is required");
    }
  }

  if (!body.gender || !["Male", "Female"].includes(body.gender)) {
    errors.push("gender must be 'Male' or 'Female'");
  }
  if (!body.cutoffRank || Number.isNaN(Number(body.cutoffRank)) || Number(body.cutoffRank) <= 0) {
    errors.push("cutoffRank is required and must be a positive number");
  }

  return errors;
}