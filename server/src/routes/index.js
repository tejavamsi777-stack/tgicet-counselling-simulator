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
import { activityController } from "../controllers/activityController.js";
import { adminYearController } from "../controllers/adminYearController.js";
import { adminCutoffController } from "../controllers/adminCutoffController.js";
import { examController } from "../controllers/examController.js";
import { eapcetController } from "../controllers/eapcetController.js";
import { ecetController } from "../controllers/ecetController.js";
import { icetController } from "../controllers/icetController.js";
import polycetRoutes from "./polycetRoutes.js";
import { checklistController } from "../controllers/checklistController.js";
import { reviewController } from "../controllers/reviewController.js";

export const router = Router();

// ---------- TG POLYCET Module Routes ----------
router.use("/polycet", polycetRoutes);

// ---------- Public ----------
router.get("/exams", examController.list);
router.get("/districts", referenceController.districts);
router.get("/courses", referenceController.courses);
router.get("/categories", referenceController.categories);
router.get("/years", referenceController.years);
router.get("/colleges", collegeController.list);
router.post("/predict", predictionController.predict);
router.post("/log-activity", optionalAuth, activityController.log);

// ---------- TG EAPCET Public Counselling Data (no auth required) ----------
router.get("/eapcet/counselling-data", eapcetController.getCounsellingData);
router.get("/eapcet/notifications", eapcetController.getNotifications);
router.get("/eapcet/colleges", eapcetController.getInstitutions);
router.get("/eapcet/colleges/:code", eapcetController.getInstitutionByCode);
router.get("/eapcet/colleges/:code/branches", eapcetController.getCollegeBranches);
router.get("/eapcet/compare", eapcetController.compareInstitutions);
router.get("/eapcet/allotments/meta", eapcetController.getAllotmentMeta);
router.get("/eapcet/allotments", eapcetController.getAllotmentData);

// ---------- AP EAPCET Public Counselling Data ----------
router.get("/ap-eapcet/counselling-data", eapcetController.getCounsellingData);
router.get("/ap-eapcet/notifications", eapcetController.getNotifications);
router.get("/ap-eapcet/colleges", eapcetController.getInstitutions);
router.get("/ap-eapcet/colleges/:code", eapcetController.getInstitutionByCode);
router.get("/ap-eapcet/colleges/:code/branches", eapcetController.getCollegeBranches);
router.get("/ap-eapcet/compare", eapcetController.compareInstitutions);
router.get("/ap-eapcet/allotments/meta", eapcetController.getAllotmentMeta);
router.get("/ap-eapcet/allotments", eapcetController.getAllotmentData);

// ---------- KCET Data ----------
router.get("/kcet/allotments/meta", eapcetController.getAllotmentMeta);
router.get("/kcet/allotments", eapcetController.getAllotmentData);

// ---------- TG ECET Data ----------
router.get("/ecet/counselling-data", ecetController.getCounsellingData);
router.get("/ecet/notifications", ecetController.getNotifications);
router.post("/ecet/refresh", requireAdminAuth, ecetController.refreshNotifications);
router.get("/ecet/colleges", ecetController.getInstitutions);
router.get("/ecet/colleges/:code", ecetController.getInstitutionByCode);
router.get("/ecet/colleges/:code/branches", ecetController.getCollegeBranches);
router.get("/ecet/compare", ecetController.compareInstitutions);
router.get("/ecet/allotments/meta", ecetController.getAllotmentMeta);
router.get("/ecet/allotments", ecetController.getAllotmentData);

// ---------- TG ICET Data ----------
router.get("/icet/counselling-data", icetController.getCounsellingData);
router.get("/icet/notifications", icetController.getNotifications);
router.get("/icet/colleges", icetController.getColleges);
router.get("/icet/colleges/:code", icetController.getCollegeByCode);
router.get("/icet/colleges/:code/branches", icetController.getCollegeBranches);
router.get("/icet/compare", icetController.compareColleges);
router.get("/icet/allotments/meta", icetController.getAllotmentMeta);
router.get("/icet/allotments", icetController.getAllotmentData);
router.post("/icet/refresh", requireAdminAuth, icetController.triggerRefresh);



// ---------- Student auth ----------
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/google", authController.google);
router.get("/auth/me", optionalAuth, authController.me);
router.post("/auth/forgot-password", authController.forgotPassword);
router.post("/auth/reset-password", authController.resetPassword);
router.patch("/auth/profile", requireAuth, authController.updateProfile);
router.patch("/auth/password", requireAuth, authController.changePassword);

// ---------- User Document Checklist (requires login) ----------
router.get("/checklist", requireAuth, checklistController.getChecklist);
router.patch("/checklist", requireAuth, checklistController.updateTick);
router.post("/checklist/sync", requireAuth, checklistController.syncChecklist);

// ---------- App Reviews & Feedback ----------
router.post("/reviews", optionalAuth, reviewController.submit);
router.get("/reviews/featured", reviewController.getFeatured);

// ---------- Admin auth ----------
router.post("/admin/auth/login", adminAuthController.login);
router.get("/admin/auth/me", requireAdminAuth, adminAuthController.me);
router.patch("/admin/auth/password", requireAdminAuth, adminAuthController.changePassword);
router.get("/admin/years", requireAdminAuth, adminYearController.list);
router.patch("/admin/years/:id/active", requireAdminAuth, requireRole("super_admin", "admin"), adminYearController.setActive);
router.delete("/admin/years/:id", requireAdminAuth, requireRole("super_admin", "admin"), adminYearController.remove);
router.get("/admin/dashboard/stats", requireAdminAuth, adminDashboardController.stats);

// ---------- Admin: EAPCET Scrape Trigger & Allotment Ingestion ----------
router.post("/admin/eapcet/refresh", requireAdminAuth, eapcetController.triggerRefresh);
router.post("/admin/eapcet/allotments/fetch-live", requireAdminAuth, requireRole("super_admin", "admin"), eapcetController.fetchOfficialAllotmentLive);
router.post("/admin/eapcet/allotments/preview", requireAdminAuth, requireRole("super_admin", "admin"), eapcetController.previewAllotmentImport);
router.post("/admin/eapcet/allotments/commit", requireAdminAuth, requireRole("super_admin", "admin"), eapcetController.commitAllotmentImport);

// ---------- Admin: College CRUD ----------
router.get("/admin/colleges", requireAdminAuth, adminCollegeController.list);
router.get("/admin/colleges/:id", requireAdminAuth, adminCollegeController.getById);
router.post("/admin/colleges", requireAdminAuth, requireRole("super_admin", "admin", "editor"), adminCollegeController.create);
router.put("/admin/colleges/:id", requireAdminAuth, requireRole("super_admin", "admin", "editor"), adminCollegeController.update);
router.patch("/admin/colleges/:id/active", requireAdminAuth, requireRole("super_admin", "admin", "editor"), adminCollegeController.setActive);
router.delete("/admin/colleges/:id", requireAdminAuth, requireRole("super_admin", "admin"), adminCollegeController.remove);

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

// ---------- Admin: Cutoff CRUD ----------
router.get("/admin/cutoffs", requireAdminAuth, adminCutoffController.list);
router.get("/admin/cutoffs/:id", requireAdminAuth, adminCutoffController.getById);
router.post("/admin/cutoffs", requireAdminAuth, requireRole("super_admin", "admin", "editor"), adminCutoffController.create);
router.put("/admin/cutoffs/:id", requireAdminAuth, requireRole("super_admin", "admin", "editor"), adminCutoffController.update);
router.delete("/admin/cutoffs/:id", requireAdminAuth, requireRole("super_admin"), adminCutoffController.remove);

// ---------- Admin: Excel Import ----------
router.post("/admin/import/preview", requireAdminAuth, requireRole("super_admin", "admin"), upload.single("file"), adminImportController.preview);
router.post("/admin/import/commit", requireAdminAuth, requireRole("super_admin", "admin"), upload.single("file"), adminImportController.commit);
