export function validateAdminLoginInput(body) {
  const errors = [];
  if (!body.email) errors.push("Email is required");
  if (!body.password) errors.push("Password is required");
  return errors;
}

export function validateChangePasswordInput(body) {
  const errors = [];
  if (!body.currentPassword) errors.push("Current password is required");
  if (!body.newPassword || body.newPassword.length < 8) {
    errors.push("New password must be at least 8 characters");
  }
  return errors;
}