import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository.js";

export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userRepository.findById(payload.sub);
    if (!user || user.is_suspended) {
      req.user = null;
      return next();
    }
    req.user = {
      id: user.id,
      email: user.email,
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      firstName: user.first_name,
      lastName: user.last_name,
    };
  } catch {
    req.user = null; // invalid/expired token — treat as anonymous, don't block
  }
  next();
}