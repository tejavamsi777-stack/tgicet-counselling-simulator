export function createLookupController(repository, resourceName) {
  return {
    async list(req, res, next) {
      try {
        res.json(await repository.list());
      } catch (err) {
        next(err);
      }
    },
    async create(req, res, next) {
      try {
        const { code, name } = req.body;
        if (!code || !name) {
          return res.status(400).json({ errors: ["code and name are required"] });
        }
        const existing = await repository.findByCode(code);
        if (existing) {
          return res.status(409).json({ error: `${resourceName} code '${code}' already exists` });
        }
        const created = await repository.create({ code, name });
        res.status(201).json(created);
      } catch (err) {
        next(err);
      }
    },
    async update(req, res, next) {
      try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ errors: ["name is required"] });
        const updated = await repository.update(Number(req.params.id), { name });
        if (!updated) return res.status(404).json({ error: `${resourceName} not found` });
        res.json(updated);
      } catch (err) {
        next(err);
      }
    },
    async remove(req, res, next) {
      try {
        const deleted = await repository.remove(Number(req.params.id));
        if (!deleted) return res.status(404).json({ error: `${resourceName} not found` });
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },
  };
}