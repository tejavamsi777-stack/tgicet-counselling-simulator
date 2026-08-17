import { checklistRepository } from "../repositories/checklistRepository.js";

export const checklistController = {
  // GET /api/checklist?exam=tg-eapcet  (requires auth)
  async getChecklist(req, res, next) {
    try {
      const examSlug = req.query.exam || "tg-eapcet";
      const ticked = await checklistRepository.getTickedDocs(req.user.id, examSlug);
      res.json({ success: true, ticked });
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
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/checklist/sync  (requires auth) body: { exam, tickedDocIds: [...] }
  // Called on login to sync any localStorage ticks into the account
  async syncChecklist(req, res, next) {
    try {
      const { exam = "tg-eapcet", tickedDocIds = [] } = req.body;
      await checklistRepository.bulkSetDocs(req.user.id, exam, tickedDocIds);
      const ticked = await checklistRepository.getTickedDocs(req.user.id, exam);
      res.json({ success: true, ticked });
    } catch (err) {
      next(err);
    }
  },
};
