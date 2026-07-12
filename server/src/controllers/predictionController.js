import { predictionService } from "../services/predictionService.js";
import { validatePredictInput } from "../validation/predictValidation.js";

export const predictionController = {
  async predict(req, res, next) {
    try {
      const errors = validatePredictInput(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      const results = await predictionService.predict(req.body);
      res.json({ count: results.length, results });
    } catch (err) {
      next(err);
    }
  },
};