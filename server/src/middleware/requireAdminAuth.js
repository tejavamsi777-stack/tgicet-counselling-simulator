import jwt from "jsonwebtoken";

export function requireAdminAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Admin login required" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    if (payload.type !== "admin") {
      return res.status(403).json({ error: "Not an admin token" });
    }
    req.admin = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: "Admin session expired, please sign in again" });
  }
}

// Usage: requireRole("super_admin") or requireRole("super_admin", "admin")
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.admin || !allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ error: "Insufficient permissions for this action" });
    }
    next();
  };
}