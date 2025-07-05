import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  createAttendance, 
  getAttendance, 
  getAttendanceById, 
  updateAttendance, 
  deleteAttendance,
  getStudentAttendance
} from '../controllers/attendanceController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAttendance)
  .post(createAttendance);

// Add this new route for student attendance
router.route('/student')
  .get(getStudentAttendance);

router.route('/:id')
  .get(getAttendanceById)
  .put(updateAttendance)
  .delete(deleteAttendance);

export default router;