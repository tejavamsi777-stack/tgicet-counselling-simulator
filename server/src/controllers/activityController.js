import { pool } from "../config/database.js";

export const activityController = {
  async log(req, res, next) {
    try {
      const { action, details } = req.body;
      if (!action) {
        return res.status(400).json({ errors: ["action is required"] });
      }
      const userId = req.user?.id ?? null;
      await pool.query(
        `insert into audit_logs (user_id, action, details) values ($1, $2, $3)`,
        [userId, action, details]
      );
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};