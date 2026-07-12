export function validateRegisterInput(body) {
  const errors = [];
  const { email, password, name } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("A valid email is required");
  }
  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!name || name.trim().length === 0) {
    errors.push("Name is required");
  }
  return errors;
}

export function validateLoginInput(body) {
  const errors = [];
  if (!body.email) errors.push("Email is required");
  if (!body.password) errors.push("Password is required");
  return errors;
}