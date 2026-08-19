import dotenv from "dotenv";
dotenv.config();
import { pool } from "../src/config/database.js";

async function findSalaar() {
  try {
    const { rows } = await pool.query(
      "SELECT id, email, first_name, last_name, created_at FROM users WHERE first_name ILIKE '%salaar%' OR last_name ILIKE '%salaar%' OR email ILIKE '%salaar%'"
    );
    console.log("Users matching Salaar:", rows);

    if (rows.length > 0) {
      for (const user of rows) {
        const { rows: userProgress } = await pool.query(
          "SELECT * FROM checklist_progress WHERE user_id = $1",
          [user.id]
        );
        console.log(`checklist_progress for user ${user.id} (${user.email}):`, userProgress);

        const { rows: legacy } = await pool.query(
          "SELECT * FROM user_document_checklist WHERE user_id = $1",
          [user.id]
        );
        console.log(`user_document_checklist for user ${user.id} (${user.email}):`, legacy);
      }
    }
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

findSalaar();
