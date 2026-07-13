import { authService } from "../services/authService.js";
import { googleAuthService } from "../services/googleAuthService.js";
import { validateRegisterInput, validateLoginInput } from "../validation/authValidation.js";
export const authController = {
  async register(req, res, next) {
    try {
      const errors = validateRegisterInput(req.body);
      if (errors.length > 0) return res.status(400).json({ errors });
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
  async login(req, res, next) {
    try {
      const errors = validateLoginInput(req.body);
      if (errors.length > 0) return res.status(400).json({ errors });
      const result = await authService.login(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
 async me(req, res) {
    // req.user is set by optionalAuth middleware if a valid token was sent
    if (!req.user) return res.json({ authenticated: false });
    res.json({ authenticated: true, user: req.user });
  },
  async google(req, res, next) {
    try {
      if (!req.body.idToken) {
        return res.status(400).json({ errors: ["idToken is required"] });
      }
      const result = await googleAuthService.loginWithGoogle(req.body.idToken);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};