import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

export const googleAuthService = {
  async loginWithGoogle(idToken) {
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      const err = new Error("Invalid Google token");
      err.status = 401;
      throw err;
    }

    const { sub: googleId, email, name } = payload;

    // 1. Already linked to a Google account
    let user = await userRepository.findByGoogleId(googleId);

    // 2. Existing email/password account with the same email — link it
    if (!user) {
      const existingByEmail = await userRepository.findByEmail(email);
      if (existingByEmail) {
        user = await userRepository.linkGoogleId(existingByEmail.id, googleId);
      }
    }

    // 3. Brand new user — create the account immediately using their
    // verified Google profile. No password is set (password_hash stays
    // null), matching how authService.login treats Google-only accounts.
    if (!user) {
      const [firstName, ...rest] = (name || "").trim().split(" ");
      const lastName = rest.join(" ");

      user = await userRepository.create({
        firstName: firstName || "",
        lastName: lastName || "",
        email,
        passwordHash: null,
        googleId,
      });
    }

    if (user.is_suspended) {
      const err = new Error("This account has been suspended");
      err.status = 403;
      throw err;
    }

    const token = signUserToken(user);
    return { token, user: toPublicUser(user) };
  },
};