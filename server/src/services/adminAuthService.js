import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { adminRepository } from "../repositories/adminRepository.js";

const SALT_ROUNDS = 12;

function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin.id, email: admin.email, role: admin.role_name, type: "admin" },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" }
  );
}

export const adminAuthService = {
  async login({ email, password }) {
    const admin = await adminRepository.findByEmail(email);
    if (!admin) {
      const err = new Error("Invalid email or password");
      err.status = 401;
      throw err;
    }
    if (!admin.is_active) {
      const err = new Error("This admin account has been deactivated");
      err.status = 403;
      throw err;
    }
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      const err = new Error("Invalid email or password");
      err.status = 401;
      throw err;
    }
    const token = signAdminToken(admin);
    return {
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role_name },
    };
  },

  async hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  async changePassword({ adminId, currentPassword, newPassword }) {
    const admin = await adminRepository.findById(adminId);
    if (!admin) {
      const err = new Error("Admin not found");
      err.status = 404;
      throw err;
    }
    const valid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!valid) {
      const err = new Error("Current password is incorrect");
      err.status = 401;
      throw err;
    }
    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await adminRepository.updatePassword(adminId, newHash);
    return { success: true };
  },
};