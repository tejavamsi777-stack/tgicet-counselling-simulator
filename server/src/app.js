import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { testConnection } from "./config/database.js";
import { router } from "./routes/index.js";

dotenv.config();

const app = express();

// Render (and most hosts) sit behind a reverse proxy — this makes
// req.ip and rate-limiting see the real client IP instead of the proxy's.
app.set("trust proxy", 1);

const allowedOrigins = [
  "https://tgicetcounselling.vercel.app",
  "http://localhost:5173", // keep local dev working
];

app.use(helmet());
app.use(
  cors({
    origin: function (origin, callback) {
      // requests with no origin (like curl, Postman, or server-to-server) are allowed
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());

// Global rate limit — applies to all routes
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
  })
);

// Tighter rate limit specifically for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { errors: ["Too many attempts. Please try again later."] },
});
app.use("/api/auth", authLimiter);
app.use("/api/admin/auth", authLimiter);

app.use("/api", router);

app.get("/api/health", async (req, res) => {
  try {
    const dbTime = await testConnection();
    res.json({ status: "ok", dbTime });
  } catch (err) {
    console.error("Health check DB error:", err);
    const isProd = process.env.NODE_ENV === "production";
    res.status(500).json({
      status: "error",
      message: isProd ? "Service unavailable" : (err.message || String(err)),
      ...(isProd ? {} : { code: err.code }),
    });
  }
});

// Catches errors passed via next(err) from any controller (authController,
// etc.) and always responds with JSON in the { error, code } shape that
// client/src/lib/api.js expects. Without this, Express's default HTML error
// page gets returned instead, which api.js can't parse — that's what was
// causing generic "Request failed (401)" messages instead of the real
// "Invalid email or password" / "Current password is incorrect" text.
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === "production";
  res.status(status).json({
    error: err.message || "Something went wrong",
    ...(err.code ? { code: err.code } : {}),
    ...(isProd ? {} : { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});