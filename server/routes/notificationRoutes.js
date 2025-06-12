import express from 'express';
import {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  markAsRead
} from '../controllers/notificationController.js';
import { protect, admin, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Routes
router.route('/')
  .get(getNotifications)
  .post(authorize('admin', 'staff'), createNotification);

router.route('/:id')
  .get(getNotificationById)
  .put(admin, updateNotification)
  .delete(protect, deleteNotification);

router.put('/:id/mark-read', markAsRead);

export default router; 