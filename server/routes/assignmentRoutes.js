import express from 'express';
import { 
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment
} from '../controllers/assignmentController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect); // Protect all routes

router
  .route('/')
  .post(authorize('staff', 'admin'), createAssignment)
  .get(getAssignments);

router
  .route('/:id')
  .get(getAssignment)
  .put(authorize('staff', 'admin'), updateAssignment)
  .delete(authorize('staff', 'admin'), deleteAssignment);

export default router; 