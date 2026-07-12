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

  return errors;
}