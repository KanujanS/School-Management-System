import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  login,
  register,
  createStaff,
  getAllStaff,
  getDashboardStats,
  getMe,
  updateStaff,
  removeStaff
} from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.use(protect);

// Get current user
router.get('/me', getMe);

// Admin only routes
router.use(admin);

// Staff management routes
router.route('/staff')
  .get(getAllStaff)
  .post(createStaff);

router.route('/staff/:id')
  .put(updateStaff)
  .delete(removeStaff);

// Dashboard stats
router.get('/dashboard-stats', getDashboardStats);

export default router; 