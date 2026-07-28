import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Sign in required for this feature" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userRepository.findById(payload.sub);
    if (!user || user.is_suspended) {
      return res.status(401).json({ error: "Session expired, please sign in again" });
    }
    req.user = {
      id: user.id,
      email: user.email,
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      firstName: user.first_name,
      lastName: user.last_name,
    };
    next();
  } catch {
    res.status(401).json({ error: "Session expired, please sign in again" });
  }
}