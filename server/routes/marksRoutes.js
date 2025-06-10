import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  addMarks,
  addBulkMarks,
  getMarks,
  getReportCard,
  deleteMarks
} from '../controllers/markController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Marks routes
router.route('/')
  .get(getMarks)
  .post(authorize('staff', 'admin'), addMarks);

router.route('/bulk')
  .post(authorize('staff', 'admin'), addBulkMarks);

router.route('/report/:studentId')
  .get(getReportCard);

router.route('/:id')
  .delete(authorize('staff', 'admin'), deleteMarks);

export default router; 