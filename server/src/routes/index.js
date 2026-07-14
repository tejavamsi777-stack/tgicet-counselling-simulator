import { Router } from "express";
import { referenceController } from "../controllers/referenceController.js";
import { collegeController } from "../controllers/collegeController.js";
import { predictionController } from "../controllers/predictionController.js";
import { authController } from "../controllers/authController.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { adminAuthController } from "../controllers/adminAuthController.js";
import { requireAdminAuth, requireRole } from "../middleware/requireAdminAuth.js";
import { adminCollegeController } from "../controllers/adminCollegeController.js";
import { createLookupRepository } from "../repositories/simpleLookupRepository.js";
import { createLookupController } from "../controllers/lookupController.js";
import { adminImportController } from "../controllers/adminImportController.js";
import { upload } from "../middleware/upload.js";
import { adminDashboardController } from "../controllers/adminDashboardController.js";

export const router = Router();

// ---------- Public ----------
router.get("/districts", referenceController.districts);
router.get("/courses", referenceController.courses);
router.get("/categories", referenceController.categories);
router.get("/years", referenceController.years);
router.get("/colleges", collegeController.list);
router.post("/predict", predictionController.predict);

// ---------- Student auth (optional) ----------
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/google", authController.google);
router.get("/auth/me", optionalAuth, authController.me);

// ---------- Student auth (requires login) ----------
router.patch("/auth/profile", requireAuth, authController.updateProfile);
router.patch("/auth/password", requireAuth, authController.changePassword);

// ---------- Admin auth ----------
router.post("/admin/auth/login", adminAuthController.login);
router.get("/admin/auth/me", requireAdminAuth, adminAuthController.me);
router.patch("/admin/auth/password", requireAdminAuth, adminAuthController.changePassword);
router.get("/admin/dashboard/stats", requireAdminAuth, adminDashboardController.stats);

// ---------- Admin: College CRUD ----------
// Anyone with a valid admin token can view; only super_admin/admin/editor can write
router.get("/admin/colleges", requireAdminAuth, adminCollegeController.list);
router.get("/admin/colleges/:id", requireAdminAuth, adminCollegeController.getById);
router.post(
  "/admin/colleges",
  requireAdminAuth,
  requireRole("super_admin", "admin", "editor"),
  adminCollegeController.create
);
router.put(
  "/admin/colleges/:id",
  requireAdminAuth,
  requireRole("super_admin", "admin", "editor"),
  adminCollegeController.update
);
router.patch(
  "/admin/colleges/:id/active",
  requireAdminAuth,
  requireRole("super_admin", "admin", "editor"),
  adminCollegeController.setActive
);
router.delete(
  "/admin/colleges/:id",
  requireAdminAuth,
  requireRole("super_admin", "admin"),
  adminCollegeController.remove
);

// ---------- Admin: Courses / Districts / Categories CRUD ----------
const courseLookup = createLookupRepository("courses");
const courseLookupController = createLookupController(courseLookup, "Course");
router.get("/admin/lookups/courses", requireAdminAuth, courseLookupController.list);
router.post("/admin/lookups/courses", requireAdminAuth, requireRole("super_admin", "admin"), courseLookupController.create);
router.put("/admin/lookups/courses/:id", requireAdminAuth, requireRole("super_admin", "admin"), courseLookupController.update);
router.delete("/admin/lookups/courses/:id", requireAdminAuth, requireRole("super_admin"), courseLookupController.remove);

const districtLookup = createLookupRepository("districts");
const districtLookupController = createLookupController(districtLookup, "District");
router.get("/admin/lookups/districts", requireAdminAuth, districtLookupController.list);
router.post("/admin/lookups/districts", requireAdminAuth, requireRole("super_admin", "admin"), districtLookupController.create);
router.put("/admin/lookups/districts/:id", requireAdminAuth, requireRole("super_admin", "admin"), districtLookupController.update);
router.delete("/admin/lookups/districts/:id", requireAdminAuth, requireRole("super_admin"), districtLookupController.remove);

const categoryLookup = createLookupRepository("categories");
const categoryLookupController = createLookupController(categoryLookup, "Category");
router.get("/admin/lookups/categories", requireAdminAuth, categoryLookupController.list);
router.post("/admin/lookups/categories", requireAdminAuth, requireRole("super_admin", "admin"), categoryLookupController.create);
router.put("/admin/lookups/categories/:id", requireAdminAuth, requireRole("super_admin", "admin"), categoryLookupController.update);
router.delete("/admin/lookups/categories/:id", requireAdminAuth, requireRole("super_admin"), categoryLookupController.remove);

// ---------- Admin: Excel Import ----------
router.post(
  "/admin/import/preview",
  requireAdminAuth,
  requireRole("super_admin", "admin"),
  upload.single("file"),
  adminImportController.preview
);
router.post(
  "/admin/import/commit",
  requireAdminAuth,
  requireRole("super_admin", "admin"),
  upload.single("file"),
  adminImportController.commit
);