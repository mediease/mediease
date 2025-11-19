import express from 'express';
import { searchMedications, rateLimitMedicationSearch } from '../controllers/fhirMedication.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkApprovalStatus } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Require auth & approval
router.use(protect);
router.use(checkApprovalStatus);

// Medication search with lightweight rate limiting
router.get('/Medication/search', rateLimitMedicationSearch, searchMedications);

export default router;
