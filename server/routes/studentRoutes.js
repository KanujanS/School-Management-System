import express from 'express';
import {
  getStudentsByClass,
  getStudentsByStream,
  addStudent,
  updateStudent,
  deleteStudent,
  changePassword
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Class-based routes
router.get('/class/:grade/:division', getStudentsByClass);

// Stream-based routes
router.get('/stream/:stream', getStudentsByStream);

// Student management routes
router.route('/')
  .post(addStudent);

router.route('/:id')
  .put(updateStudent)
  .delete(deleteStudent);

// Password management route
router.put('/:id/password', changePassword);

export default router; 