import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createAttendance, getAttendance, getAttendanceById, updateAttendance, deleteAttendance } from '../controllers/attendanceController.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAttendance)
  .post(createAttendance);

router
  .route('/:id')
  .get(getAttendanceById)
  .put(updateAttendance)
  .delete(deleteAttendance);

export default router;