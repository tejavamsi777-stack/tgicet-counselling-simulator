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

  // Bulk upsert (for syncing localStorage state on login)
  async bulkSetDocs(userId, examSlug, tickedDocIds) {
    if (!tickedDocIds.length) return;
    const values = tickedDocIds.map((docId, i) => `($1, $2, $${i + 3}, TRUE, NOW())`).join(", ");
    const params = [userId, examSlug, ...tickedDocIds];
    await pool.query(
      `INSERT INTO user_document_checklist (user_id, exam_slug, doc_id, ticked, updated_at)
       VALUES ${values}
       ON CONFLICT (user_id, exam_slug, doc_id)
       DO UPDATE SET ticked = TRUE, updated_at = NOW()`,
      params
    );
  },
};
