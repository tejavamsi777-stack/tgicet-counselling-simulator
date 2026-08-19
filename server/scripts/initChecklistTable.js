import dotenv from "dotenv";
dotenv.config();
import { pool } from "../src/config/database.js";

async function initChecklistTable() {
  try {
    console.log("Connecting to PostgreSQL at:", process.env.DATABASE_URL?.split("@")[1] || "configured DB");
    
    // 1. Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_document_checklist (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        exam_slug VARCHAR(50) NOT NULL DEFAULT 'tg-eapcet',
        doc_id VARCHAR(100) NOT NULL,
        ticked BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, exam_slug, doc_id)
      );
    `);
    console.log("✅ user_document_checklist table is READY.");

    // 2. Create index on (user_id, exam_slug) for fast queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_doc_checklist_user_exam 
      ON user_document_checklist (user_id, exam_slug);
    `);
    console.log("✅ Index idx_user_doc_checklist_user_exam created/verified.");

    // 3. Inspect columns
    const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_document_checklist'");
    console.log("Columns in user_document_checklist:", cols.rows.map(c => `${c.column_name} (${c.data_type})`));

    // 4. Test a dummy query
    const count = await pool.query("SELECT count(*) FROM user_document_checklist");
    console.log("Current total checklist rows:", count.rows[0].count);

  } catch (err) {
    console.error("❌ Init error:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

initChecklistTable();
