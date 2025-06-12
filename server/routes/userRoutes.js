import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getStudentsByClass, addTestStudents, deleteUser } from '../controllers/userController.js';

const router = express.Router();

// Protected routes
router.use(protect);

// Get students by class
router.get('/students/class/:className', getStudentsByClass);

// Add test students (admin only)
router.post('/students/test/:className', protect, admin, addTestStudents);

// Delete user (admin only)
router.delete('/:id', protect, admin, deleteUser);

export default router; 