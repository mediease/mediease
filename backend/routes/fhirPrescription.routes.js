import express from 'express';
import {
  createPrescription,
  getPrescriptionsByPatient,
  getPrescriptionsByDoctor,
  validatePrescriptionDraft
} from '../controllers/fhirPrescription.controller.js';

const router = express.Router();

// AI validate only (no save)
router.post('/MedicationRequest/validate', validatePrescriptionDraft);

// Create & save prescription
router.post('/MedicationRequest', createPrescription);

// Query prescriptions
router.get('/MedicationRequest/:patientPhn', getPrescriptionsByPatient);
router.get('/MedicationRequest/doctor/:medicalLicenseId', getPrescriptionsByDoctor);

export default router;
