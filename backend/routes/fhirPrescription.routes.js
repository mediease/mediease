import express from 'express';
import {
  createPrescription,
  getPrescriptionsByPatient,
  getPrescriptionsByDoctor,
  validatePrescriptionDraft,
  validateAndGenerateQR,
  getQRCode,
} from '../controllers/fhirPrescription.controller.js';

const router = express.Router();

// AI validate only (no save)
router.post('/MedicationRequest/validate', validatePrescriptionDraft);

// Create & save prescription
router.post('/MedicationRequest', createPrescription);

// Validate a saved prescription + generate QR  (POST /fhir/MedicationRequest/:prescriptionId/validate)
router.post('/MedicationRequest/:prescriptionId/validate', validateAndGenerateQR);

// Retrieve stored QR code  (GET /fhir/MedicationRequest/:prescriptionId/qrcode)
router.get('/MedicationRequest/:prescriptionId/qrcode', getQRCode);

// Query prescriptions — these must come AFTER the specific routes above
router.get('/MedicationRequest/doctor/:medicalLicenseId', getPrescriptionsByDoctor);
router.get('/MedicationRequest/:patientPhn', getPrescriptionsByPatient);

export default router;
