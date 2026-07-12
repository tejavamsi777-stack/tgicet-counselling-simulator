import { adminAuthService } from "../services/adminAuthService.js";
import { validateAdminLoginInput, validateChangePasswordInput } from "../validation/adminAuthValidation.js";

export const adminAuthController = {
  async login(req, res, next) {
    try {
      const errors = validateAdminLoginInput(req.body);
      if (errors.length > 0) return res.status(400).json({ errors });
      const result = await adminAuthService.login(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
  async me(req, res) {
    res.json({ authenticated: true, admin: req.admin });
  },
  async changePassword(req, res, next) {
    try {
      const errors = validateChangePasswordInput(req.body);
      if (errors.length > 0) return res.status(400).json({ errors });
      await adminAuthService.changePassword({
        adminId: req.admin.id,
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
      });
      res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
      next(err);
    }
  },
};