import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

function getSslConfig() {
  if (process.env.DATABASE_SSL_CA) {
    return {
      rejectUnauthorized: true,
      ca: process.env.DATABASE_SSL_CA,
    };
  }
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("localhost")) {
    return false;
  }
  return {
    rejectUnauthorized: false,
  };
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getSslConfig(),
});

export async function testConnection() {
  const result = await pool.query("SELECT NOW()");
  return result.rows[0];
}