import { pool } from "../config/database.js";
import { telegramService } from "../services/telegramService.js";

export const reviewController = {
  // POST /api/reviews (optionalAuth)
  async submit(req, res, next) {
    try {
      const { rating, feedback, examSlug = "general", source = "predictor_popup" } = req.body;

      const numRating = parseInt(rating, 10);
      if (!numRating || numRating < 1 || numRating > 5) {
        return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
      }

      const userId = req.user?.id || null;
      const ipAddress = req.ip || req.headers["x-forwarded-for"] || null;
      const userAgent = req.headers["user-agent"] || null;

      // 1. Insert into database
      const { rows } = await pool.query(
        `INSERT INTO app_reviews (user_id, rating, feedback, exam_slug, source, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING id, rating, feedback, exam_slug, created_at`,
        [userId, numRating, feedback ? feedback.trim() : null, examSlug, source, ipAddress, userAgent]
      );

      // 2. Fire and forget Telegram Notification
      telegramService.sendReviewNotification({
        rating: numRating,
        feedback,
        examSlug,
        user: req.user,
        reqIp: ipAddress,
      }).catch((err) => {
        console.error("[ReviewController]: Telegram notification background error:", err);
      });

      res.status(201).json({
        success: true,
        message: "Thank you for your feedback!",
        review: rows[0],
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/reviews/featured (Public - for testimonial showcase)
  async getFeatured(req, res, next) {
    try {
      const { rows } = await pool.query(
        `SELECT r.id, r.rating, r.feedback, r.exam_slug, r.created_at,
                COALESCE(u.first_name, 'Aspirant') as student_name
         FROM app_reviews r
         LEFT JOIN users u ON r.user_id = u.id
         WHERE r.rating >= 4 AND r.feedback IS NOT NULL AND LENGTH(r.feedback) > 10
         ORDER BY r.created_at DESC
         LIMIT 10`
      );
      res.json({ success: true, reviews: rows });
    } catch (err) {
      next(err);
    }
  },
};
