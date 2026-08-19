import { pool } from "../config/database.js";

export const checklistRepository = {
  // Get all ticked doc IDs for a user + exam
  async getTickedDocs(userId, examSlug = "tg-eapcet") {
    const { rows } = await pool.query(
      "SELECT doc_id FROM user_document_checklist WHERE user_id = $1 AND exam_slug = $2 AND ticked = TRUE",
      [userId, examSlug]
    );
    return rows.map((r) => r.doc_id);
  },

  // Upsert a tick/untick action
  async setDocTick(userId, examSlug, docId, ticked) {
    await pool.query(
      `INSERT INTO user_document_checklist (user_id, exam_slug, doc_id, ticked, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, exam_slug, doc_id)
       DO UPDATE SET ticked = EXCLUDED.ticked, updated_at = NOW()`,
      [userId, examSlug, docId, ticked]
    );
  },

  // Get last saved timestamp for user + exam
  async getLastSavedAt(userId, examSlug = "tg-eapcet") {
    const { rows } = await pool.query(
      "SELECT MAX(updated_at) as last_saved FROM user_document_checklist WHERE user_id = $1 AND exam_slug = $2",
      [userId, examSlug]
    );
    return rows[0]?.last_saved || null;
  },

  // Transactional replace: sets authoritative state for user + exam and returns lastSavedAt
  async replaceChecklistState(userId, examSlug = "tg-eapcet", tickedDocIds = []) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      // 1. Reset all previous ticks for this user + exam to false
      await client.query(
        "UPDATE user_document_checklist SET ticked = FALSE, updated_at = NOW() WHERE user_id = $1 AND exam_slug = $2",
        [userId, examSlug]
      );

      // 2. Mark specified doc IDs as ticked = true
      if (Array.isArray(tickedDocIds) && tickedDocIds.length > 0) {
        const values = tickedDocIds.map((docId, i) => `($1, $2, $${i + 3}, TRUE, NOW())`).join(", ");
        const params = [userId, examSlug, ...tickedDocIds];
        await client.query(
          `INSERT INTO user_document_checklist (user_id, exam_slug, doc_id, ticked, updated_at)
           VALUES ${values}
           ON CONFLICT (user_id, exam_slug, doc_id)
           DO UPDATE SET ticked = TRUE, updated_at = NOW()`,
          params
        );
      }

      await client.query("COMMIT");

      const { rows } = await pool.query(
        "SELECT MAX(updated_at) as last_saved FROM user_document_checklist WHERE user_id = $1 AND exam_slug = $2",
        [userId, examSlug]
      );
      const lastSavedAt = rows[0]?.last_saved || new Date().toISOString();

      return { ticked: tickedDocIds, lastSavedAt };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // Bulk upsert (for backward compatibility)
  async bulkSetDocs(userId, examSlug, tickedDocIds) {
    const result = await this.replaceChecklistState(userId, examSlug, tickedDocIds);
    return result.ticked;
  },
};
