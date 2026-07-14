import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository.js";

const SALT_ROUNDS = 12;

function signUserToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, type: "user" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" }
  );
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

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        firstName: user.first_name,
        lastName: user.last_name,
      },
    };
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

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        firstName: user.first_name,
        lastName: user.last_name,
      },
    };
  },
};