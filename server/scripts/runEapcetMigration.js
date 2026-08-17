/**
 * Run this script to create the EAPCET cache and user checklist tables.
 * Usage: node scripts/runEapcetMigration.js
 */
import { pool } from "../src/config/database.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, "migrate_eapcet.sql"), "utf8");

async function run() {
  console.log("Running TG EAPCET migration...");
  try {
    await pool.query(sql);
    console.log("✅ Migration complete: eapcet_scrape_cache and user_document_checklist tables created.");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
