import express from 'express';
import {
  addAttendance,
  getAttendance,
  getAttendanceSummary
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes accessible by all authenticated users
router.get('/', getAttendance);
router.get('/summary', getAttendanceSummary);

// Routes only for staff and admin
router.post('/', authorize('staff', 'admin'), addAttendance);

export default router; 