import { adminCutoffService } from "../services/adminCutoffService.js";
import { validateCutoffInput } from "../validation/adminCutoffValidation.js";

export const adminCutoffController = {
  async list(req, res, next) {
    try {
      const { search, course, category, gender, year, page, pageSize } = req.query;
      const result = await adminCutoffService.list({
        search,
        courseCode: course,
        categoryCode: category,
        gender,
        year: year ? Number(year) : undefined,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 50,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const cutoff = await adminCutoffService.getById(Number(req.params.id));
      if (!cutoff) return res.status(404).json({ error: "Cutoff not found" });
      res.json(cutoff);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const errors = validateCutoffInput(req.body);
      if (errors.length > 0) return res.status(400).json({ errors });
      const cutoff = await adminCutoffService.create(req.body);
      res.status(201).json(cutoff);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const errors = validateCutoffInput(req.body, { isUpdate: true });
      if (errors.length > 0) return res.status(400).json({ errors });
      const cutoff = await adminCutoffService.update(Number(req.params.id), req.body);
      res.json(cutoff);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      await adminCutoffService.remove(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};