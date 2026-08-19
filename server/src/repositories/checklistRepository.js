import { pool } from "../config/database.js";

export const checklistRepository = {
  // Get all checklist records for user + exam
  async getChecklistRecords(userId, examSlug = "tg-eapcet") {
    const { rows } = await pool.query(
      `SELECT document_id as doc_id, is_checked, updated_at 
       FROM checklist_progress 
       WHERE user_id = $1 AND exam_slug = $2`,
      [userId, examSlug]
    );

    if (rows.length > 0) return rows;

    // Fallback if checklist_progress was empty
    const fallback = await pool.query(
      `SELECT doc_id, ticked as is_checked, updated_at 
       FROM user_document_checklist 
       WHERE user_id = $1 AND exam_slug = $2`,
      [userId, examSlug]
    );
    return fallback.rows;
  },

  // Get list of ticked doc IDs
  async getTickedDocs(userId, examSlug = "tg-eapcet") {
    const rows = await this.getChecklistRecords(userId, examSlug);
    return rows.filter((r) => r.is_checked).map((r) => r.doc_id);
  },

  // Atomic Delta Mutation with Last-Write-Wins (LWW)
  async setDocTick(userId, examSlug, docId, isChecked, updatedAt = new Date()) {
    // 1. Upsert into checklist_progress
    await pool.query(
      `INSERT INTO checklist_progress (user_id, exam_slug, document_id, is_checked, updated_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, exam_slug, document_id)
       DO UPDATE SET 
         is_checked = CASE 
           WHEN EXCLUDED.updated_at >= checklist_progress.updated_at THEN EXCLUDED.is_checked 
           ELSE checklist_progress.is_checked 
         END,
         updated_at = GREATEST(checklist_progress.updated_at, EXCLUDED.updated_at)`,
      [userId, examSlug, docId, isChecked, updatedAt]
    );

    // 2. Dual-consistency for user_document_checklist
    await pool.query(
      `INSERT INTO user_document_checklist (user_id, exam_slug, doc_id, ticked, updated_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, exam_slug, doc_id)
       DO UPDATE SET 
         ticked = CASE 
           WHEN EXCLUDED.updated_at >= user_document_checklist.updated_at THEN EXCLUDED.ticked 
           ELSE user_document_checklist.ticked 
         END,
         updated_at = GREATEST(user_document_checklist.updated_at, EXCLUDED.updated_at)`,
      [userId, examSlug, docId, isChecked, updatedAt]
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

  // Transactional replace / batch sync
  async replaceChecklistState(userId, examSlug = "tg-eapcet", tickedDocIds = []) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      // 1. Reset all previous ticks
      await client.query(
        "UPDATE checklist_progress SET is_checked = FALSE, updated_at = NOW() WHERE user_id = $1 AND exam_slug = $2",
        [userId, examSlug]
      );
      await client.query(
        "UPDATE user_document_checklist SET ticked = FALSE, updated_at = NOW() WHERE user_id = $1 AND exam_slug = $2",
        [userId, examSlug]
      );

      // 2. Mark specified doc IDs as is_checked = true
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
};
