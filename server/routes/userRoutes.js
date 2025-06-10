import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getStudentsByClass } from '../controllers/attendanceController.js';

const router = express.Router();

// Protected routes
router.use(protect);

// Get students by class
router.get('/students', getStudentsByClass);

export default router; 