import express from 'express';
import { 
  addMarks,
  addBulkMarks,
  getMarks,
  getReportCard,
  deleteMarks
} from '../controllers/markController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Protect all routes

router
  .route('/')
  .post(authorize('staff', 'admin'), addMarks)
  .get(getMarks);

router
  .route('/bulk')
  .post(authorize('staff', 'admin'), addBulkMarks);

router
  .route('/report/:studentId')
  .get(getReportCard);

router
  .route('/:id')
  .delete(authorize('staff', 'admin'), deleteMarks);

export default router; 