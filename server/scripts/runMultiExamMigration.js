import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { pool } from "../src/config/database.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.join(__dirname, "..", "db", "migrations", "001_multi_exam_foundation.sql");

async function run() {
  const sql = fs.readFileSync(migrationPath, "utf8");
  try {
    await pool.query(sql);
    console.log("Multi-exam foundation migration completed successfully.");
  } finally {
    await pool.end();
  }
}

run().catch((error) => {
  console.error("Multi-exam foundation migration failed:", error.message);
  process.exitCode = 1;
});
