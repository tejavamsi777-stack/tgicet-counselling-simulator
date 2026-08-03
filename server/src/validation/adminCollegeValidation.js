export function validateCollegeInput(body, { isUpdate = false } = {}) {
  const errors = [];

  if (!isUpdate && (!body.code || body.code.trim() === "")) {
    errors.push("code is required");
  }
  if (!body.name || body.name.trim() === "") {
    errors.push("name is required");
  }
  if (!body.district || body.district.trim() === "") {
    errors.push("district (code) is required");
  }
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push("email format is invalid");
  }

  if (body.offeredCourses !== undefined) {
    if (!Array.isArray(body.offeredCourses)) {
      errors.push("offeredCourses must be a list");
    } else {
      const courseIds = new Set();
      body.offeredCourses.forEach((course, index) => {
        const courseId = Number(course?.courseId);
        if (!Number.isInteger(courseId) || courseId <= 0) {
          errors.push(`offeredCourses[${index}] has an invalid course`);
        } else if (courseIds.has(courseId)) {
          errors.push("each course can only be added once");
        } else {
          courseIds.add(courseId);
        }

        if (course?.fee !== "" && course?.fee !== null && course?.fee !== undefined) {
          const fee = Number(course.fee);
          if (!Number.isInteger(fee) || fee < 0) {
            errors.push(`offeredCourses[${index}] fee must be a non-negative whole number`);
          }
        }
      });
    }
  }

  return errors;
}
