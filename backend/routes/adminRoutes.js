import express from 'express';
import { 
  getPendingDoctors, 
  approveDoctor, 
  rejectDoctor, 
  getPendingNurses,
  approveNurse,
  rejectNurse,
  getAllUsers 
} from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// GET /api/admin/pending-doctors - Get all pending doctors
router.get('/pending-doctors', getPendingDoctors);

// PUT /api/admin/approve/:id - Approve doctor registration
router.put('/approve/:id', approveDoctor);

// PUT /api/admin/reject/:id - Reject doctor registration
router.put('/reject/:id', rejectDoctor);

// GET /api/admin/pending-nurses - Get all pending nurses
router.get('/pending-nurses', getPendingNurses);

// PUT /api/admin/approve-nurse/:id - Approve nurse registration
router.put('/approve-nurse/:id', approveNurse);

// PUT /api/admin/reject-nurse/:id - Reject nurse registration
router.put('/reject-nurse/:id', rejectNurse);

// GET /api/admin/users - Get all users
router.get('/users', getAllUsers);

export default router;

