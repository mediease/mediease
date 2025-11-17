import express from 'express';
import {
  createPatient,
  getPatient,
  searchPatients,
  updatePatient,
  deletePatient
} from '../controllers/fhirPatient.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkApprovalStatus, adminOnly } from '../middleware/roleMiddleware.js';
import { validatePatientData } from '../middleware/fhirValidationMiddleware.js';

const router = express.Router();

// All routes require authentication and approval
router.use(protect);
router.use(checkApprovalStatus);

// Create patient
router.post('/Patient', validatePatientData, createPatient);

// Get patients (search)
router.get('/Patient', searchPatients);

// Get single patient
router.get('/Patient/:id', getPatient);

// Update patient
router.put('/Patient/:id', updatePatient);

// Delete patient (admin only)
router.delete('/Patient/:id', adminOnly, deletePatient);

export default router;
