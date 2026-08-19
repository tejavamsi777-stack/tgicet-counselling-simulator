import dotenv from "dotenv";
dotenv.config();
import { pool } from "../src/config/database.js";
import { checklistRepository } from "../src/repositories/checklistRepository.js";

async function testChecklist() {
  try {
    const testUserId = 1; // test with user id 1
    const exam = "tg-eapcet";

    console.log("1. Testing replaceChecklistState with ['rank_card', 'hall_ticket']...");
    const saveRes = await checklistRepository.replaceChecklistState(testUserId, exam, ["rank_card", "hall_ticket"]);
    console.log("saveRes:", saveRes);

    console.log("2. Testing getTickedDocs...");
    const docs = await checklistRepository.getTickedDocs(testUserId, exam);
    console.log("Fetched ticked docs from DB:", docs);

    console.log("3. Testing getLastSavedAt...");
    const lastSaved = await checklistRepository.getLastSavedAt(testUserId, exam);
    console.log("lastSavedAt:", lastSaved);

    console.log("4. Testing unticking all (empty list)...");
    const emptySave = await checklistRepository.replaceChecklistState(testUserId, exam, []);
    console.log("emptySave:", emptySave);

    const emptyDocs = await checklistRepository.getTickedDocs(testUserId, exam);
    console.log("Fetched empty docs from DB:", emptyDocs);

  } catch (err) {
    console.error("❌ Test error:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

testChecklist();
