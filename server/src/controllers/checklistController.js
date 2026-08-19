import { checklistRepository } from "../repositories/checklistRepository.js";

export const checklistController = {
  // GET /api/checklist?exam=tg-eapcet  (requires auth)
  async getChecklist(req, res, next) {
    try {
      const examSlug = req.query.exam || "tg-eapcet";
      const ticked = await checklistRepository.getTickedDocs(req.user.id, examSlug);
      const lastSavedAt = await checklistRepository.getLastSavedAt(req.user.id, examSlug);
      res.json({ success: true, ticked, tickedDocIds: ticked, lastSavedAt });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/checklist  (requires auth) body: { exam, docId, ticked }
  async updateTick(req, res, next) {
    try {
      const { exam = "tg-eapcet", docId, ticked } = req.body;
      if (!docId) return res.status(400).json({ error: "docId is required" });
      await checklistRepository.setDocTick(req.user.id, exam, docId, !!ticked);
      const lastSavedAt = await checklistRepository.getLastSavedAt(req.user.id, exam);
      res.json({ success: true, lastSavedAt });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/checklist/sync  (requires auth) body: { exam, tickedDocIds: [...] }
  async syncChecklist(req, res, next) {
    try {
      const { exam = "tg-eapcet", tickedDocIds = [] } = req.body;
      const result = await checklistRepository.replaceChecklistState(req.user.id, exam, tickedDocIds);
      res.json({ success: true, ticked: result.ticked, tickedDocIds: result.ticked, lastSavedAt: result.lastSavedAt });
    } catch (err) {
      next(err);
    }
  },
};
