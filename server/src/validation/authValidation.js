export function validateRegisterInput(body) {
  const errors = [];
  const { firstName, lastName, email, password } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("A valid email is required");
  }
  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!firstName || firstName.trim().length === 0) {
    errors.push("First name is required");
  }

  if (!lastName || lastName.trim().length === 0) {
    errors.push("Last name is required");
  }
  return errors;
}

export function validateLoginInput(body) {
  const errors = [];
  if (!body.email) errors.push("Email is required");
  if (!body.password) errors.push("Password is required");
  return errors;
}

export function validateUpdateProfileInput(body) {
  const errors = [];
  const { firstName, lastName } = body;

  if (!firstName || firstName.trim().length === 0) {
    errors.push("First name is required");
  }
  if (lastName !== undefined && lastName !== null && typeof lastName !== "string") {
    errors.push("Last name is invalid");
  }
  return errors;
}

export function validateChangePasswordInput(body) {
  const errors = [];
  const { currentPassword, newPassword } = body;

  if (!currentPassword) errors.push("Current password is required");
  if (!newPassword || newPassword.length < 8) {
    errors.push("New password must be at least 8 characters");
  }
  return errors;
}