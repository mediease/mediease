import express from 'express';
import {
  register,
  login,
  approveDoctor,
  approveNurse,
  rejectUser,
  getPendingUsers
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Admin routes
router.put('/approve/doctor/:medicalLicenseId', protect, adminOnly, approveDoctor);
router.put('/approve/nurse/:nurId', protect, adminOnly, approveNurse);
router.put('/reject/:userId', protect, adminOnly, rejectUser);
router.get('/pending-users', protect, adminOnly, getPendingUsers);

export default router;
