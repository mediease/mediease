import express from 'express';
import {
  register,
  login,
  approveDoctor,
  approveNurse,
  approveLabAssistant,
  rejectUser,
  getPendingUsers
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', (req, res, next) => {
  const { role } = req.body;
  if (!role || !['doctor', 'nurse', 'admin', 'lab_assistant'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Role is required and must be doctor, nurse, lab_assistant, or admin'
    });
  }
  next();
}, login);

// Admin routes
router.put('/approve/doctor/:medicalLicenseId', protect, adminOnly, approveDoctor);
router.put('/approve/nurse/:nurId', protect, adminOnly, approveNurse);
router.put('/approve/lab-assistant/:labId', protect, adminOnly, approveLabAssistant);
router.put('/reject/:userId', protect, adminOnly, rejectUser);
router.get('/pending-users', protect, adminOnly, getPendingUsers);

export default router;
