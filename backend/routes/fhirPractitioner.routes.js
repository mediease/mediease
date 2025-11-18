import express from 'express';
import {
  createPractitioner,
  getPractitioner,
  searchPractitioners,
  updatePractitioner,
  deletePractitioner
} from '../controllers/fhirPractitioner.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkApprovalStatus, adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create practitioner (admin only - usually done during approval)
router.post('/Practitioner', adminOnly, createPractitioner);

// Get practitioners (search) - requires approval
router.get('/Practitioner', checkApprovalStatus, searchPractitioners);

// Get single practitioner - requires approval
router.get('/Practitioner/:id', checkApprovalStatus, getPractitioner);

// Update practitioner (admin only)
router.put('/Practitioner/:id', adminOnly, updatePractitioner);

// Delete practitioner (admin only)
router.delete('/Practitioner/:id', adminOnly, deletePractitioner);

export default router;
