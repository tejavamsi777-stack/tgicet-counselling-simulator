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

    // 3. Brand new user
    if (!user) {
      user = await userRepository.createFromGoogle({ email, name, googleId });
    }

    if (user.is_suspended) {
      const err = new Error("This account has been suspended");
      err.status = 403;
      throw err;
    }

    const token = signUserToken(user);
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  },
};