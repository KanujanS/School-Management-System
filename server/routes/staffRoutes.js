import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { 
  getAllStaff, 
  getStaffById, 
  createStaff, 
  updateStaff, 
  deleteStaff 
} from '../controllers/staffController.js';

const router = express.Router();

// Staff management routes
router.route('/')
  .get(protect, admin, getAllStaff)
  .post(protect, admin, createStaff);

router.route('/:id')
  .get(protect, admin, getStaffById)
  .put(protect, admin, updateStaff)
  .delete(protect, admin, deleteStaff);

// Add error handling middleware
router.use((err, req, res, next) => {
  console.error('Staff routes error:', err);
  res.status(500).json({ message: 'Error in staff routes' });
});

export default router;
