import { checklistRepository } from "../repositories/checklistRepository.js";

export const checklistController = {
  // GET /api/checklist?exam=tg-eapcet  (requires auth)
  async getChecklist(req, res, next) {
    try {
      const examSlug = req.query.exam || "tg-eapcet";
      const records = await checklistRepository.getChecklistRecords(req.user.id, examSlug);
      const ticked = records.filter((r) => r.is_checked).map((r) => r.doc_id);
      const lastSavedAt = await checklistRepository.getLastSavedAt(req.user.id, examSlug);

      const items = {};
      for (const r of records) {
        items[r.doc_id] = {
          isChecked: r.is_checked,
          updatedAt: r.updated_at,
        };
      }

      res.json({
        success: true,
        ticked,
        tickedDocIds: ticked,
        items,
        lastSavedAt: lastSavedAt || new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/checklist (Atomic Delta Mutation with LWW)
  async updateTick(req, res, next) {
    try {
      const { exam = "tg-eapcet", docId, isChecked, ticked, timestamp } = req.body;
      const checkedVal = isChecked !== undefined ? !!isChecked : !!ticked;
      if (!docId) return res.status(400).json({ error: "docId is required" });

      const updatedAt = timestamp ? new Date(timestamp) : new Date();
      await checklistRepository.setDocTick(req.user.id, exam, docId, checkedVal, updatedAt);
      const lastSavedAt = await checklistRepository.getLastSavedAt(req.user.id, exam);

      res.json({
        success: true,
        docId,
        isChecked: checkedVal,
        lastSavedAt: lastSavedAt || updatedAt.toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/checklist/sync (Batch state replacement)
  async syncChecklist(req, res, next) {
    try {
      const { exam = "tg-eapcet", tickedDocIds = [] } = req.body;
      const result = await checklistRepository.replaceChecklistState(req.user.id, exam, tickedDocIds);
      res.json({
        success: true,
        ticked: result.ticked,
        tickedDocIds: result.ticked,
        lastSavedAt: result.lastSavedAt,
      });
    } catch (err) {
      next(err);
    }
  },
};
