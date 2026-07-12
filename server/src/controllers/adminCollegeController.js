import { adminCollegeService } from "../services/adminCollegeService.js";
import { validateCollegeInput } from "../validation/adminCollegeValidation.js";

export const adminCollegeController = {
  async list(req, res, next) {
    try {
      const { search, isActive, page, pageSize } = req.query;
      const result = await adminCollegeService.list({
        search,
        isActive: isActive === undefined ? undefined : isActive === "true",
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
      const college = await adminCollegeService.getById(Number(req.params.id));
      if (!college) return res.status(404).json({ error: "College not found" });
      res.json(college);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const errors = validateCollegeInput(req.body);
      if (errors.length > 0) return res.status(400).json({ errors });
      const college = await adminCollegeService.create(req.body);
      res.status(201).json(college);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const errors = validateCollegeInput(req.body, { isUpdate: true });
      if (errors.length > 0) return res.status(400).json({ errors });
      const college = await adminCollegeService.update(Number(req.params.id), req.body);
      res.json(college);
    } catch (err) {
      next(err);
    }
  },

  async setActive(req, res, next) {
    try {
      const college = await adminCollegeService.setActive(Number(req.params.id), req.body.isActive);
      res.json(college);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      await adminCollegeService.remove(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};