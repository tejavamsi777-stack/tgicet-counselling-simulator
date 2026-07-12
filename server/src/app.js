import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { testConnection } from "./config/database.js";
import { router } from "./routes/index.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
  })
);
app.use("/api", router);
app.get("/api/health", async (req, res) => {
  try {
    const dbTime = await testConnection();
    res.json({ status: "ok", dbTime });
  } catch (err) {
    console.error("Health check DB error:", err);
    res.status(500).json({ status: "error", message: err.message || String(err), code: err.code });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});