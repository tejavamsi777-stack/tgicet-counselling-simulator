import dotenv from "dotenv";
import { pool } from "../src/config/database.js";
import { adminAuthService } from "../src/services/adminAuthService.js";

dotenv.config();

// ---- EDIT THESE BEFORE RUNNING ----
const SUPER_ADMIN_EMAIL = "you@example.com";
const SUPER_ADMIN_PASSWORD = "ChangeThisPassword123!";
const SUPER_ADMIN_NAME = "Your Name";
// ------------------------------------

async function seed() {
  const client = await pool.connect();
  try {
    const existing = await client.query("SELECT id FROM admins WHERE email = $1", [SUPER_ADMIN_EMAIL]);
    if (existing.rows.length > 0) {
      console.log("An admin with this email already exists. Nothing to do.");
      return;
    }

    const roleResult = await client.query("SELECT id FROM roles WHERE name = 'super_admin'");
    if (roleResult.rows.length === 0) {
      console.error("super_admin role not found — did you run schema.sql?");
      process.exit(1);
    }
    const roleId = roleResult.rows[0].id;

    const passwordHash = await adminAuthService.hashPassword(SUPER_ADMIN_PASSWORD);

    await client.query(
      "INSERT INTO admins (email, password_hash, name, role_id) VALUES ($1, $2, $3, $4)",
      [SUPER_ADMIN_EMAIL, passwordHash, SUPER_ADMIN_NAME, roleId]
    );

    console.log(`Super Admin created: ${SUPER_ADMIN_EMAIL}`);
    console.log("You can now log in via POST /api/admin/auth/login");
  } finally {
    client.release();
    await pool.end();
  }
}

seed();