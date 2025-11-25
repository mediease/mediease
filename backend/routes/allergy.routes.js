import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, checkApprovalStatus } from '../middleware/roleMiddleware.js';
import {
  createAllergy,
  getAllergiesForPatient,
  getAllergyById,
  deleteAllergy,
  getAllergiesSummary
} from '../controllers/allergy.controller.js';

const router = express.Router();

/**
 * All allergy endpoints require authentication and approval
 */
router.use(protect);
router.use(checkApprovalStatus);

/**
 * POST /fhir/AllergyIntolerance
 * Create new allergy (Doctor or Nurse only)
 */
router.post('/AllergyIntolerance', authorize('doctor', 'nurse'), createAllergy);

/**
 * GET /fhir/AllergyIntolerance/patient/:patientPhn
 * Get all allergies for a patient in FHIR Bundle format (Doctor, Nurse, Admin)
 */
router.get('/AllergyIntolerance/patient/:patientPhn', authorize('doctor', 'nurse', 'admin'), getAllergiesForPatient);

/**
 * GET /fhir/AllergyIntolerance/summary/patient/:patientPhn
 * Get allergies summary for a patient (Doctor, Nurse, Admin)
 */
router.get('/AllergyIntolerance/summary/patient/:patientPhn', authorize('doctor', 'nurse', 'admin'), getAllergiesSummary);

/**
 * GET /fhir/AllergyIntolerance/:allergyId
 * Get single allergy by ID (Doctor, Nurse, Admin)
 */
router.get('/AllergyIntolerance/:allergyId', authorize('doctor', 'nurse', 'admin'), getAllergyById);

/**
 * DELETE /fhir/AllergyIntolerance/:allergyId
 * Delete allergy (Doctor, Nurse, Admin)
 */
router.delete('/AllergyIntolerance/:allergyId', authorize('doctor', 'nurse', 'admin'), deleteAllergy);

export default router;
