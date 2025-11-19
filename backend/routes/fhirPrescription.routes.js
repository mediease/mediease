import express from 'express';
import { createPrescription, getPrescriptionsByPatient, getPrescriptionsByDoctor } from '../controllers/fhirPrescription.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkApprovalStatus } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Auth & approval required
router.use(protect);
router.use(checkApprovalStatus);

// Create one or multiple MedicationRequest resources
router.post('/MedicationRequest', createPrescription);

// Get prescriptions by patient PHN
router.get('/MedicationRequest/:patientPhn', getPrescriptionsByPatient);

// Get prescriptions by doctor medicalLicenseId
router.get('/MedicationRequest/doctor/:medicalLicenseId', getPrescriptionsByDoctor);

export default router;
