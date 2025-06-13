import express from 'express';
import { 
    getClasses, 
    getStudentsByClass, 
    addMarks, 
    updateMarks, 
    deleteMarks, 
    getStudentMarks,
    getAllMarks 
} from '../controllers/markController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Route accessible by all authenticated users (including students)
router.get('/student/:studentId', getStudentMarks);

// Routes accessible by staff and admin only
router.use(authorize('staff', 'admin'));

// Get classes for mark entry
router.get('/classes', getClasses);

// Get students by class
router.get('/students/:classId', getStudentsByClass);

// Add marks
router.post('/add', addMarks);

// Update marks
router.patch('/:markId', updateMarks);

// Delete marks
router.delete('/:markId', deleteMarks);

// Get all marks
router.get('/', getAllMarks);

export default router;
