import { pool } from "../config/database.js";

export const checklistRepository = {
  // Get all ticked doc IDs for a user + exam
  async getTickedDocs(userId, examSlug = "tg-eapcet") {
    const { rows } = await pool.query(
      `SELECT COALESCE(document_id, doc_id) as doc_id 
       FROM checklist_progress 
       WHERE user_id = $1 AND exam_slug = $2 AND is_checked = TRUE`,
      [userId, examSlug]
    );

    if (rows.length > 0) {
      return rows.map((r) => r.doc_id);
    }

    // Fallback to user_document_checklist if needed
    const fallback = await pool.query(
      "SELECT doc_id FROM user_document_checklist WHERE user_id = $1 AND exam_slug = $2 AND ticked = TRUE",
      [userId, examSlug]
    );
    return fallback.rows.map((r) => r.doc_id);
  },

  // Upsert a tick/untick action
  async setDocTick(userId, examSlug, docId, ticked) {
    await pool.query(
      `INSERT INTO checklist_progress (user_id, exam_slug, document_id, is_checked, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, exam_slug, document_id)
       DO UPDATE SET is_checked = EXCLUDED.is_checked, updated_at = NOW()`,
      [userId, examSlug, docId, ticked]
    );

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
      "SELECT MAX(updated_at) as last_saved FROM checklist_progress WHERE user_id = $1 AND exam_slug = $2",
      [userId, examSlug]
    );
    if (rows[0]?.last_saved) return rows[0].last_saved;

    const fallback = await pool.query(
      "SELECT MAX(updated_at) as last_saved FROM user_document_checklist WHERE user_id = $1 AND exam_slug = $2",
      [userId, examSlug]
    );
    return fallback.rows[0]?.last_saved || null;
  },

  // Transactional replace: sets authoritative state for user + exam and returns lastSavedAt
  async replaceChecklistState(userId, examSlug = "tg-eapcet", tickedDocIds = []) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      // 1. Reset all previous ticks in checklist_progress and user_document_checklist
      await client.query(
        "UPDATE checklist_progress SET is_checked = FALSE, updated_at = NOW() WHERE user_id = $1 AND exam_slug = $2",
        [userId, examSlug]
      );
      await client.query(
        "UPDATE user_document_checklist SET ticked = FALSE, updated_at = NOW() WHERE user_id = $1 AND exam_slug = $2",
        [userId, examSlug]
      );

      // 2. Mark specified doc IDs as is_checked = true in checklist_progress
      if (Array.isArray(tickedDocIds) && tickedDocIds.length > 0) {
        const values = tickedDocIds.map((docId, i) => `($1, $2, $${i + 3}, TRUE, NOW())`).join(", ");
        const params = [userId, examSlug, ...tickedDocIds];
        
        await client.query(
          `INSERT INTO checklist_progress (user_id, exam_slug, document_id, is_checked, updated_at)
           VALUES ${values}
           ON CONFLICT (user_id, exam_slug, document_id)
           DO UPDATE SET is_checked = TRUE, updated_at = NOW()`,
          params
        );

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
        "SELECT MAX(updated_at) as last_saved FROM checklist_progress WHERE user_id = $1 AND exam_slug = $2",
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

  // Bulk upsert
  async bulkSetDocs(userId, examSlug, tickedDocIds) {
    const result = await this.replaceChecklistState(userId, examSlug, tickedDocIds);
    return result.ticked;
  },
};
