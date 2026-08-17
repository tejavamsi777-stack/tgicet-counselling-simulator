import express from 'express';
import { polycetController } from '../controllers/polycetController.js';

const router = express.Router();

// Metadata & Notifications
router.get('/counselling-data', polycetController.getCounsellingData);
router.get('/notifications', polycetController.getNotifications);
router.post('/refresh', polycetController.refreshNotifications);

// Colleges & Matrix
router.get('/colleges', polycetController.getColleges);
router.get('/compare', polycetController.compareColleges);

// Allotments
router.get('/allotments/summary', polycetController.getAllotmentsSummary);
router.get('/allotments/:collegeCode', polycetController.getCollegeAllotments);

export default router;
