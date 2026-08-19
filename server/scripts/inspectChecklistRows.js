import dotenv from "dotenv";
dotenv.config();
import { pool } from "../src/config/database.js";

async function inspectAllChecklists() {
  try {
    const { rows: users } = await pool.query("SELECT id, email, first_name, last_name FROM users ORDER BY id DESC LIMIT 10");
    console.log("Top 10 users in DB:", users);

    const { rows: progress } = await pool.query("SELECT * FROM checklist_progress ORDER BY updated_at DESC LIMIT 20");
    console.log("Recent checklist_progress rows:", progress);

    const { rows: legacy } = await pool.query("SELECT * FROM user_document_checklist ORDER BY updated_at DESC LIMIT 20");
    console.log("Recent user_document_checklist rows:", legacy);
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

inspectAllChecklists();
