import dotenv from "dotenv";
dotenv.config();
import { telegramService } from "../src/services/telegramService.js";
import { pool } from "../src/config/database.js";

async function testReviewSubmission() {
  try {
    console.log("Testing review submission & Telegram alert...");

    const fakeReview = {
      rating: 5,
      feedback: "The predictor cutoffs for EAPCET are super accurate! Loved the clean interface.",
      examSlug: "tg-eapcet",
      user: { name: "Vamsi Teja", email: "tejavamsi777@gmail.com" },
      reqIp: "127.0.0.1",
    };

    // 1. Insert to DB
    const res = await pool.query(
      `INSERT INTO app_reviews (user_id, rating, feedback, exam_slug, source, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [2, fakeReview.rating, fakeReview.feedback, fakeReview.examSlug, "test_script"]
    );
    console.log("✅ DB Inserted Review:", res.rows[0]);

    // 2. Send Telegram Alert
    const sent = await telegramService.sendReviewNotification(fakeReview);
    console.log("✅ Telegram Alert Sent:", sent);

  } catch (err) {
    console.error("❌ Test error:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

testReviewSubmission();
