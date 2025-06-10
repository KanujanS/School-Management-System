import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  downloadAssignment
} from '../controllers/assignmentController.js';

const router = express.Router();

// Place the download route before the :id routes to prevent conflicts
router.get('/download/:filename', protect, downloadAssignment);

// Assignment routes
router.route('/')
  .get(protect, getAssignments)
  .post(protect, createAssignment);

router.route('/:id')
  .get(protect, getAssignmentById)
  .put(protect, updateAssignment)
  .delete(protect, deleteAssignment);

export default router; 