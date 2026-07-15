import dotenv from "dotenv";
import { pool } from "../src/config/database.js";

dotenv.config();

async function run() {
  const client = await pool.connect();
  try {
    console.log("Adding password-reset columns to users table...");
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS reset_token_hash TEXT,
        ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_reset_token_hash ON users (reset_token_hash);
    `);
    console.log("Done. users table now has reset_token_hash and reset_token_expires.");
  } catch (err) {
    console.error("Failed to add columns:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
