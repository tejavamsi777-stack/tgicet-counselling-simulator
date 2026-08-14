import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { pool } from "../src/config/database.js";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, "..", "db", "migrations", "002_seed_exam_catalog.sql"), "utf8");
  try {
    await pool.query(sql);
    console.log("Exam catalog seeded successfully.");
  } finally {
    await pool.end();
  }
}

run().catch((error) => {
  console.error("Exam catalog seed failed:", error.message);
  process.exitCode = 1;
});
