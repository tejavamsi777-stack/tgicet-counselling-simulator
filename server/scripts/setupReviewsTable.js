import dotenv from "dotenv";
dotenv.config();
import { pool } from "../src/config/database.js";

async function setupReviewsTable() {
  try {
    console.log("Setting up app_reviews table in PostgreSQL...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_reviews (
        id SERIAL PRIMARY KEY,
        user_id INT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        feedback TEXT NULL,
        exam_slug VARCHAR(50) DEFAULT 'general',
        source VARCHAR(50) DEFAULT 'predictor_popup',
        ip_address VARCHAR(100) NULL,
        user_agent TEXT NULL,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log("✅ app_reviews table created/verified.");

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_app_reviews_rating ON app_reviews (rating);
      CREATE INDEX IF NOT EXISTS idx_app_reviews_created_at ON app_reviews (created_at DESC);
    `);
    console.log("✅ indexes created.");

  } catch (err) {
    console.error("❌ Setup error:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

setupReviewsTable();
