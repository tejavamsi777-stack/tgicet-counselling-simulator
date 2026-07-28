import { pool } from "../config/database.js";

export const activityController = {
  async log(req, res, next) {
    try {
      const { action, metadata } = req.body;
      if (!action) {
        return res.status(400).json({ errors: ["action is required"] });
      }
      await pool.query(
        `insert into activity_logs (action, metadata) values ($1, $2)`,
        [action, metadata]
      );
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};