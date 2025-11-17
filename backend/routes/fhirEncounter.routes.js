import express from 'express';
import {
  startWalkInEncounter,
  startAppointmentEncounter,
  getEncounter,
  updateEncounter,
  getAllEncounters
} from '../controllers/fhirEncounter.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { doctorOnly, adminOnly, checkApprovalStatus } from '../middleware/roleMiddleware.js';
import { validateEncounterData } from '../middleware/fhirValidationMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Clinic routes - doctor only
router.post('/start/:phn', doctorOnly, validateEncounterData, startWalkInEncounter);
router.post('/start-appointment/:apid', doctorOnly, validateEncounterData, startAppointmentEncounter);

// FHIR Encounter routes
router.get('/Encounter/:id', checkApprovalStatus, getEncounter);
router.get('/Encounter', checkApprovalStatus, getEncounter);

// Update encounter (doctor only)
router.put('/Encounter/:id', doctorOnly, updateEncounter);

// Get all encounters (admin only)
router.get('/encounters/all', adminOnly, getAllEncounters);

export default router;
