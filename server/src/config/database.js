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
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.error("[Database Pool Error]: Unexpected error on idle client:", err.message);
});

export async function testConnection() {
  const result = await pool.query("SELECT NOW()");
  return result.rows[0];
}