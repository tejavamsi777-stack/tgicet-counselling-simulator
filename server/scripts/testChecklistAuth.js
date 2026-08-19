import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { pool } from "../src/config/database.js";
import { userRepository } from "../src/repositories/userRepository.js";
import { checklistRepository } from "../src/repositories/checklistRepository.js";

async function testFullFlow() {
  try {
    // 1. Get first user in DB
    const { rows: users } = await pool.query("SELECT id, email, first_name FROM users LIMIT 5");
    console.log("Sample Users in DB:", users);

    if (users.length === 0) {
      console.log("No users found!");
      return;
    }

    const testUser = users[0];
    console.log("Testing with User:", testUser);

    // 2. Generate token
    const token = jwt.sign({ sub: testUser.id, email: testUser.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    console.log("Generated JWT Token:", token.slice(0, 30) + "...");

    // 3. Test checklist repository directly for this user
    console.log("Saving ['rank_card'] for user:", testUser.id);
    const saveRes = await checklistRepository.replaceChecklistState(testUser.id, "tg-eapcet", ["rank_card"]);
    console.log("Save result:", saveRes);

    const getRes = await checklistRepository.getTickedDocs(testUser.id, "tg-eapcet");
    console.log("Get result:", getRes);

    const rows = await pool.query("SELECT * FROM user_document_checklist WHERE user_id = $1", [testUser.id]);
    console.log("DB Rows for user:", rows.rows);

  } catch (err) {
    console.error("Test Error:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

testFullFlow();
