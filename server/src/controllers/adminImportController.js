import { excelImportService } from "../services/excelImportService.js";

export const adminImportController = {
  async preview(req, res, next) {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const result = excelImportService.parseAndValidate(req.file.buffer);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async commit(req, res, next) {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const year = Number(req.body.year);
      if (!year) return res.status(400).json({ error: "year is required (e.g. 2025)" });
      const result = await excelImportService.commitImport(req.file.buffer, { year });
      res.json(result);
    } catch (err) {
      if (err.details) {
        return res.status(err.status ?? 400).json({ error: err.message, details: err.details });
      }
      next(err);
    }
  },
};