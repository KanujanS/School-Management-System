import express from 'express';
import { register, login, getMe, getAllStaff, removeStaff, updateStaffStatus, getDashboardStats } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

// Admin only routes
router.get('/dashboard-stats', protect, authorize('admin'), getDashboardStats);
router.get('/staff', protect, authorize('admin'), getAllStaff);
router.delete('/staff/:id', protect, authorize('admin'), removeStaff);
router.patch('/staff/:id/status', protect, authorize('admin'), updateStaffStatus);

export default router; 