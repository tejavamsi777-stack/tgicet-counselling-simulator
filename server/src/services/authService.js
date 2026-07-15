import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { userRepository } from "../repositories/userRepository.js";
import { emailService } from "./emailService.js";

const SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function signUserToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, type: "user" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" }
  );
}

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
    firstName: user.first_name,
    lastName: user.last_name,
  };
}

function hashResetToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export const authService = {
  async register({ firstName, lastName, email, password, googleId }) {
    const existing = await userRepository.findByEmail(email);

    if (existing) {
      const err = new Error("An account with this email already exists");
      err.status = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await userRepository.create({
      firstName,
      lastName,
      email,
      passwordHash,
      googleId: googleId || null,
    });

    const token = signUserToken(user);

    return { token, user: toPublicUser(user) };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      const err = new Error("Account not found");
      err.status = 404;
      err.code = "ACCOUNT_NOT_FOUND";
      throw err;
    }

    if (!user.password_hash) {
      const err = new Error("This account uses Google sign-in");
      err.status = 400;
      err.code = "GOOGLE_ACCOUNT";
      throw err;
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      const err = new Error("Invalid email or password");
      err.status = 401;
      throw err;
    }

    if (user.is_suspended) {
      const err = new Error("This account has been suspended");
      err.status = 403;
      throw err;
    }

    const token = signUserToken(user);

    return { token, user: toPublicUser(user) };
  },

  async updateProfile(userId, { firstName, lastName }) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const err = new Error("Account not found");
      err.status = 404;
      throw err;
    }

    const updated = await userRepository.update(userId, {
      firstName: firstName.trim(),
      lastName: (lastName || "").trim(),
    });

    return toPublicUser(updated);
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const err = new Error("Account not found");
      err.status = 404;
      throw err;
    }

    if (!user.password_hash) {
      const err = new Error("This account uses Google sign-in and has no password to change");
      err.status = 400;
      err.code = "GOOGLE_ACCOUNT";
      throw err;
    }

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      const err = new Error("Current password is incorrect");
      err.status = 401;
      throw err;
    }

    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.update(userId, { passwordHash: newPasswordHash });

    return true;
  },

  // Always resolves successfully (even if the email doesn't exist) so the
  // API never reveals whether an email is registered — that's a deliberate
  // anti-enumeration measure, not an oversight.
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);

    // Google-only accounts have no password to reset — silently no-op,
    // same as "user not found", for the same anti-enumeration reason.
    if (!user || !user.password_hash) {
      return;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(rawToken);
    const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await userRepository.update(user.id, {
      resetTokenHash: tokenHash,
      resetTokenExpires: expires,
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

    // Deliberately NOT awaited: Gmail SMTP handshakes can take anywhere from
    // a couple seconds to 20-30+ seconds depending on network conditions,
    // and holding the HTTP response open that long caused mobile browsers
    // (which are much stricter than desktop about killing slow requests) to
    // fail with a generic network error even though the backend was fine.
    // The token is already saved above, so the reset link works regardless
    // of exactly when the email finishes sending.
    emailService.sendPasswordResetEmail(user.email, resetUrl).catch((err) => {
      console.error("Password reset email failed to send:", err);
    });
  },

  async resetPassword({ token, newPassword }) {
    const tokenHash = hashResetToken(token);
    const user = await userRepository.findByResetTokenHash(tokenHash);

    if (!user || !user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
      const err = new Error("This reset link is invalid or has expired");
      err.status = 400;
      err.code = "INVALID_RESET_TOKEN";
      throw err;
    }

    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.update(user.id, {
      passwordHash: newPasswordHash,
      resetTokenHash: null,
      resetTokenExpires: null,
    });

    return true;
  },
};