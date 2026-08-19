import dotenv from "dotenv";
dotenv.config();
import { pool } from "../src/config/database.js";

async function setupSupabaseRealtimeTable() {
  try {
    console.log("Setting up checklist_progress table & Realtime publication in Supabase PostgreSQL...");

    // 1. Create checklist_progress table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS checklist_progress (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        exam_slug VARCHAR(50) NOT NULL DEFAULT 'tg-eapcet',
        document_id VARCHAR(100) NOT NULL,
        is_checked BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, exam_slug, document_id)
      );
    `);
    console.log("✅ checklist_progress table created/verified.");

    // 2. Create index
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_checklist_progress_user_exam 
      ON checklist_progress (user_id, exam_slug);
    `);
    console.log("✅ idx_checklist_progress_user_exam index created/verified.");

    // 3. Enable RLS
    await pool.query(`
      ALTER TABLE checklist_progress ENABLE ROW LEVEL SECURITY;
    `);

    // 4. Create RLS Policy
    await pool.query(`
      DROP POLICY IF EXISTS "Allow all users to manage own checklist progress" ON checklist_progress;
      CREATE POLICY "Allow all users to manage own checklist progress" 
      ON checklist_progress FOR ALL USING (true) WITH CHECK (true);
    `);
    console.log("✅ RLS policy configured.");

    // 5. Add to supabase_realtime publication
    try {
      await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND tablename = 'checklist_progress'
          ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE checklist_progress;
          END IF;
        END $$;
      `);
      console.log("✅ checklist_progress added to supabase_realtime publication.");
    } catch (pubErr) {
      console.warn("⚠️ Publication note:", pubErr.message);
    }

    // 6. Inspect columns
    const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'checklist_progress'");
    console.log("Columns in checklist_progress:", cols.rows.map(c => `${c.column_name} (${c.data_type})`));

  } catch (err) {
    console.error("❌ Setup error:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

setupSupabaseRealtimeTable();
